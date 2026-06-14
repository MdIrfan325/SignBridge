from __future__ import annotations

from math import exp
from pathlib import Path
from typing import Any, Sequence

from .base import BaseRecognitionModel, PredictionCandidate
from .config import ModelConfig

try:  # pragma: no cover - optional dependency
    import torch
except Exception:  # pragma: no cover - optional dependency
    torch = None


class OpenHandsRecognitionModel(BaseRecognitionModel):
    name = "openhands"

    def __init__(self, config: ModelConfig, labels: list[str], bundle: Any) -> None:
        super().__init__(labels)
        self.config = config
        self.bundle = bundle
        self._model: Any = None
        self._num_points = 27

    def _build_model(self, num_classes: int) -> Any:
        if torch is None:
            return None

        class AttentionBlock(torch.nn.Module):
            def __init__(self) -> None:
                super().__init__()
                self.fc1 = torch.nn.Linear(256, 256, bias=False)
                self.fc2 = torch.nn.Linear(512, 256, bias=False)

            def forward(self, sequence: Any) -> Any:
                query = torch.tanh(self.fc1(sequence.mean(dim=1)))
                query = query.unsqueeze(1).expand(-1, sequence.size(1), -1)
                combined = torch.cat([sequence, query], dim=-1)
                energy = torch.tanh(self.fc2(combined))
                weights = torch.softmax(energy.mean(dim=-1), dim=1).unsqueeze(-1)
                pooled = (sequence * weights).sum(dim=1)
                return pooled

        class Decoder(torch.nn.Module):
            def __init__(self) -> None:
                super().__init__()
                self.rnn = torch.nn.LSTM(
                    input_size=54,
                    hidden_size=128,
                    num_layers=4,
                    bidirectional=True,
                    batch_first=True,
                )
                self.attn_block = AttentionBlock()
                self.fc = torch.nn.Linear(256, num_classes)

            def forward(self, sequence: Any) -> Any:
                rnn_output, _ = self.rnn(sequence)
                pooled = self.attn_block(rnn_output)
                return self.fc(pooled)

        class PoseEncoder(torch.nn.Module):
            def __init__(self, point_count: int) -> None:
                super().__init__()
                self.point_count = point_count
                self.decoder = Decoder()

            def forward(self, x: Any) -> Any:
                if x.ndim != 4:
                    raise ValueError(f"Expected pose tensor with shape (batch, sequence, points, coords); got {tuple(x.shape)}")
                batch_size, sequence_length, num_points, coords = x.shape
                if num_points != self.point_count or coords != 2:
                    raise ValueError(f"Expected {self.point_count} points with 2 coordinates; got {num_points}x{coords}")
                sequence = x.reshape(batch_size, sequence_length, num_points * coords)
                return self.decoder(sequence)

        return PoseEncoder(self._num_points)

    def load(self) -> bool:
        if torch is None:
            self.loaded = False
            return False

        if not self.bundle.model_path or not Path(self.bundle.model_path).exists():
            self.loaded = False
            return False

        model_path = Path(self.bundle.model_path)
        try:
            checkpoint = torch.load(str(model_path), map_location=self.config.device, weights_only=False)
            state_dict = checkpoint.get("state_dict", checkpoint) if isinstance(checkpoint, dict) else checkpoint
            if not isinstance(state_dict, dict):
                raise TypeError("Checkpoint did not contain a state_dict")

            num_classes = len(self.labels)
            self._model = self._build_model(num_classes)
            if self._model is None:
                raise RuntimeError("Torch is unavailable")

            cleaned_state: dict[str, Any] = {}
            for key, value in state_dict.items():
                cleaned_key = key.replace("model.", "", 1)
                cleaned_state[cleaned_key] = value

            load_result = self._model.load_state_dict(cleaned_state, strict=False)
            if load_result.missing_keys:
                missing = ", ".join(load_result.missing_keys[:5])
                raise RuntimeError(f"checkpoint missing expected weights: {missing}")

            self._model.to(self.config.device)
            self._model.eval()

            self.loaded = True
            return True
        except Exception:
            self._model = None
            self.loaded = False
            return False

    def _coerce_logits(self, output: Any) -> list[float]:
        if output is None:
            return []

        if torch is not None and isinstance(output, torch.Tensor):
            tensor = output.detach().flatten().float()
            return tensor.tolist()

        if isinstance(output, dict):
            for key in ("logits", "scores", "probabilities", "output"):
                if key in output:
                    return self._coerce_logits(output[key])

        if isinstance(output, (list, tuple)):
            if output and isinstance(output[0], (list, tuple)):
                return self._coerce_logits(output[0])
            try:
                return [float(item) for item in output]
            except (TypeError, ValueError):
                return []

        try:
            return [float(output)]
        except (TypeError, ValueError):
            return []

    def _softmax(self, values: Sequence[float]) -> list[float]:
        if not values:
            return []

        max_value = max(values)
        exponentials = [exp(value - max_value) for value in values]
        total = sum(exponentials)
        if total <= 0:
            return []

        return [value / total for value in exponentials]

    def unload(self) -> None:
        if self._model is not None and hasattr(self._model, "to"):
            self._model.to("cpu")
        self._model = None
        self.loaded = False

    def predict(self, features: Sequence[float] | Any, top_k: int = 5) -> list[PredictionCandidate]:
        if not self.loaded or self._model is None:
            return []

        if torch is None:
            return []

        tensor = features if isinstance(features, torch.Tensor) else torch.tensor(features, dtype=torch.float32)
        tensor = tensor.to(self.config.device)
        if tensor.ndim == 3:
            tensor = tensor.unsqueeze(0)

        with torch.no_grad():
            output = self._model(tensor)

        scores = self._coerce_logits(output)
        if not scores:
            return []

        probabilities = self._softmax(scores)
        ranked_indices = sorted(range(len(probabilities)), key=lambda index: probabilities[index], reverse=True)[: max(1, top_k)]
        candidates: list[PredictionCandidate] = []

        for rank, index in enumerate(ranked_indices, start=1):
            label = self.labels[index] if index < len(self.labels) else f"label-{index}"
            candidates.append(
                PredictionCandidate(
                    label=label,
                    confidence=float(probabilities[index]),
                    label_id=str(index),
                    source=f"{self.name}:{rank}",
                )
            )

        return candidates
