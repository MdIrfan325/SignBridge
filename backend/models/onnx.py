from __future__ import annotations

from .openhands import OpenHandsRecognitionModel


class OnnxRecognitionModel(OpenHandsRecognitionModel):
    name = "onnx"
