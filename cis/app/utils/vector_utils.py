"""
utils/vector_utils.py
Lightweight numpy helpers for 128-D FaceNet embeddings.
No heavy ML framework required at the CIS layer.
"""

import numpy as np


def cosine_similarity(a: list[float] | np.ndarray, b: list[float] | np.ndarray) -> float:
    """
    Compute cosine similarity between two embedding vectors.
    Returns a value in [-1, 1]; higher means more similar.
    FaceNet embeddings are L2-normalised, so this is equivalent to dot product.
    """
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)

    norm_a = np.linalg.norm(va)
    norm_b = np.linalg.norm(vb)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(np.dot(va, vb) / (norm_a * norm_b))


def l2_normalize(v: list[float]) -> list[float]:
    """L2-normalise a vector (FaceNet does this internally, but useful for testing)."""
    arr = np.array(v, dtype=np.float32)
    norm = np.linalg.norm(arr)
    if norm == 0:
        return v
    return (arr / norm).tolist()


def random_embedding(seed: int | None = None) -> list[float]:
    """Generate a random normalised 128-D embedding (for testing / simulation)."""
    rng = np.random.default_rng(seed)
    v = rng.standard_normal(128).astype(np.float32)
    return l2_normalize(v.tolist())
