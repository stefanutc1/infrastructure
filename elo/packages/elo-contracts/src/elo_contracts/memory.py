from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class SemanticMemoryEntry(BaseModel):
    """Represents an item stored in semantic memory."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    domain: str = Field(default="homelab", description="Domain namespace: homelab, ansible, session, user_pref, vm_context")
    content: str = Field(description="The textual memory content or documentation chunk")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata tags, source file, IP references")
    embedding: Optional[List[float]] = Field(default=None, description="Vector embedding representation (e.g. 768 or 384 dimensions)")


class MemorySearchQuery(BaseModel):
    """Query parameters for vector semantic retrieval."""
    query: str
    domain: Optional[str] = None
    top_k: int = Field(default=3, ge=1, le=20)
    min_similarity: float = Field(default=0.1, ge=0.0, le=1.0)


class MemorySearchResult(BaseModel):
    """Result of a semantic memory search."""
    entry: SemanticMemoryEntry
    similarity: float = Field(description="Cosine similarity score (0.0 to 1.0)")


class UserPreference(BaseModel):
    """Saved persistent user preference or system instruction."""
    key: str
    value: Any
    category: str = Field(default="general")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
