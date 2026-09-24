from __future__ import annotations
import math
import hashlib
import re
from typing import List, Optional


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Calculates cosine similarity between two float vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    
    return dot_product / (norm_a * norm_b)


class DeterministicEmbeddingsGenerator:
    """
    High-speed, zero-dependency embedding generator.
    Produces deterministic 128-dimensional dense semantic vectors with L2 normalization.
    """

    def __init__(self, dimensions: int = 128):
        self.dimensions = dimensions

    def embed_text(self, text: str) -> List[float]:
        """Converts arbitrary text into a normalized embedding vector."""
        if not text:
            return [0.0] * self.dimensions

        # Tokenize and compute character n-grams and token frequencies
        tokens = re.findall(r"\w+", text.lower())
        vec = [0.0] * self.dimensions

        for token in tokens:
            # Hash token to dimension indices
            h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            dim_idx = h % self.dimensions
            weight = 1.0 + (len(token) * 0.1)
            vec[dim_idx] += weight

            # Also add 3-grams for semantic fuzzy tolerance
            if len(token) >= 3:
                for i in range(len(token) - 2):
                    ngram = token[i:i+3]
                    h_ng = int(hashlib.sha256(ngram.encode("utf-8")).hexdigest(), 16)
                    vec[h_ng % self.dimensions] += 0.35

        # L2-normalize vector
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            return [round(x / norm, 6) for x in vec]
        return vec

    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        """Embeds a batch of documents."""
        return [self.embed_text(doc) for doc in documents]
