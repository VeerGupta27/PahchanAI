"""
messaging/publisher.py
Redis Pub/Sub publisher.

The CIS uses this to broadcast a serialised embedding payload to ALL
subscribed nodes simultaneously via a single Redis PUBLISH call.
"""

import json
import redis.asyncio as aioredis

from app.config import get_settings

settings = get_settings()


class EmbeddingPublisher:
    """Thin async wrapper around Redis PUBLISH."""

    def __init__(self):
        self._client: aioredis.Redis | None = None

    async def connect(self):
        self._client = aioredis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True,
        )

    async def disconnect(self):
        if self._client:
            await self._client.aclose()

    async def publish_embedding(self, payload: dict) -> int:
        """
        Publish an embedding payload to the shared channel.

        Parameters
        ----------
        payload : dict
            Must contain at least:
              - circulation_id  (str UUID)
              - source_node_id  (str)
              - embedding        (list[float], length 128)
              - case_id          (str | None)

        Returns
        -------
        int
            Number of subscribers that received the message.
        """
        if not self._client:
            raise RuntimeError("Publisher not connected. Call connect() first.")

        message = json.dumps(payload)
        receivers = await self._client.publish(
            settings.REDIS_EMBEDDING_CHANNEL, message
        )
        return receivers


# ---- Module-level singleton used by FastAPI lifespan ----
publisher = EmbeddingPublisher()
