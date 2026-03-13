"""
FAISS vector index backed by MongoDB Atlas.

Flow:
  1. load_embeddings_from_mongo()  ← pulls all 512-dim vectors from Atlas
  2. search_face(query_embedding)  ← nearest-neighbour search, returns reference_id + distance
  3. reload_embeddings()           ← hot-reload without restarting the process
"""

import faiss
import numpy as np
from db.mongo_client import fetch_all_embeddings

DIMENSION = 512

# Module-level state
_index: faiss.IndexFlatL2 = faiss.IndexFlatL2(DIMENSION)
_labels: list[str] = []          # reference_id per FAISS row
_emails: dict[str, str] = {}     # reference_id → alert_email


def load_embeddings_from_mongo() -> int:
    """
    Pull all embeddings from MongoDB Atlas and rebuild the FAISS index.
    Returns the number of embeddings loaded.
    """
    global _index, _labels, _emails

    records = fetch_all_embeddings()

    if not records:
        print("[FAISS] No embeddings found in MongoDB.")
        return 0

    vectors = np.stack([r["embedding"] for r in records]).astype("float32")

    _index = faiss.IndexFlatL2(DIMENSION)
    _index.add(vectors)

    _labels = [r["reference_id"] for r in records]
    _emails = {r["reference_id"]: r["alert_email"] for r in records}

    print(f"[FAISS] Index built with {len(_labels)} embeddings.")
    return len(_labels)


def reload_embeddings() -> int:
    """Hot-reload embeddings without restarting the process."""
    return load_embeddings_from_mongo()


def search_face(query_embedding: np.ndarray) -> tuple[str, float, str]:
    """
    Find the closest stored face.

    Returns:
        reference_id  : matched person's reference ID
        distance      : L2 distance (lower = better match)
        alert_email   : email address associated with the match
    """
    if len(_labels) == 0:
        return "", float("inf"), ""

    q = np.array([query_embedding], dtype="float32")
    distances, indices = _index.search(q, 1)

    idx = indices[0][0]
    dist = float(distances[0][0])
    ref_id = _labels[idx]
    email = _emails.get(ref_id, "")

    return ref_id, dist, email
