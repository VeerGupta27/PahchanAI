from __future__ import annotations
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field, field_validator


class CirculateEmbeddingRequest(BaseModel):
    source_node_id: str = Field(..., description="Unique ID of the originating node")
    embedding: list[float] = Field(..., description="128-D FaceNet embedding")
    case_id: str | None = Field(None)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("embedding")
    @classmethod
    def must_be_128d(cls, v):
        if len(v) != 128:
            raise ValueError(f"Embedding must be 128-dimensional, got {len(v)}")
        return v


class MatchResponseRequest(BaseModel):
    circulation_id: str
    reporting_node_id: str
    matched_person_id: str
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    location_hint: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


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