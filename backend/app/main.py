from __future__ import annotations

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.recognition import router as recognition_router
from app.models.recognition import API_VERSION
from app.services.predictor import pipeline

app = FastAPI(
    title="SignBridge Recognition API",
    version="0.1.0",
    description="FastAPI backend for temporal sign recognition with MediaPipe buffering and swappable checkpoints.",
)

cors_origins = [origin.strip() for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(recognition_router, prefix="/api/v1")


@app.middleware("http")
async def api_version_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-SignBridge-API-Version"] = API_VERSION
    return response


@app.on_event("startup")
async def startup_event() -> None:
    pipeline.warmup()