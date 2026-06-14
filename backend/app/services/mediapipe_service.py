from __future__ import annotations

import base64
from dataclasses import dataclass
from typing import Any, Protocol

try:  # pragma: no cover - optional dependency
    import cv2
except Exception:  # pragma: no cover - optional dependency
    cv2 = None

try:  # pragma: no cover - optional dependency
    import numpy as np
except Exception:  # pragma: no cover - optional dependency
    np = None

try:  # pragma: no cover - optional dependency
    import mediapipe as mp
except Exception:  # pragma: no cover - optional dependency
    mp = None


@dataclass(slots=True)
class LandmarkBundle:
    pose: list[tuple[float, float, float, float]]
    left_hand: list[tuple[float, float, float, float]]
    right_hand: list[tuple[float, float, float, float]]
    face: list[tuple[float, float, float, float]]
    image_shape: tuple[int, int, int]
    source: str


class LandmarkExtractor(Protocol):
    def warmup(self) -> bool: ...

    def preprocess_image(self, image_payload: str) -> tuple[Any, LandmarkBundle]: ...

    def landmarks_to_pose_tensor(self, landmarks: LandmarkBundle) -> Any: ...


def landmarks_to_pose_tensor(landmarks: LandmarkBundle) -> Any:
    import torch

    pose = torch.zeros(27, 2, dtype=torch.float32)
    source_points = landmarks.pose[:27]
    for index, point in enumerate(source_points):
        pose[index, 0] = float(point[0])
        pose[index, 1] = float(point[1])

    if pose.abs().sum() == 0:
        return None

    left_shoulder = pose[11]
    right_shoulder = pose[12]
    center = (left_shoulder + right_shoulder) / 2.0
    scale = torch.linalg.vector_norm(left_shoulder - right_shoulder).clamp_min(1e-6)
    pose = ((pose - center) / scale * 0.5) + 0.5
    return torch.clamp(pose, 0.0, 1.0)


class MediaPipeService:
    def __init__(self) -> None:
        self._holistic = None

    def decode_base64_image(self, image_payload: str) -> dict[str, Any]:
        payload = image_payload.split(",", 1)[-1]
        image_bytes = base64.b64decode(payload)
        return {
            "raw_bytes": image_bytes,
            "payload": payload,
            "mime_type": image_payload.split(";", 1)[0].replace("data:", "") if image_payload.startswith("data:") else "image/jpeg",
        }

    def normalize_rgb(self, image: Any) -> Any:
        return image

    def decode_to_image(self, image_payload: str) -> Any:
        if cv2 is None or np is None:
            return self.decode_base64_image(image_payload)

        decoded = self.decode_base64_image(image_payload)
        byte_array = np.frombuffer(decoded["raw_bytes"], dtype=np.uint8)
        image = cv2.imdecode(byte_array, cv2.IMREAD_COLOR)
        if image is None:
            return decoded

        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    def warmup(self) -> bool:
        if mp is None:
            return False

        if self._holistic is None:
            self._holistic = mp.solutions.holistic.Holistic(
                static_image_mode=False,
                model_complexity=1,
                enable_segmentation=False,
                refine_face_landmarks=False,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )

        return True

    def _extract_landmarks(self, landmarks: Any) -> list[tuple[float, float, float, float]]:
        if not landmarks:
            return []

        points: list[tuple[float, float, float, float]] = []
        for landmark in landmarks.landmark:
            points.append((landmark.x, landmark.y, landmark.z, getattr(landmark, "visibility", 0.0)))
        return points

    def extract_landmarks(self, image: Any) -> LandmarkBundle:
        if mp is None or self._holistic is None:
            return LandmarkBundle(
                pose=[],
                left_hand=[],
                right_hand=[],
                face=[],
                image_shape=tuple(getattr(image, "shape", (0, 0, 0))),
                source="fallback",
            )

        results = self._holistic.process(image)
        return LandmarkBundle(
            pose=self._extract_landmarks(results.pose_landmarks),
            left_hand=self._extract_landmarks(results.left_hand_landmarks),
            right_hand=self._extract_landmarks(results.right_hand_landmarks),
            face=self._extract_landmarks(results.face_landmarks),
            image_shape=image.shape,
            source="mediapipe-holistic",
        )

    def preprocess_image(self, image_payload: str) -> tuple[Any, LandmarkBundle]:
        image = self.decode_to_image(image_payload)
        normalized = self.normalize_rgb(image)
        landmarks = self.extract_landmarks(normalized)
        return normalized, landmarks

    def landmarks_to_pose_tensor(self, landmarks: LandmarkBundle) -> Any:
        return landmarks_to_pose_tensor(landmarks)

    def preprocess_to_pose_tensor(self, image_payload: str) -> Any:
        _, landmarks = self.preprocess_image(image_payload)
        return self.landmarks_to_pose_tensor(landmarks)


class MockLandmarkExtractor:
    def __init__(self, landmarks: LandmarkBundle | None = None) -> None:
        self._landmarks = landmarks or LandmarkBundle(
            pose=[(0.5, 0.5, 0.0, 1.0)] * 27,
            left_hand=[],
            right_hand=[],
            face=[],
            image_shape=(0, 0, 0),
            source="mock",
        )

    def warmup(self) -> bool:
        return True

    def preprocess_image(self, image_payload: str) -> tuple[Any, LandmarkBundle]:
        return None, self._landmarks

    def landmarks_to_pose_tensor(self, landmarks: LandmarkBundle) -> Any:
        return landmarks_to_pose_tensor(landmarks)