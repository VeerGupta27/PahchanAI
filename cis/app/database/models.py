"""
database/models.py
ORM models stored in PostgreSQL.

Tables
------
circulation_logs  – every embedding broadcast CIS performs
match_events      – raw match reports received from nodes
alerts            – de-duplicated, human-visible alert records
nodes             – registered nodes (for monitoring)
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, DateTime, Boolean,
    Text, Integer, ForeignKey, JSON
)
from sqlalchemy.dialects.postgresql import UUID

from app.database.connection import Base


def _uuid():
    return str(uuid.uuid4())


class CirculationLog(Base):
    """Records each embedding that the CIS circulated."""
    __tablename__ = "circulation_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    source_node_id = Column(String(64), nullable=False, index=True)
    case_id = Column(String(64), nullable=True, index=True)   # optional hint from source
    embedding_hash = Column(String(64), nullable=False)       # sha256 of the raw vector
    circulated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    recipient_count = Column(Integer, default=0)              # how many nodes received it


class MatchEvent(Base):
    """Raw match report sent back by a node."""
    __tablename__ = "match_events"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    circulation_id = Column(UUID(as_uuid=False), ForeignKey("circulation_logs.id"), nullable=True)
    reporting_node_id = Column(String(64), nullable=False, index=True)
    matched_person_id = Column(String(64), nullable=False, index=True)
    similarity_score = Column(Float, nullable=False)
    location_hint = Column(String(256), nullable=True)
    extra_data = Column(JSON, nullable=True)
    received_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Alert(Base):
    """
    A human-visible alert created when a match is confirmed.
    One alert may aggregate several MatchEvents for the same person.
    """
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    matched_person_id = Column(String(64), nullable=False, index=True)
    reporting_node_id = Column(String(64), nullable=False)
    similarity_score = Column(Float, nullable=False)
    location_hint = Column(String(256), nullable=True)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)


class NodeRegistry(Base):
    """Keeps track of known nodes and their last heartbeat."""
    __tablename__ = "nodes"

    node_id = Column(String(64), primary_key=True)
    description = Column(String(256), nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
