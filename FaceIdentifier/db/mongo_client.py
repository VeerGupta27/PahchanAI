"""
MongoDB Atlas - READ ONLY
The website handles registration. This service only fetches:
  - embeddings (512-dim vector)
  - reference_id
  - alert_email
"""

from pymongo import MongoClient
import numpy as np
from config import MONGODB_URI, MONGODB_DB, EMBEDDINGS_COLLECTION


_client = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        _client.admin.command("ping")
        print("[MongoDB] Connected to Atlas successfully.")
    return _client


def get_db():
    return get_client()[MONGODB_DB]


def fetch_all_embeddings() -> list[dict]:
    """
    Fetch all embeddings from MongoDB Atlas.
    Returns list of:
      { "reference_id": str, "embedding": np.ndarray(512,), "alert_email": str }
    """
    col = get_db()[EMBEDDINGS_COLLECTION]
    results = []
    for doc in col.find({}, {"_id": 1, "embedding": 1, "reporterEmail": 1}):
        emb = np.array(doc["embedding"], dtype="float32")
        results.append({
            "reference_id": doc["_id"],
            "embedding": emb,
            "name": doc.get("name", "Unknown"),
            "alert_email": doc.get("reporterEmail", ""),
        })
    print(f"[MongoDB] Loaded {len(results)} embeddings from Atlas.")
    return results


def fetch_person(reference_id: str) -> dict | None:
    """
    Fetch full person record by reference_id.
    Used after a match to get name, image, metadata for the email alert.
    """
    from config import PERSONS_COLLECTION
    col = get_db()[PERSONS_COLLECTION]
    return col.find_one({"reference_id": reference_id})