"""
node_simulator/simulator.py
==========================
Simulates an AI edge node that:
  1. Subscribes to the Redis embedding channel (pahchan:embeddings)
  2. Receives circulated embeddings from the CIS
  3. Runs cosine-similarity matching against a tiny in-memory "local DB"
  4. If a match is found → publishes a response to pahchan:matches
     AND optionally POSTs to the CIS /match_response endpoint

Run this script in a separate terminal BEFORE sending embeddings to the CIS.
You can launch multiple instances with different NODE_ID env vars to simulate
a distributed camera network.

Usage
-----
    # Terminal 1 – node alpha
    NODE_ID=node-alpha python -m node_simulator.simulator

    # Terminal 2 – node beta
    NODE_ID=node-beta python -m node_simulator.simulator
"""

import asyncio
import json
import os
import sys
import random

import numpy as np
import redis.asyncio as aioredis
import httpx

# ── Make the project root importable ──
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.config import get_settings
from app.utils.vector_utils import cosine_similarity, random_embedding

settings = get_settings()

NODE_ID = os.getenv("NODE_ID", "node-simulator-1")
CIS_BASE_URL = os.getenv("CIS_BASE_URL", "http://localhost:8000")

# ─────────────────────────────────────────────────────────────────────────────
# Simulated local missing-person database
# In production this would be a real vector DB (FAISS, Weaviate, pgvector…)
# ─────────────────────────────────────────────────────────────────────────────
def _build_local_db(n: int = 5) -> dict:
    """
    Build a tiny fake local database.
    Keys are person IDs; values are their stored 128-D embeddings.
    One entry is intentionally close to a "planted" embedding so
    we can demo a successful match.
    """
    db = {}
    for i in range(n):
        db[f"person-{i:03d}"] = random_embedding(seed=i + 100)

    # Plant a known person that should be easy to match
    db["MISSING-001"] = random_embedding(seed=42)
    return db


LOCAL_DB = _build_local_db()
print(f"[{NODE_ID}] Local DB loaded with {len(LOCAL_DB)} records.")


# ─────────────────────────────────────────────────────────────────────────────
# Matching logic
# ─────────────────────────────────────────────────────────────────────────────
def find_best_match(query_embedding: list[float]) -> tuple[str | None, float]:
    """
    Brute-force nearest-neighbour search over the local DB.
    Returns (person_id, score) or (None, 0.0) if no match exceeds threshold.
    """
    best_id, best_score = None, 0.0

    for person_id, stored_emb in LOCAL_DB.items():
        score = cosine_similarity(query_embedding, stored_emb)
        if score > best_score:
            best_score = score
            best_id = person_id

    if best_score >= settings.MATCH_THRESHOLD:
        return best_id, best_score

    return None, best_score


# ─────────────────────────────────────────────────────────────────────────────
# Redis subscriber loop
# ─────────────────────────────────────────────────────────────────────────────
async def run_node():
    redis_client = aioredis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        decode_responses=True,
    )
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(settings.REDIS_EMBEDDING_CHANNEL)

    print(f"[{NODE_ID}] Subscribed to '{settings.REDIS_EMBEDDING_CHANNEL}'. Waiting for embeddings…")

    async with httpx.AsyncClient(base_url=CIS_BASE_URL, timeout=5.0) as http:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue

            try:
                payload = json.loads(message["data"])
            except json.JSONDecodeError:
                print(f"[{NODE_ID}] ⚠  Bad JSON received, skipping.")
                continue

            circulation_id = payload.get("circulation_id", "unknown")
            source_node = payload.get("source_node_id", "unknown")
            embedding = payload.get("embedding", [])

            print(
                f"[{NODE_ID}] 📥 Received embedding | "
                f"circulation_id={circulation_id} | from={source_node}"
            )

            # Don't process embeddings we originated ourselves
            if source_node == NODE_ID:
                print(f"[{NODE_ID}]    ↩  Skipping own embedding.")
                continue

            # ── Local matching ──
            matched_id, score = find_best_match(embedding)

            if matched_id:
                print(
                    f"[{NODE_ID}] 🎯 MATCH FOUND: {matched_id} "
                    f"(score={score:.4f}) for circulation {circulation_id}"
                )

                # Report via Redis match channel
                match_payload = {
                    "circulation_id": circulation_id,
                    "reporting_node_id": NODE_ID,
                    "matched_person_id": matched_id,
                    "similarity_score": score,
                    "location_hint": f"Camera at {NODE_ID}",
                    "metadata": {"local_db_size": len(LOCAL_DB)},
                }
                await redis_client.publish(
                    settings.REDIS_MATCH_CHANNEL,
                    json.dumps(match_payload),
                )

                # Also POST to CIS HTTP endpoint as a fallback / audit trail
                try:
                    resp = await http.post("/match_response", json=match_payload)
                    print(f"[{NODE_ID}]    HTTP /match_response → {resp.status_code}")
                except httpx.RequestError as exc:
                    print(f"[{NODE_ID}]    HTTP /match_response failed: {exc}")

            else:
                print(
                    f"[{NODE_ID}]    No match (best score={score:.4f}, "
                    f"threshold={settings.MATCH_THRESHOLD})"
                )


if __name__ == "__main__":
    try:
        asyncio.run(run_node())
    except KeyboardInterrupt:
        print(f"\n[{NODE_ID}] Shutting down.")
