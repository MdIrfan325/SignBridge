from __future__ import annotations

import time
from collections import deque
from dataclasses import dataclass, field
from typing import Deque

import torch

from app.models.recognition import (
    HealthResponse,
    LabelsResponse,
    RecognitionFrameRequest,
    RecognitionFrameResponse,
    RecognitionPrediction,
    SessionEndResponse,
    SessionStartRequest,
    SessionStartResponse,
    StatusResponse,
    WarmupResponse,
)
from app.services.mediapipe_service import LandmarkBundle, LandmarkExtractor, MediaPipeService
from models import LoadedModelContext, ModelLoader, ModelRegistry


@dataclass(slots=True)
class RecognitionSession:
    frames: Deque[LandmarkBundle] = field(default_factory=lambda: deque(maxlen=64))
    prediction_history: Deque[RecognitionPrediction] = field(default_factory=lambda: deque(maxlen=12))
    last_prediction: str | None = None
    created_at: float = field(default_factory=time.time)
    last_access_at: float = field(default_factory=time.time)

    def touch(self) -> None:
        self.last_access_at = time.time()


class RecognitionPipeline:
    def __init__(self, landmark_extractor: LandmarkExtractor | None = None) -> None:
        self.loader = ModelLoader()
        self.landmark_extractor = landmark_extractor or MediaPipeService()
        self.media_pipe = self.landmark_extractor
        self.context: LoadedModelContext | None = None
        self.model = None
        self.model_name = "openhands"
        self.sessions: dict[str, RecognitionSession] = {}
        self.message = "Backend is starting."
        self.session_ttl_seconds = 300

    def warmup(self) -> WarmupResponse:
        self.context = self.loader.load()
        self.model_name = self.context.config.model_name
        self.session_ttl_seconds = self.context.config.session_ttl_seconds
        self.model = ModelRegistry.load(self.model_name, self.context)
        mediapipe_ready = self.landmark_extractor.warmup()

        if self.model.loaded and mediapipe_ready:
            self.message = f"{self.model_name} model and MediaPipe are ready."
            return WarmupResponse(
                status="ready",
                message=self.message,
                model_loaded=True,
                checkpoint_detected=self.context.bundle.checkpoint_detected,
            )

        details: list[str] = []
        if not self.context.bundle.checkpoint_detected:
            details.append("no checkpoint found")
        if not mediapipe_ready:
            details.append("MediaPipe unavailable")
        if not self.model.loaded:
            details.append(f"{self.model_name} model unavailable")

        self.message = f"Backend is running with degraded recognition ({', '.join(details) or 'configuration incomplete'})."
        return WarmupResponse(
            status="degraded",
            message=self.message,
            model_loaded=self.model.loaded,
            checkpoint_detected=self.context.bundle.checkpoint_detected,
        )

    @property
    def active_sessions(self) -> int:
        return len(self.sessions)

    def _ensure_context(self) -> LoadedModelContext:
        if self.context is None:
            self.context = self.loader.load()
            self.model_name = self.context.config.model_name
            self.session_ttl_seconds = self.context.config.session_ttl_seconds
        return self.context

    def _ensure_model(self):
        context = self._ensure_context()
        if self.model is None:
            self.model = ModelRegistry.load(self.model_name, context)
        return self.model

    def _prune_sessions(self) -> None:
        now = time.time()
        stale_session_ids = [session_id for session_id, session in self.sessions.items() if now - session.last_access_at > self.session_ttl_seconds]
        for session_id in stale_session_ids:
            del self.sessions[session_id]

    def _get_session(self, session_id: str, sequence_length: int) -> RecognitionSession:
        self._prune_sessions()
        session = self.sessions.get(session_id)
        if session is None:
            session = RecognitionSession(frames=deque(maxlen=max(sequence_length, 8)))
            self.sessions[session_id] = session

        if session.frames.maxlen != sequence_length:
            session.frames = deque(session.frames, maxlen=sequence_length)

        session.touch()
        return session

    def touch_session(self, session_id: str) -> None:
        session = self.sessions.get(session_id)
        if session is not None:
            session.touch()

    def _to_response_prediction(self, candidate, rank: int, is_smoothed: bool = False) -> RecognitionPrediction:
        return RecognitionPrediction(
            label=candidate.label,
            confidence=candidate.confidence,
            label_id=candidate.label_id,
            source=candidate.source,
            rank=rank,
            is_smoothed=is_smoothed,
        )

    def _smooth_prediction(self, session: RecognitionSession, predictions: list[RecognitionPrediction]) -> RecognitionPrediction | None:
        if not predictions:
            return None

        top_prediction = predictions[0]
        session.prediction_history.append(top_prediction)
        smoothing_window = self.context.config.smoothing_window if self.context else 5
        window = list(session.prediction_history)[-smoothing_window:]

        if not window:
            return top_prediction

        scores: dict[str, float] = {}
        winner_by_label: dict[str, RecognitionPrediction] = {}
        for index, prediction in enumerate(reversed(window)):
            weight = 1.0 / (index + 1)
            scores[prediction.label] = scores.get(prediction.label, 0.0) + prediction.confidence * weight
            winner_by_label.setdefault(prediction.label, prediction)

        winner_label = max(scores, key=scores.get)
        winner = winner_by_label[winner_label]
        return RecognitionPrediction(
            label=winner.label,
            confidence=min(0.99, max(top_prediction.confidence, winner.confidence)),
            label_id=winner.label_id,
            source=winner.source,
            rank=1,
            is_smoothed=True,
        )

    def _predict(self, session: RecognitionSession, sequence_length: int, top_k: int) -> list[RecognitionPrediction]:
        model = self._ensure_model()
        if not model.loaded:
            return []

        frames = list(session.frames)[-sequence_length:]
        if len(frames) < sequence_length:
            return []

        pose_tensors = []
        for frame in frames:
            pose_tensor = self.landmark_extractor.landmarks_to_pose_tensor(frame)
            if pose_tensor is None:
                return []
            pose_tensors.append(pose_tensor)

        sequence = torch.stack(pose_tensors)
        candidates = model.predict(sequence, top_k=top_k)
        return [self._to_response_prediction(candidate, rank=index) for index, candidate in enumerate(candidates, start=1)]

    def _build_response(
        self,
        *,
        session_id: str,
        payload: RecognitionFrameRequest,
        session: RecognitionSession,
        predictions: list[RecognitionPrediction],
        bundle_labels: list[str],
        status: str,
        message: str,
        latency_ms: float | None = None,
    ) -> RecognitionFrameResponse:
        smoothed = self._smooth_prediction(session, predictions)
        if smoothed is not None:
            if not predictions:
                predictions = [smoothed]
            elif smoothed.label != predictions[0].label:
                predictions = [smoothed, *[prediction for prediction in predictions if prediction.label != smoothed.label]]

        primary = predictions[0] if predictions else smoothed

        return RecognitionFrameResponse(
            session_id=session_id,
            status=status,
            message=message,
            sequence_length=payload.sequence_length,
            frames_collected=len(session.frames),
            latency_ms=latency_ms,
            model=f"{self.model_name}-lstm",
            prediction=primary,
            predictions=predictions[: max(1, payload.top_k)],
            labels=bundle_labels,
            model_loaded=self.model.loaded,
            backend=self.model_name,
        )

    def start_session(self, payload: SessionStartRequest) -> SessionStartResponse:
        context = self._ensure_context()
        self._ensure_model()
        session_id = f"session-{int(time.time() * 1000)}-{len(self.sessions) + 1}"
        self.sessions[session_id] = RecognitionSession(frames=deque(maxlen=max(payload.sequence_length, 8)))

        status = "ready" if self.model.loaded else "degraded"
        message = f"Session {session_id} created for {payload.language.upper()} using {self.model_name}."
        if status == "degraded":
            message = f"Session {session_id} created, but {self.model_name} is not loaded yet."

        return SessionStartResponse(
            session_id=session_id,
            status=status,
            message=message,
            backend=self.model_name,
            model_loaded=self.model.loaded,
            checkpoint_detected=context.bundle.checkpoint_detected,
            sequence_length=payload.sequence_length,
            top_k=payload.top_k,
        )

    def end_session(self, session_id: str) -> SessionEndResponse:
        session = self.sessions.pop(session_id, None)
        if session is None:
            return SessionEndResponse(session_id=session_id, status="missing", message="Session not found.", active_sessions=self.active_sessions)

        return SessionEndResponse(session_id=session_id, status="ended", message="Session ended.", active_sessions=self.active_sessions)

    def recognize(self, payload: RecognitionFrameRequest) -> RecognitionFrameResponse:
        context = self._ensure_context()
        self._ensure_model()
        session = self._get_session(payload.session_id, payload.sequence_length)
        started_at = time.perf_counter()

        _, landmarks = self.landmark_extractor.preprocess_image(payload.image)
        if not landmarks.pose and not landmarks.left_hand and not landmarks.right_hand and not landmarks.face:
            return self._build_response(
                session_id=payload.session_id,
                payload=payload,
                session=session,
                predictions=[],
                bundle_labels=context.bundle.labels,
                status="degraded",
                message="MediaPipe preprocessing failed to produce landmarks.",
                latency_ms=(time.perf_counter() - started_at) * 1000.0,
            )

        session.frames.append(landmarks)
        session.touch()

        if len(session.frames) < payload.sequence_length:
            return self._build_response(
                session_id=payload.session_id,
                payload=payload,
                session=session,
                predictions=[],
                bundle_labels=context.bundle.labels,
                status="buffering",
                message=f"Buffered {len(session.frames)} of {payload.sequence_length} frames.",
                latency_ms=(time.perf_counter() - started_at) * 1000.0,
            )

        predictions = self._predict(session, payload.sequence_length, max(1, payload.top_k))
        if not predictions:
            return self._build_response(
                session_id=payload.session_id,
                payload=payload,
                session=session,
                predictions=[],
                bundle_labels=context.bundle.labels,
                status="degraded",
                message="Recognition backend is ready, but no checkpoint was found or the loaded model could not emit scores.",
                latency_ms=(time.perf_counter() - started_at) * 1000.0,
            )

        session.last_prediction = predictions[0].label
        return self._build_response(
            session_id=payload.session_id,
            payload=payload,
            session=session,
            predictions=predictions,
            bundle_labels=context.bundle.labels,
            status="predicted",
            message="Prediction generated from the buffered temporal sequence.",
            latency_ms=(time.perf_counter() - started_at) * 1000.0,
        )

    def labels(self) -> LabelsResponse:
        context = self._ensure_context()
        self._ensure_model()
        return LabelsResponse(labels=context.bundle.labels, count=len(context.bundle.labels), model_loaded=context.bundle.checkpoint_detected)

    def status(self) -> StatusResponse:
        context = self._ensure_context()
        self._ensure_model()
        return StatusResponse(
            backend=self.model_name,
            model_loaded=bool(self.model and self.model.loaded),
            checkpoint_detected=context.bundle.checkpoint_detected,
            message=self.message,
            labels=context.bundle.labels,
            active_sessions=self.active_sessions,
            sequence_length=context.config.sequence_length,
            confidence_threshold=context.config.confidence_threshold,
        )

    def health(self) -> HealthResponse:
        context = self._ensure_context()
        self._ensure_model()
        return HealthResponse(
            backend=self.model_name,
            model_loaded=bool(self.model and self.model.loaded),
            checkpoint_detected=context.bundle.checkpoint_detected,
            message=self.message,
            device=context.config.device,
            sequence_length=context.config.sequence_length,
            confidence_threshold=context.config.confidence_threshold,
            active_sessions=self.active_sessions,
        )


pipeline = RecognitionPipeline()