"""
services/alert_service.py
Handles incoming match responses from nodes.

When a node finds a face match it publishes to the Redis match channel.
The CIS subscriber calls handle_match_response() which:
  1. Persists a MatchEvent row
  2. Creates an Alert row (the human-visible record)
  3. Logs a structured alert (could trigger webhooks, SMS etc. in production)
"""

import structlog
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import AsyncSessionLocal
from app.database.models import MatchEvent, Alert
from app.config import get_settings

settings = get_settings()
log = structlog.get_logger(__name__)


class AlertService:
    """Processes match events and raises alerts."""

    async def handle_match_response(self, match_data: dict) -> None:
        """
        Entry-point called by the Redis subscriber on every match message.

        Expected match_data keys
        ------------------------
        circulation_id    : str UUID (links back to the CirculationLog)
        reporting_node_id : str      (which node found the match)
        matched_person_id : str      (local DB ID of the matched person)
        similarity_score  : float    (0-1, higher = more similar)
        location_hint     : str      (camera / GPS label, optional)
        metadata          : dict     (any extra context, optional)
        """
        # Use a fresh session because this runs in a background task,
        # not in a FastAPI request context.
        async with AsyncSessionLocal() as db:
            try:
                await self._persist_and_alert(db, match_data)
                await db.commit()
            except Exception as exc:
                await db.rollback()
                log.error("alert_service.error", error=str(exc), data=match_data)

    async def _persist_and_alert(self, db: AsyncSession, data: dict) -> None:
        similarity = float(data.get("similarity_score", 0.0))

        # ── 1. Only proceed if score meets threshold ──
        if similarity < settings.MATCH_THRESHOLD:
            log.info(
                "alert_service.below_threshold",
                score=similarity,
                threshold=settings.MATCH_THRESHOLD,
            )
            return

        # ── 2. Persist raw MatchEvent ──
        event = MatchEvent(
            circulation_id=data.get("circulation_id"),
            reporting_node_id=data["reporting_node_id"],
            matched_person_id=data["matched_person_id"],
            similarity_score=similarity,
            location_hint=data.get("location_hint"),
            metadata=data.get("metadata"),
            received_at=datetime.utcnow(),
        )
        db.add(event)

        # ── 3. Create a human-visible Alert ──
        alert = Alert(
            matched_person_id=data["matched_person_id"],
            reporting_node_id=data["reporting_node_id"],
            similarity_score=similarity,
            location_hint=data.get("location_hint"),
        )
        db.add(alert)
        await db.flush()

        # ── 4. Structured log (extend here for webhook / SMS / push) ──
        log.warning(
            "🚨 ALERT: MISSING PERSON MATCH FOUND",
            alert_id=alert.id,
            person_id=alert.matched_person_id,
            node=alert.reporting_node_id,
            score=f"{similarity:.4f}",
            location=alert.location_hint,
        )

    async def get_all_alerts(self, db: AsyncSession) -> list[Alert]:
        from sqlalchemy import select, desc
        result = await db.execute(
            select(Alert).order_by(desc(Alert.created_at)).limit(100)
        )
        return result.scalars().all()
