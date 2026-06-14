from __future__ import annotations

import os
from dataclasses import dataclass

from app.services.checkpoint_loader import CheckpointBundle


@dataclass(slots=True)
class ModelConfig:
    model_name: str = "openhands"
    top_k: int = 5
    smoothing_window: int = 5
    sequence_length: int = 32
    confidence_threshold: float = 0.6
    session_ttl_seconds: int = 300
    device: str = "cpu"

    @classmethod
    def from_bundle(cls, bundle: CheckpointBundle) -> "ModelConfig":
        config = bundle.config

        return cls(
            model_name=str(os.getenv("MODEL_NAME") or config.get("model_name") or "openhands"),
            top_k=int(os.getenv("TOP_K") or config.get("top_k", 5) or 5),
            smoothing_window=int(os.getenv("SMOOTHING_WINDOW") or config.get("smoothing_window", 5) or 5),
            sequence_length=int(os.getenv("SEQUENCE_LENGTH") or config.get("sequence_length", 32) or 32),
            confidence_threshold=float(os.getenv("CONFIDENCE_THRESHOLD") or config.get("confidence_threshold", 0.6) or 0.6),
            session_ttl_seconds=int(os.getenv("SESSION_TTL_SECONDS") or config.get("session_ttl_seconds", 300) or 300),
            device=str(os.getenv("DEVICE") or bundle.device or "cpu"),
        )
