"""
app/main.py
FastAPI application factory for the PahchanAI Central Intelligence System.

Lifespan (startup / shutdown)
------------------------------
- Creates PostgreSQL tables
- Connects the Redis publisher
- Starts the Redis match-response subscriber as a background task
- Tears everything down cleanly on shutdown
"""

import structlog
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database.connection import create_tables
from app.messaging.publisher import publisher
from app.messaging.subscriber import MatchResponseSubscriber
from app.services.alert_service import AlertService
from app.api.routes import router

settings = get_settings()
log = structlog.get_logger(__name__)

# ── Alert service shared with the subscriber callback ──
alert_service = AlertService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Code before `yield` runs on startup; code after runs on shutdown.
    FastAPI guarantees this even if exceptions occur.
    """
    log.info("cis.startup", app=settings.APP_NAME, version=settings.APP_VERSION)

    # 1. Ensure all DB tables exist (idempotent)
    await create_tables()
    log.info("cis.db_ready")

    # 2. Connect the Redis publisher (broadcasts embeddings → nodes)
    await publisher.connect()
    log.info("cis.publisher_ready", channel=settings.REDIS_EMBEDDING_CHANNEL)

    # 3. Start the match-response subscriber (listens for node match reports)
    subscriber = MatchResponseSubscriber(
        on_match_callback=alert_service.handle_match_response
    )
    await subscriber.start()
    log.info("cis.subscriber_ready", channel=settings.REDIS_MATCH_CHANNEL)

    # Store subscriber on app.state so shutdown can reference it
    app.state.match_subscriber = subscriber

    yield  # ← application runs here

    # ── Shutdown ──
    log.info("cis.shutdown")
    await app.state.match_subscriber.stop()
    await publisher.disconnect()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Distributed embedding circulation hub for missing-person "
            "re-identification. Receives FaceNet embeddings from edge nodes, "
            "broadcasts them via Redis Pub/Sub, and aggregates match alerts."
        ),
        lifespan=lifespan,
    )

    # Allow all origins for hackathon convenience; tighten in production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router, prefix="")

    return app


app = create_app()
