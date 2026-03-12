"""
utils/schemas.py
Pydantic v2 models for API request/response validation.
"""

from __future__ import annotations
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field, field_validator


# ─────────────────────────── Inbound ────────────────────────────

class CirculateEmbeddingRequest(BaseModel):
    """Payload a node sends to /circulate_embedding."""
    source_node_id: str = Field(..., description="Unique ID of the originating node")
    embedding: list[float] = Field(..., description="128-D FaceNet embedding")
    case_id: str | None = Field(None, description="Optional missing-person case reference")
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("embedding")
    @classmethod
    def must_be_128d(cls, v):
        if len(v) != 128:
            raise ValueError(f"Embedding must be 128-dimensional, got {len(v)}")
        return v


class MatchResponseRequest(BaseModel):
    """Payload a node sends to /match_response when it finds a match."""
    circulation_id: str = Field(..., description="ID of the circulated embedding")
    reporting_node_id: str = Field(..., description="Node that found the match")
    matched_person_id: str = Field(..., description="Local DB ID of matched person")
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    location_hint: str | None = Field(None, description="Camera label or GPS coords")
    metadata: dict[str, Any] = Field(default_factory=dict)


# ─────────────────────────── Outbound ───────────────────────────

class CirculateEmbeddingResponse(BaseModel):
    circulation_id: str
    embedding_hash: str
    recipient_count: int
    status: str = "circulated"


class AlertResponse(BaseModel):
    id: str
    matched_person_id: str
    reporting_node_id: str
    similarity_score: float
    location_hint: str | None
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SystemStatusResponse(BaseModel):
    app_name: str
    version: str
    redis_embedding_channel: str
    redis_match_channel: str
    match_threshold: float
    status: str = "ok"
