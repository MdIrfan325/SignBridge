# SignBridge Backend

FastAPI backend for production sign recognition.

## What it does

- Accepts camera frames from the frontend through `POST /api/v1/recognize`
- Buffers frames into a temporal sequence before prediction
- Extracts pose and hand landmarks with MediaPipe Holistic when available
- Loads checkpoints from a local directory or explicit environment paths
- Falls back to Demo Mode when the backend is unavailable or no checkpoint is present

## API

- `GET /health`
- `POST /api/v1/recognize`
- `POST /api/v1/warmup`
- `GET /api/v1/labels`
- `GET /api/v1/status`
- `POST /api/v1/session/start`
- `POST /api/v1/session/end`
- `WS /api/v1/ws/{session_id}`

`POST /api/v1/recognize` now returns both a primary prediction and a ranked `predictions` list. The session and WebSocket routes reuse the same pipeline and temporal buffer.

FastAPI also exposes interactive docs at `/docs` and `/openapi.json`.

## Checkpoints

Place these files in `backend/checkpoints/`:

- `model.pth`
- `labels.json`
- `config.yaml`

The model layer is registry-based and can be extended through `backend/models/` for OpenHands, INCLUDE, ONNX, or TFLite implementations without changing the API layer.

If you prefer custom paths, set these environment variables:

```bash
MODEL_PATH=
LABEL_PATH=
DEVICE=cpu
SEQUENCE_LENGTH=32
CONFIDENCE_THRESHOLD=0.6
BACKEND_CORS_ORIGINS=http://localhost:3000
```

## Run locally

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Notes

- The frontend does not need to know which recognition provider is active.
- Demo Mode remains available if the backend is unavailable.
- The backend is designed to support OpenHands, INCLUDE, ST-GCN, ONNX, TFLite, and TensorRT through the same API contract.