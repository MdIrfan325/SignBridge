from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Sequence


@dataclass(slots=True)
class PredictionCandidate:
    label: str
    confidence: float
    label_id: str | None = None
    source: str | None = None


class BaseRecognitionModel(ABC):
    name = "base"

    def __init__(self, labels: list[str]) -> None:
        self.labels = labels
        self.loaded = False

    @abstractmethod
    def load(self) -> bool:
        raise NotImplementedError

    @abstractmethod
    def predict(self, features: Sequence[float], top_k: int = 5) -> list[PredictionCandidate]:
        raise NotImplementedError

    @abstractmethod
    def unload(self) -> None:
        raise NotImplementedError
