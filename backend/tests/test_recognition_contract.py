from fastapi.testclient import TestClient

from app.api import recognition as recognition_api
from app.main import app
from app.models.recognition import API_VERSION
from app.services.mediapipe_service import LandmarkBundle, MockLandmarkExtractor
from app.services.predictor import RecognitionPipeline


def _make_bundle() -> LandmarkBundle:
    pose = [(0.5, 0.5, 0.0, 1.0)] * 27
    pose[11] = (0.4, 0.5, 0.0, 1.0)
    pose[12] = (0.6, 0.5, 0.0, 1.0)
    return LandmarkBundle(
        pose=pose,
        left_hand=[],
        right_hand=[],
        face=[],
        image_shape=(720, 1280, 3),
        source="test",
    )


def test_recognition_contract_exposes_api_version_and_injected_extractor(monkeypatch) -> None:
    test_pipeline = RecognitionPipeline(landmark_extractor=MockLandmarkExtractor(_make_bundle()))
    monkeypatch.setattr(recognition_api, "pipeline", test_pipeline)

    client = TestClient(app)
    response = client.post(
        "/api/v1/recognize",
        json={
            "image": "data:image/jpeg;base64,ZmFrZQ==",
            "sequence_length": 1,
            "top_k": 3,
        },
    )

    assert response.status_code == 200
    assert response.headers["X-SignBridge-API-Version"] == API_VERSION

    payload = response.json()
    assert payload["api_version"] == API_VERSION
    assert payload["model"] == "openhands-lstm"
    assert payload["latency_ms"] is not None
    assert payload["status"] in {"predicted", "buffering", "degraded"}