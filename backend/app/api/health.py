from __future__ import annotations

from fastapi import APIRouter

from app.models.recognition import HealthResponse
from app.services.predictor import pipeline

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return pipeline.health()