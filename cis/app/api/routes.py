"""
api/routes.py
FastAPI route definitions for the CIS public API.

Endpoints
---------
POST /circulate_embedding  – node sends embedding → CIS broadcasts it
POST /match_response       – node reports a match → CIS logs alert
GET  /alerts               – list recent alerts
GET  /system_status        – health / config snapshot
"""

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.services.circulation_service import CirculationService
from app.services.alert_service import AlertService
from app.messaging.publisher import publisher
from app.config import get_settings
from app.utils.schemas import (
    CirculateEmbeddingRequest,
    CirculateEmbeddingResponse,
    MatchResponseRequest,
    AlertResponse,
    SystemStatusResponse,
)

router = APIRouter()
log = structlog.get_logger(__name__)
settings = get_settings()

# Instantiate services (stateless – safe to share across requests)
circulation_svc = CirculationService()
alert_svc = AlertService()


# ─────────────────────────────────────────────────────────────────────────────
# POST /circulate_embedding
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/circulate_embedding",
    response_model=CirculateEmbeddingResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Receive an embedding from a node and broadcast it to all peers",
)
async def circulate_embedding(
    body: CirculateEmbeddingRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Workflow triggered here:
    1. Validate the 128-D embedding
    2. Persist a CirculationLog entry
    3. Publish to Redis → all subscribed nodes receive the embedding
    4. Return circulation_id so the node can correlate future match responses
    """
    log.info(
        "api.circulate_embedding.received",
        source=body.source_node_id,
        case_id=body.case_id,
    )

    try:
        result = await circulation_svc.circulate(
            db=db,
            source_node_id=body.source_node_id,
            embedding=body.embedding,
            case_id=body.case_id,
            extra_metadata=body.metadata,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        log.error("api.circulate_embedding.error", error=str(exc))
        raise HTTPException(status_code=500, detail="Internal circulation error")

    return CirculateEmbeddingResponse(**result)


# ─────────────────────────────────────────────────────────────────────────────
# POST /match_response
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/match_response",
    status_code=status.HTTP_200_OK,
    summary="Receive a match report from a node",
)
async def match_response(body: MatchResponseRequest):
    """
    Nodes call this when they find a match in their local database.
    The CIS persists the event and raises an alert if score ≥ threshold.

    Note: alert handling runs via the Redis subscriber background task.
    This endpoint is an alternative/fallback for nodes that prefer HTTP
    over Redis for reporting (e.g. nodes behind strict firewalls).
    """
    log.info(
        "api.match_response.received",
        node=body.reporting_node_id,
        person=body.matched_person_id,
        score=body.similarity_score,
    )

    await alert_svc.handle_match_response(body.model_dump())

    return {
        "status": "received",
        "circulation_id": body.circulation_id,
        "person_id": body.matched_person_id,
        "score": body.similarity_score,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /alerts
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/alerts",
    response_model=list[AlertResponse],
    summary="List the 100 most recent alerts",
)
async def get_alerts(db: AsyncSession = Depends(get_db)):
    alerts = await alert_svc.get_all_alerts(db)
    return [AlertResponse.model_validate(a) for a in alerts]


# ─────────────────────────────────────────────────────────────────────────────
# GET /system_status
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/system_status",
    response_model=SystemStatusResponse,
    summary="Health check and system configuration snapshot",
)
async def system_status():
    return SystemStatusResponse(
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        redis_embedding_channel=settings.REDIS_EMBEDDING_CHANNEL,
        redis_match_channel=settings.REDIS_MATCH_CHANNEL,
        match_threshold=settings.MATCH_THRESHOLD,
    )
