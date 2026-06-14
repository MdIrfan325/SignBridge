from __future__ import annotations

import json
import csv
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml


@dataclass(slots=True)
class CheckpointBundle:
    model_path: Path | None
    label_path: Path | None
    config_path: Path | None
    device: str
    labels: list[str] = field(default_factory=list)
    config: dict[str, Any] = field(default_factory=dict)

    @property
    def checkpoint_detected(self) -> bool:
        return self.model_path is not None and self.model_path.exists()

    @property
    def model_loaded(self) -> bool:
        return self.checkpoint_detected


class CheckpointLoader:
    def __init__(self, base_dir: Path | None = None) -> None:
        self.base_dir = base_dir or Path(__file__).resolve().parents[2] / "checkpoints"

    def _resolve_path(self, env_value: str | None, candidates: list[str]) -> Path | None:
        if env_value:
            candidate = Path(env_value).expanduser()
            if not candidate.is_absolute():
                candidate = (self.base_dir.parent / candidate).resolve()
            return candidate

        for candidate_name in candidates:
            direct_candidate = (self.base_dir / candidate_name).resolve()
            if direct_candidate.exists():
                return direct_candidate

            nested_candidates = list(self.base_dir.glob(f"**/{candidate_name}"))
            if nested_candidates:
                return nested_candidates[0].resolve()

        return None

    def _load_labels(self, label_path: Path | None) -> list[str]:
        if not label_path or not label_path.exists():
            return []

        if label_path.suffix.lower() == ".csv":
            labels: list[str] = []
            seen: set[str] = set()
            with label_path.open("r", encoding="utf-8") as handle:
                reader = csv.DictReader(handle)
                for row in reader:
                    label = (row.get("Word") or row.get("word") or row.get("Label") or "").strip()
                    if label and label not in seen:
                        labels.append(label)
                        seen.add(label)
            return labels

        with label_path.open("r", encoding="utf-8") as handle:
            raw_labels = json.load(handle)

        if isinstance(raw_labels, list):
            return [str(label) for label in raw_labels]

        if isinstance(raw_labels, dict):
            labels = raw_labels.get("labels", [])
            if isinstance(labels, list):
                return [str(label) for label in labels]

        return []

    def _load_config(self, config_path: Path | None) -> dict[str, Any]:
        if not config_path or not config_path.exists():
            return {}

        with config_path.open("r", encoding="utf-8") as handle:
            config_data = yaml.safe_load(handle) or {}

        return config_data if isinstance(config_data, dict) else {}

    def load(self) -> CheckpointBundle:
        model_path = self._resolve_path(
            os.getenv("MODEL_PATH"),
            [
                "model.pth",
                "model.pt",
                "checkpoint.pth",
                "epoch=294-step=63719.ckpt",
            ],
        )
        label_path = self._resolve_path(os.getenv("LABEL_PATH"), ["labels.csv", "labels.json"])
        config_path = self._resolve_path(os.getenv("CONFIG_PATH"), ["config.yaml", "config.yml"])
        device = os.getenv("DEVICE", "cpu")

        bundle = CheckpointBundle(
            model_path=model_path,
            label_path=label_path,
            config_path=config_path,
            device=device,
            labels=self._load_labels(label_path),
            config=self._load_config(config_path),
        )

        if not bundle.labels:
            bundle.labels = [
                "hello",
                "thank you",
                "please",
                "sorry",
                "help",
                "today",
                "home",
                "school",
            ]

        return bundle