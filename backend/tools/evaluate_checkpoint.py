#!/usr/bin/env python3
"""Evaluate the OpenHands INCLUDE checkpoint on the official validation split.

This script is intentionally explicit about its inputs:
- the official INCLUDE split CSV
- the dataset root directory
- the staged checkpoint, config, and labels

It loads pose sequences from real videos when they are mounted, runs inference,
and writes the requested artifacts:
- evaluation.json
- confusion_matrix.png
- metrics.csv
- report.md

If the validation split or video files are not present, the script fails with a
clear message instead of pretending evaluation succeeded.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
import time
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch
import yaml


SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
CHECKPOINT_DIR = BACKEND_DIR / "checkpoints" / "openhands-include-lstm"
DEFAULT_CHECKPOINT_FILE = CHECKPOINT_DIR / "epoch=294-step=63719.ckpt"
DEFAULT_CONFIG_FILE = CHECKPOINT_DIR / "config.yaml"
DEFAULT_LABELS_FILE = CHECKPOINT_DIR / "labels.csv"

sys.path.insert(0, str(BACKEND_DIR))

try:  # pragma: no cover - optional dependency
    import cv2
except Exception:  # pragma: no cover - optional dependency
    cv2 = None

try:  # pragma: no cover - optional dependency
    from app.services.mediapipe_service import MediaPipeService
except Exception:  # pragma: no cover - optional dependency
    MediaPipeService = None


@dataclass(slots=True)
class EvaluationSample:
    index: int
    label: str
    video_path: Path
    predicted_label: str
    predicted_index: int
    confidence: float
    top5_hit: bool
    correct: bool
    inference_ms: float
    top5: list[dict[str, Any]]


@dataclass(slots=True)
class EvaluationSummary:
    total_samples: int = 0
    evaluated_samples: int = 0
    skipped_missing_videos: int = 0
    skipped_unreadable_videos: int = 0
    skipped_unknown_labels: int = 0
    top1_correct: int = 0
    top5_correct: int = 0
    inference_ms_total: float = 0.0
    confidence_total: float = 0.0
    true_label_confidence_total: float = 0.0
    total_support: int = 0
    macro_f1: float = 0.0
    weighted_f1: float = 0.0

    @property
    def top1_accuracy(self) -> float:
        return self.top1_correct / self.evaluated_samples if self.evaluated_samples else 0.0

    @property
    def top5_accuracy(self) -> float:
        return self.top5_correct / self.evaluated_samples if self.evaluated_samples else 0.0

    @property
    def avg_inference_ms(self) -> float:
        return self.inference_ms_total / self.evaluated_samples if self.evaluated_samples else 0.0

    @property
    def avg_top1_confidence(self) -> float:
        return self.confidence_total / self.evaluated_samples if self.evaluated_samples else 0.0

    @property
    def avg_true_label_confidence(self) -> float:
        return self.true_label_confidence_total / self.evaluated_samples if self.evaluated_samples else 0.0


class AttentionBlock(torch.nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.fc1 = torch.nn.Linear(256, 256, bias=False)
        self.fc2 = torch.nn.Linear(512, 256, bias=False)

    def forward(self, sequence: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        query = torch.tanh(self.fc1(sequence.mean(dim=1)))
        query = query.unsqueeze(1).expand(-1, sequence.size(1), -1)
        combined = torch.cat([sequence, query], dim=-1)
        energy = torch.tanh(self.fc2(combined))
        weights = torch.softmax(energy.mean(dim=-1), dim=1).unsqueeze(-1)
        pooled = (sequence * weights).sum(dim=1)
        return pooled, weights.squeeze(-1)


class CheckpointDecoder(torch.nn.Module):
    def __init__(self, num_classes: int) -> None:
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

    def forward(self, sequence: torch.Tensor) -> torch.Tensor:
        rnn_output, _ = self.rnn(sequence)
        pooled, _ = self.attn_block(rnn_output)
        return self.fc(pooled)


class CheckpointEvaluationModel(torch.nn.Module):
    def __init__(self, num_classes: int) -> None:
        super().__init__()
        self.decoder = CheckpointDecoder(num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        batch_size, sequence_length, num_points, coords = x.shape
        sequence = x.reshape(batch_size, sequence_length, num_points * coords)
        return self.decoder(sequence)


def _load_yaml(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
    return data if isinstance(data, dict) else {}


def _load_labels(path: Path) -> list[str]:
    labels: list[str] = []
    seen: set[str] = set()
    with path.open("r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            label = row.get("Word", "").strip()
            if label and label not in seen:
                labels.append(label)
                seen.add(label)
    return labels


def _load_checkpoint(path: Path, device: torch.device) -> dict[str, torch.Tensor]:
    checkpoint = torch.load(str(path), map_location=device, weights_only=False)
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        checkpoint = checkpoint["state_dict"]
    if not isinstance(checkpoint, dict):
        raise TypeError("Checkpoint does not contain a usable state_dict")
    cleaned: dict[str, torch.Tensor] = {}
    for key, value in checkpoint.items():
        cleaned[key.replace("model.", "", 1)] = value
    return cleaned


def _resolve_sample_path(row: dict[str, str], root_dir: Path) -> Path | None:
    candidates: list[Path] = []

    file_path = (row.get("FilePath") or row.get("filepath") or row.get("path") or "").strip()
    if file_path:
        candidate = Path(file_path)
        candidates.append(candidate if candidate.is_absolute() else root_dir / candidate)

    category = (row.get("Category") or row.get("category") or "").strip()
    word = (row.get("Word") or row.get("word") or row.get("Label") or "").strip()
    video = (row.get("Video") or row.get("video") or "").strip()
    if category and word and video:
        candidates.append(root_dir / category / word / video)
        candidates.append(root_dir / category / f"{word}" / video)
    if category and video:
        candidates.append(root_dir / category / video)

    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0] if candidates else None


def _pose_to_tensor(bundle_pose: list[tuple[float, float, float, float]], num_points: int = 27) -> torch.Tensor:
    tensor = torch.zeros(num_points, 2, dtype=torch.float32)
    for index, point in enumerate(bundle_pose[:num_points]):
        tensor[index, 0] = float(point[0])
        tensor[index, 1] = float(point[1])

    if num_points >= 13 and tensor[:13].abs().sum() > 0:
        left_shoulder = tensor[11]
        right_shoulder = tensor[12]
        if torch.isfinite(left_shoulder).all() and torch.isfinite(right_shoulder).all():
            center = (left_shoulder + right_shoulder) / 2.0
            scale = torch.linalg.vector_norm(left_shoulder - right_shoulder).clamp_min(1e-6)
            tensor = ((tensor - center) / scale * 0.5) + 0.5

    return torch.clamp(tensor, 0.0, 1.0)


def _sample_sequence(frames: list[torch.Tensor], sequence_length: int) -> torch.Tensor | None:
    if not frames:
        return None

    if len(frames) >= sequence_length:
        indices = torch.linspace(0, len(frames) - 1, steps=sequence_length).round().long().tolist()
        selected = [frames[index] for index in indices]
        return torch.stack(selected)

    padded = list(frames)
    while len(padded) < sequence_length:
        padded.append(padded[-1].clone())
    return torch.stack(padded)


def _extract_sequence_from_video(video_path: Path, sequence_length: int, target_points: int = 27) -> torch.Tensor | None:
    if cv2 is None or MediaPipeService is None:
        return None

    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        return None

    media_pipe = MediaPipeService()
    if not media_pipe.warmup():
        capture.release()
        return None

    frames: list[torch.Tensor] = []
    try:
        while True:
            ok, frame = capture.read()
            if not ok:
                break

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            landmarks = media_pipe.extract_landmarks(rgb_frame)
            if landmarks.pose:
                frames.append(_pose_to_tensor(landmarks.pose, num_points=target_points))

            if len(frames) >= sequence_length * 2:
                break
    finally:
        capture.release()

    return _sample_sequence(frames, sequence_length)


def _softmax(logits: torch.Tensor) -> torch.Tensor:
    return torch.softmax(logits, dim=-1)


def _topk_predictions(probabilities: torch.Tensor, labels: list[str], k: int = 5) -> list[dict[str, Any]]:
    values, indices = torch.topk(probabilities, k=min(k, probabilities.numel()))
    output: list[dict[str, Any]] = []
    for rank, (value, index) in enumerate(zip(values.tolist(), indices.tolist()), start=1):
        output.append(
            {
                "rank": rank,
                "label": labels[index] if index < len(labels) else f"label-{index}",
                "index": index,
                "confidence": float(value),
            }
        )
    return output


def _compute_classification_metrics(confusion_matrix: list[list[int]]) -> tuple[float, float, list[float]]:
    total_support = sum(sum(row) for row in confusion_matrix)
    if total_support == 0:
        return 0.0, 0.0, []

    per_class_f1: list[float] = []
    weighted_sum = 0.0
    for class_index, row in enumerate(confusion_matrix):
        tp = row[class_index]
        fn = sum(row) - tp
        fp = sum(confusion_matrix[other][class_index] for other in range(len(confusion_matrix))) - tp
        precision = tp / (tp + fp) if (tp + fp) else 0.0
        recall = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0
        support = sum(row)
        per_class_f1.append(f1)
        weighted_sum += f1 * support

    macro_f1 = sum(per_class_f1) / len(per_class_f1) if per_class_f1 else 0.0
    weighted_f1 = weighted_sum / total_support
    return macro_f1, weighted_f1, per_class_f1


def _save_confusion_matrix_plot(confusion_matrix: list[list[int]], labels: list[str], output_path: Path) -> None:
    try:
        import matplotlib.pyplot as plt  # type: ignore
    except Exception as exc:  # pragma: no cover - optional dependency
        output_path.write_text(f"matplotlib unavailable: {exc}\n", encoding="utf-8")
        return

    support = [sum(row) for row in confusion_matrix]
    ranked_indices = sorted(range(len(labels)), key=lambda index: support[index], reverse=True)
    selected_indices = [index for index in ranked_indices if support[index] > 0][: min(30, len(labels))]

    if not selected_indices:
        selected_indices = list(range(min(5, len(labels))))

    matrix = [[confusion_matrix[row_index][col_index] for col_index in selected_indices] for row_index in selected_indices]
    plot_labels = [labels[index] for index in selected_indices]

    size = max(8, len(selected_indices) * 0.45)
    fig, ax = plt.subplots(figsize=(size, size))
    image = ax.imshow(matrix, cmap="Blues")
    ax.set_xticks(range(len(plot_labels)))
    ax.set_yticks(range(len(plot_labels)))
    ax.set_xticklabels(plot_labels, rotation=90, fontsize=6)
    ax.set_yticklabels(plot_labels, fontsize=6)
    ax.set_title("INCLUDE Validation Confusion Matrix (top supported classes)")
    fig.colorbar(image, ax=ax, fraction=0.046, pad=0.04)
    fig.tight_layout()
    fig.savefig(output_path, dpi=200)
    plt.close(fig)


def _build_report(summary: EvaluationSummary, labels: list[str], top_misclassifications: list[tuple[str, str, int]]) -> str:
    lines = [
        "# INCLUDE Checkpoint Evaluation Report",
        "",
        f"- Evaluated samples: {summary.evaluated_samples}",
        f"- Total rows in split: {summary.total_samples}",
        f"- Top-1 accuracy: {summary.top1_accuracy:.4f}",
        f"- Top-5 accuracy: {summary.top5_accuracy:.4f}",
        f"- Macro F1: {summary.macro_f1:.4f}",
        f"- Weighted F1: {summary.weighted_f1:.4f}",
        f"- Average top-1 confidence: {summary.avg_top1_confidence:.4f}",
        f"- Average true-label confidence: {summary.avg_true_label_confidence:.4f}",
        f"- Average inference time: {summary.avg_inference_ms:.2f} ms",
        "",
        "## Skips",
        f"- Missing videos: {summary.skipped_missing_videos}",
        f"- Unreadable videos: {summary.skipped_unreadable_videos}",
        f"- Unknown labels: {summary.skipped_unknown_labels}",
        "",
        "## Top Confusions",
    ]

    if top_misclassifications:
        for true_label, predicted_label, count in top_misclassifications[:10]:
            lines.append(f"- {true_label} -> {predicted_label}: {count}")
    else:
        lines.append("- None recorded")

    lines.extend(
        [
            "",
            "## Notes",
            "- This report is based on the official INCLUDE validation split when mounted.",
            "- Confusion matrix PNG shows the most-supported classes to keep the plot readable.",
            "- Per-sample results are recorded in metrics.csv.",
        ]
    )
    return "\n".join(lines) + "\n"


def evaluate(args: argparse.Namespace) -> int:
    config = _load_yaml(args.config_file)
    valid_pipeline = config.get("data", {}).get("valid_pipeline", {}) if isinstance(config.get("data"), dict) else {}

    split_file_value = args.split_file if args.split_file is not None else valid_pipeline.get("dataset", {}).get("split_file", "")
    root_dir_value = args.root_dir if args.root_dir is not None else valid_pipeline.get("dataset", {}).get("root_dir", "")

    if not split_file_value:
        raise FileNotFoundError("No split file provided and config.yaml did not contain valid_pipeline.dataset.split_file")
    if not root_dir_value:
        raise FileNotFoundError("No dataset root provided and config.yaml did not contain valid_pipeline.dataset.root_dir")

    split_file = Path(split_file_value).expanduser()
    root_dir = Path(root_dir_value).expanduser()

    if not split_file.exists():
        raise FileNotFoundError(f"INCLUDE split file not found: {split_file}")
    if not root_dir.exists():
        raise FileNotFoundError(f"INCLUDE dataset root not found: {root_dir}")

    labels = _load_labels(args.labels_file)
    if not labels:
        raise RuntimeError(f"No labels loaded from {args.labels_file}")

    device = torch.device(args.device)
    state_dict = _load_checkpoint(args.checkpoint_file, device)

    model = CheckpointEvaluationModel(num_classes=len(labels)).to(device)
    load_result = model.load_state_dict(state_dict, strict=False)
    model.eval()

    rows: list[dict[str, str]] = []
    with split_file.open("r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        rows.extend(reader)

    if args.limit > 0:
        rows = rows[: args.limit]

    summary = EvaluationSummary(total_samples=len(rows))
    label_to_index = {label: index for index, label in enumerate(labels)}
    confusion_matrix = [[0 for _ in labels] for _ in labels]
    per_sample_results: list[EvaluationSample] = []
    misclassification_counter: Counter[tuple[str, str]] = Counter()

    sequence_length = args.sequence_length
    target_points = 27

    for sample_index, row in enumerate(rows, start=1):
        label = (row.get("Word") or row.get("word") or row.get("Label") or "").strip()
        if not label or label not in label_to_index:
            summary.skipped_unknown_labels += 1
            continue

        sample_path = _resolve_sample_path(row, root_dir)
        if sample_path is None or not sample_path.exists():
            summary.skipped_missing_videos += 1
            continue

        sequence = _extract_sequence_from_video(sample_path, sequence_length=sequence_length, target_points=target_points)
        if sequence is None:
            summary.skipped_unreadable_videos += 1
            continue

        batch = sequence.unsqueeze(0).to(device)
        inference_start = time.perf_counter()
        with torch.no_grad():
            logits = model(batch)
        inference_ms = (time.perf_counter() - inference_start) * 1000.0

        probabilities = _softmax(logits[0].detach().cpu())
        top5 = _topk_predictions(probabilities, labels, k=5)
        top1 = top5[0]
        true_index = label_to_index[label]
        true_confidence = float(probabilities[true_index].item())
        predicted_index = int(top1["index"])
        predicted_label = str(top1["label"])
        correct = predicted_label == label
        top5_hit = any(candidate["label"] == label for candidate in top5)

        summary.evaluated_samples += 1
        summary.inference_ms_total += inference_ms
        summary.confidence_total += float(top1["confidence"])
        summary.true_label_confidence_total += true_confidence
        summary.total_support += 1

        if correct:
            summary.top1_correct += 1
        if top5_hit:
            summary.top5_correct += 1

        confusion_matrix[true_index][predicted_index] += 1
        if not correct:
            misclassification_counter[(label, predicted_label)] += 1

        per_sample_results.append(
            EvaluationSample(
                index=sample_index,
                label=label,
                video_path=sample_path,
                predicted_label=predicted_label,
                predicted_index=predicted_index,
                confidence=float(top1["confidence"]),
                top5_hit=top5_hit,
                correct=correct,
                inference_ms=inference_ms,
                top5=top5,
            )
        )

    if summary.evaluated_samples == 0:
        raise RuntimeError(
            "No evaluation samples could be processed. Check that the INCLUDE validation split, video files, and MediaPipe dependencies are available."
        )

    macro_f1, weighted_f1, per_class_f1 = _compute_classification_metrics(confusion_matrix)
    summary.macro_f1 = macro_f1
    summary.weighted_f1 = weighted_f1

    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    evaluation_json = {
        "checkpoint": str(args.checkpoint_file),
        "split_file": str(split_file),
        "root_dir": str(root_dir),
        "device": str(device),
        "labels": len(labels),
        "load_result": {
            "missing_keys": list(load_result.missing_keys),
            "unexpected_keys": list(load_result.unexpected_keys),
        },
        "summary": {
            "total_samples": summary.total_samples,
            "evaluated_samples": summary.evaluated_samples,
            "skipped_missing_videos": summary.skipped_missing_videos,
            "skipped_unreadable_videos": summary.skipped_unreadable_videos,
            "skipped_unknown_labels": summary.skipped_unknown_labels,
            "top1_accuracy": summary.top1_accuracy,
            "top5_accuracy": summary.top5_accuracy,
            "macro_f1": macro_f1,
            "weighted_f1": weighted_f1,
            "avg_top1_confidence": summary.avg_top1_confidence,
            "avg_true_label_confidence": summary.avg_true_label_confidence,
            "avg_inference_ms": summary.avg_inference_ms,
        },
        "per_class_f1": {labels[index]: per_class_f1[index] for index in range(len(labels))},
        "top_misclassifications": [
            {"true_label": true_label, "predicted_label": predicted_label, "count": count}
            for (true_label, predicted_label), count in misclassification_counter.most_common(25)
        ],
        "samples": [
            {
                "index": sample.index,
                "label": sample.label,
                "video_path": str(sample.video_path),
                "predicted_label": sample.predicted_label,
                "predicted_index": sample.predicted_index,
                "confidence": sample.confidence,
                "top5_hit": sample.top5_hit,
                "correct": sample.correct,
                "inference_ms": sample.inference_ms,
                "top5": sample.top5,
            }
            for sample in per_sample_results
        ],
    }

    (output_dir / "evaluation.json").write_text(json.dumps(evaluation_json, indent=2), encoding="utf-8")

    with (output_dir / "metrics.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "index",
                "label",
                "video_path",
                "predicted_label",
                "predicted_index",
                "confidence",
                "top5_hit",
                "correct",
                "inference_ms",
            ],
        )
        writer.writeheader()
        for sample in per_sample_results:
            writer.writerow(
                {
                    "index": sample.index,
                    "label": sample.label,
                    "video_path": sample.video_path,
                    "predicted_label": sample.predicted_label,
                    "predicted_index": sample.predicted_index,
                    "confidence": f"{sample.confidence:.6f}",
                    "top5_hit": str(sample.top5_hit),
                    "correct": str(sample.correct),
                    "inference_ms": f"{sample.inference_ms:.3f}",
                }
            )

    _save_confusion_matrix_plot(confusion_matrix, labels, output_dir / "confusion_matrix.png")

    report = _build_report(summary, labels, [(*pair, count) for pair, count in misclassification_counter.most_common()])
    (output_dir / "report.md").write_text(report, encoding="utf-8")

    print("\nEvaluation complete")
    print(f"  Evaluated samples: {summary.evaluated_samples}")
    print(f"  Top-1 accuracy:    {summary.top1_accuracy:.4f}")
    print(f"  Top-5 accuracy:    {summary.top5_accuracy:.4f}")
    print(f"  Macro F1:          {macro_f1:.4f}")
    print(f"  Weighted F1:       {weighted_f1:.4f}")
    print(f"  Avg inference ms:  {summary.avg_inference_ms:.2f}")
    print(f"  Outputs written to: {output_dir}")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate the OpenHands INCLUDE checkpoint on the validation split.")
    parser.add_argument("--checkpoint-file", type=Path, default=DEFAULT_CHECKPOINT_FILE)
    parser.add_argument("--config-file", type=Path, default=DEFAULT_CONFIG_FILE)
    parser.add_argument("--labels-file", type=Path, default=DEFAULT_LABELS_FILE)
    parser.add_argument("--split-file", type=Path, default=None)
    parser.add_argument("--root-dir", type=Path, default=None)
    parser.add_argument("--output-dir", type=Path, default=CHECKPOINT_DIR / "evaluation")
    parser.add_argument("--device", type=str, default="cpu")
    parser.add_argument("--sequence-length", type=int, default=32)
    parser.add_argument("--limit", type=int, default=0, help="Optional sample limit for quick checks; 0 means no limit.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        return evaluate(args)
    except Exception as exc:
        print(f"Evaluation failed: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())