from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.models.recognition import (
    LabelsResponse,
    RecognitionFrameRequest,
    RecognitionFrameResponse,
    SessionEndRequest,
    SessionEndResponse,
    SessionStartRequest,
    SessionStartResponse,
    StatusResponse,
    WarmupResponse,
)
from app.services.predictor import pipeline

router = APIRouter(tags=["recognition"])


@router.post("/recognize", response_model=RecognitionFrameResponse)
async def recognize(payload: RecognitionFrameRequest) -> RecognitionFrameResponse:
    return pipeline.recognize(payload)


@router.post("/warmup", response_model=WarmupResponse)
async def warmup() -> WarmupResponse:
    return pipeline.warmup()


@router.get("/labels", response_model=LabelsResponse)
async def labels() -> LabelsResponse:
    return pipeline.labels()


@router.get("/status", response_model=StatusResponse)
async def status() -> StatusResponse:
    return pipeline.status()


@router.post("/session/start", response_model=SessionStartResponse)
async def start_session(payload: SessionStartRequest) -> SessionStartResponse:
    return pipeline.start_session(payload)


@router.post("/session/end", response_model=SessionEndResponse)
async def end_session(payload: SessionEndRequest) -> SessionEndResponse:
    return pipeline.end_session(payload.session_id)


@router.websocket("/ws/{session_id}")
async def websocket_recognition(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()

    try:
        while True:
            message = await websocket.receive_json()

            if message.get("type") == "end":
                await websocket.send_json(pipeline.end_session(session_id).model_dump())
                await websocket.close()
                return

            payload = RecognitionFrameRequest(
                session_id=session_id,
                language=message.get("language", "isl"),
                image=message["image"],
                frame_index=int(message.get("frame_index", 0)),
                timestamp=message.get("timestamp"),
                sequence_length=int(message.get("sequence_length", 32)),
                preprocessing_level=message.get("preprocessing_level", "minimal"),
                top_k=int(message.get("top_k", 5)),
            )
            response = pipeline.recognize(payload)
            await websocket.send_json(response.model_dump())
    except WebSocketDisconnect:
        pipeline.touch_session(session_id)
    except Exception as error:
        await websocket.send_json({"status": "error", "message": str(error)})