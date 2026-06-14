from __future__ import annotations

from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field

SignLanguageKey = Literal["isl", "asl", "wsl"]
RecognitionStatus = Literal["buffering", "predicted", "degraded", "error"]
API_VERSION = "1.0"


class RecognitionFrameRequest(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid4()))
    language: SignLanguageKey = "isl"
    image: str = Field(..., description="Base64 data URL or raw base64 image payload")
    frame_index: int = 0
    timestamp: float | None = None
    sequence_length: int = 32
    top_k: int = 5
    preprocessing_level: Literal["minimal", "standard", "enhanced"] = "minimal"


class RecognitionPrediction(BaseModel):
    label: str
    confidence: float
    label_id: str | None = None
    source: str | None = None
    rank: int | None = None
    is_smoothed: bool = False


class RecognitionFrameResponse(BaseModel):
    session_id: str
    status: RecognitionStatus
    message: str
    api_version: str = API_VERSION
    sequence_length: int
    frames_collected: int
    latency_ms: float | None = None
    model: str = "openhands-lstm"
    prediction: RecognitionPrediction | None = None
    predictions: list[RecognitionPrediction] = Field(default_factory=list)
    labels: list[str] = Field(default_factory=list)
    model_loaded: bool = False
    backend: str = "openhands"


class SessionStartRequest(BaseModel):
    language: SignLanguageKey = "isl"
    sequence_length: int = 32
    top_k: int = 5
    preprocessing_level: Literal["minimal", "standard", "enhanced"] = "minimal"


class SessionStartResponse(BaseModel):
    session_id: str
    status: Literal["ready", "degraded"]
    message: str
    backend: str = "openhands"
    model_loaded: bool = False
    checkpoint_detected: bool = False
    sequence_length: int = 32
    top_k: int = 5


class SessionEndRequest(BaseModel):
    session_id: str


class SessionEndResponse(BaseModel):
    session_id: str
    status: Literal["ended", "missing"]
    message: str
    active_sessions: int


class WarmupResponse(BaseModel):
    status: Literal["ready", "degraded"]
    message: str
    model_loaded: bool
    checkpoint_detected: bool


class LabelsResponse(BaseModel):
    labels: list[str]
    count: int
    model_loaded: bool


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    backend: str = "openhands"
    model_loaded: bool = False
    checkpoint_detected: bool = False
    message: str = "SignBridge backend is running."
    device: str = "cpu"
    sequence_length: int = 32
    confidence_threshold: float = 0.6
    active_sessions: int = 0


class StatusResponse(BaseModel):
    backend: str
    model_loaded: bool
    checkpoint_detected: bool
    message: str
    labels: list[str]
    active_sessions: int
    sequence_length: int
    confidence_threshold: float