from __future__ import annotations

from .base import BaseRecognitionModel
from .loader import LoadedModelContext
from .openhands import OpenHandsRecognitionModel
from .include import IncludeRecognitionModel
from .onnx import OnnxRecognitionModel
from .tflite import TFLiteRecognitionModel


MODEL_REGISTRY: dict[str, type[BaseRecognitionModel]] = {
    "openhands": OpenHandsRecognitionModel,
    "include": IncludeRecognitionModel,
    "onnx": OnnxRecognitionModel,
    "tflite": TFLiteRecognitionModel,
}


class ModelRegistry:
    @classmethod
    def available_models(cls) -> list[str]:
        return sorted(MODEL_REGISTRY)

    @classmethod
    def load(cls, model_name: str, context: LoadedModelContext) -> BaseRecognitionModel:
        model_class = MODEL_REGISTRY.get(model_name.lower(), OpenHandsRecognitionModel)
        model = model_class(context.config, context.bundle.labels, context.bundle)
        model.load()
        return model
