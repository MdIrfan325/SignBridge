from __future__ import annotations

from dataclasses import dataclass

from app.services.checkpoint_loader import CheckpointBundle, CheckpointLoader

from .config import ModelConfig


@dataclass(slots=True)
class LoadedModelContext:
    config: ModelConfig
    bundle: CheckpointBundle


class ModelLoader:
    def __init__(self, checkpoint_loader: CheckpointLoader | None = None) -> None:
        self.checkpoint_loader = checkpoint_loader or CheckpointLoader()

    def load(self) -> LoadedModelContext:
        bundle = self.checkpoint_loader.load()
        config = ModelConfig.from_bundle(bundle)
        return LoadedModelContext(config=config, bundle=bundle)
