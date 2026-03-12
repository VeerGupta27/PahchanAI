"""
services/circulation_service.py
Core CIS business logic: receive an embedding, persist a log entry,
then broadcast it to all subscribed nodes via Redis Pub/Sub.
"""

import hashlib
import json
import uuid
import structlog

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database.models import CirculationLog
from app.messaging.publisher import publisher

settings = get_settings()
log = structlog.get_logger(__name__)


def _hash_embedding(embedding: list[float]) -> str:
    """SHA-256 fingerprint of the raw embedding vector (for deduplication)."""
    raw = json.dumps(embedding, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


class CirculationService:
    """
    Orchestrates the embedding circulation pipeline:

    1. Accept embedding from a source node
    2. Write a CirculationLog row to PostgreSQL
    3. Publish the payload to Redis → all nodes receive it
    4. Return the circulation_id so callers can correlate responses
    """

    async def circulate(
        self,
        db: AsyncSession,
        source_node_id: str,
        embedding: list[float],
        case_id: str | None = None,
        extra_metadata: dict | None = None,
    ) -> dict:
        """
        Circulate a 128-D face embedding across all nodes.

        Parameters
        ----------
        db              : async SQLAlchemy session
        source_node_id  : ID of the node that originated the embedding
        embedding       : 128-element float list from FaceNet
        case_id         : optional missing-person case reference
        extra_metadata  : any additional JSON the source node wants to attach

        Returns
        -------
        dict with circulation_id, recipient_count, embedding_hash
        """
        if len(embedding) != 128:
            raise ValueError(f"Expected 128-D embedding, got {len(embedding)}-D")

        circulation_id = str(uuid.uuid4())
        emb_hash = _hash_embedding(embedding)

        # ── 1. Persist the circulation log (before publishing so the FK is valid) ──
        log_entry = CirculationLog(
            id=circulation_id,
            source_node_id=source_node_id,
            case_id=case_id,
            embedding_hash=emb_hash,
            recipient_count=0,   # will update after publish
        )
        db.add(log_entry)
        await db.flush()   # get the row into DB without committing yet

        # ── 2. Build the Redis payload ──
        payload = {
            "circulation_id": circulation_id,
            "source_node_id": source_node_id,
            "case_id": case_id,
            "embedding": embedding,
            "metadata": extra_metadata or {},
        }

        # ── 3. Publish to Redis (all nodes get this instantly) ──
        try:
            recipient_count = await publisher.publish_embedding(payload)
        except Exception as exc:
            log.error("circulation.publish_failed", error=str(exc))
            recipient_count = 0

        # ── 4. Update recipient count and commit ──
        log_entry.recipient_count = recipient_count
        await db.commit()

        log.info(
            "circulation.done",
            circulation_id=circulation_id,
            source_node=source_node_id,
            recipients=recipient_count,
            case_id=case_id,
        )

        return {
            "circulation_id": circulation_id,
            "embedding_hash": emb_hash,
            "recipient_count": recipient_count,
        }
