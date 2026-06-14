from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_recognition_status_endpoint() -> None:
    response = client.get("/api/v1/status")

    assert response.status_code == 200
    payload = response.json()
    assert "labels" in payload
    assert "active_sessions" in payload