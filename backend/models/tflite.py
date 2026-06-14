from __future__ import annotations

from .openhands import OpenHandsRecognitionModel


class TFLiteRecognitionModel(OpenHandsRecognitionModel):
    name = "tflite"
