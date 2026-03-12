"""
messaging/subscriber.py
Redis Pub/Sub subscriber running as a background asyncio task.

The CIS listens on the MATCH channel so that nodes can report
back when they find a matching face in their local database.
Each message triggers the AlertService to log the event and
fire an alert.
"""

import asyncio
import json
import structlog

import redis.asyncio as aioredis

from app.config import get_settings

settings = get_settings()
log = structlog.get_logger(__name__)


class MatchResponseSubscriber:
    """
    Long-running async subscriber for the match-response channel.

    Usage (in lifespan):
        subscriber = MatchResponseSubscriber(on_match_callback)
        await subscriber.start()
        ...
        await subscriber.stop()
    """

    def __init__(self, on_match_callback):
        """
        Parameters
        ----------
        on_match_callback : async callable
            Called with the parsed match dict for every message received.
            Signature:  async def callback(match_data: dict) -> None
        """
        self._callback = on_match_callback
        self._client: aioredis.Redis | None = None
        self._pubsub: aioredis.client.PubSub | None = None
        self._task: asyncio.Task | None = None
        self._running = False

    async def start(self):
        """Connect to Redis and start the listener loop in the background."""
        self._client = aioredis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True,
        )
        self._pubsub = self._client.pubsub()
        await self._pubsub.subscribe(settings.REDIS_MATCH_CHANNEL)
        self._running = True
        self._task = asyncio.create_task(self._listen())
        log.info("match_subscriber.started", channel=settings.REDIS_MATCH_CHANNEL)

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
        if self._pubsub:
            await self._pubsub.unsubscribe()
            await self._pubsub.aclose()
        if self._client:
            await self._client.aclose()
        log.info("match_subscriber.stopped")

    async def _listen(self):
        """Continuously read messages and dispatch to the callback."""
        async for message in self._pubsub.listen():
            if not self._running:
                break

            # Redis sends a confirmation message on subscribe; skip it
            if message["type"] != "message":
                continue

            try:
                data = json.loads(message["data"])
                await self._callback(data)
            except json.JSONDecodeError:
                log.warning("match_subscriber.bad_json", raw=message["data"])
            except Exception as exc:
                log.error("match_subscriber.callback_error", error=str(exc))
