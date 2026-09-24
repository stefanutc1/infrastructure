from __future__ import annotations

import math
import re
import uuid
from collections import Counter
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel, Field
from elo_ai_client.embeddings import DeterministicEmbeddingsGenerator, cosine_similarity


class HybridMemoryEntry(BaseModel):
    """
    Rich hybrid memory document combining dense vector representations,
    lexical indexing, and access frequency tracking.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    domain: str = Field(default="homelab", description="Domain namespace (homelab, ansible, secops, sysadmin, business)")
    content: str = Field(description="The textual memory content or document chunk")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata tags, IP, service names")
    embedding: Optional[List[float]] = Field(default=None, description="Dense embedding vector")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    access_count: int = Field(default=0)
    last_accessed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class HybridSearchResult(BaseModel):
    """
    Comprehensive search result with individual component scores and final hybrid rank.
    """
    entry: HybridMemoryEntry
    dense_score: float = Field(description="Cosine similarity of dense embeddings [0..1]")
    bm25_score: float = Field(description="Normalized BM25 lexical keyword score [0..1]")
    time_decay_factor: float = Field(description="Recency exponential decay factor [0..1]")
    access_boost: float = Field(description="Frequency of access boost factor [0..1]")
    combined_score: float = Field(description="Weighted hybrid score [0..1]")


class BM25Index:
    """
    Okapi BM25 index for sparse lexical matching with term frequency saturation
    and document length normalization.
    """

    def __init__(self, k1: float = 1.5, b: float = 0.75) -> None:
        self.k1 = k1
        self.b = b
        self.doc_lengths: Dict[str, int] = {}
        self.doc_term_freqs: Dict[str, Counter[str]] = {}
        self.term_doc_counts: Counter[str] = Counter()
        self.total_docs: int = 0
        self.avg_doc_length: float = 0.0

    @staticmethod
    def tokenize(text: str) -> List[str]:
        """Lowercases and extracts alphanumerical tokens, preserving IP numbers and dashes."""
        return [t for t in re.findall(r"[a-zA-Z0-9_\.-]+", text.lower()) if len(t) > 1]

    def add_document(self, doc_id: str, text: str) -> None:
        tokens = self.tokenize(text)
        length = len(tokens)
        tf = Counter(tokens)

        # Update if doc exists
        if doc_id in self.doc_lengths:
            self.remove_document(doc_id)

        self.doc_lengths[doc_id] = length
        self.doc_term_freqs[doc_id] = tf
        for term in tf.keys():
            self.term_doc_counts[term] += 1

        self.total_docs += 1
        self._recompute_avgdl()

    def remove_document(self, doc_id: str) -> None:
        if doc_id not in self.doc_lengths:
            return

        tf = self.doc_term_freqs.pop(doc_id, Counter())
        self.doc_lengths.pop(doc_id, None)

        for term in tf.keys():
            self.term_doc_counts[term] -= 1
            if self.term_doc_counts[term] <= 0:
                del self.term_doc_counts[term]

        self.total_docs = max(0, self.total_docs - 1)
        self._recompute_avgdl()

    def _recompute_avgdl(self) -> None:
        if self.total_docs > 0:
            self.avg_doc_length = sum(self.doc_lengths.values()) / self.total_docs
        else:
            self.avg_doc_length = 0.0

    def compute_scores(self, query: str) -> Dict[str, float]:
        """
        Computes raw BM25 scores for all indexed documents matching query terms.
        """
        q_tokens = self.tokenize(query)
        if not q_tokens or self.total_docs == 0:
            return {}

        scores: Dict[str, float] = {}

        for term in q_tokens:
            n_q = self.term_doc_counts.get(term, 0)
            if n_q == 0:
                continue

            # IDF computation (Robertson-Spärck Jones formula)
            idf = math.log(1.0 + (self.total_docs - n_q + 0.5) / (n_q + 0.5))

            for doc_id, tf_counter in self.doc_term_freqs.items():
                f_q = tf_counter.get(term, 0)
                if f_q == 0:
                    continue

                doc_len = self.doc_lengths.get(doc_id, 0)
                denom = f_q + self.k1 * (1.0 - self.b + self.b * (doc_len / (self.avg_doc_length or 1.0)))
                term_score = idf * ((f_q * (self.k1 + 1.0)) / (denom or 1.0))

                scores[doc_id] = scores.get(doc_id, 0.0) + term_score

        return scores


class TimeDecayCalculator:
    """Calculates recency scoring based on half-life decay function."""

    @staticmethod
    def calculate_decay(created_at: datetime, half_life_days: float = 30.0) -> float:
        now = datetime.now(timezone.utc)
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        delta_days = max(0.0, (now - created_at).total_seconds() / 86400.0)
        # S_time = 2 ^ (-delta / half_life)
        return float(math.pow(2.0, -delta_days / max(1.0, half_life_days)))


class HybridVectorStore:
    """
    Hybrid Vector Store combining pgvector dense embeddings with BM25 keyword matching
    and time-decay scoring.
    """

    def __init__(
        self,
        pg_connection_string: Optional[str] = None,
        embedder: Optional[DeterministicEmbeddingsGenerator] = None,
        default_dense_weight: float = 0.50,
        default_bm25_weight: float = 0.30,
        default_recency_weight: float = 0.15,
        default_access_weight: float = 0.05,
        half_life_days: float = 30.0,
    ) -> None:
        self.pg_conn = pg_connection_string
        self.embedder = embedder or DeterministicEmbeddingsGenerator(dimensions=128)
        self.default_dense_weight = default_dense_weight
        self.default_bm25_weight = default_bm25_weight
        self.default_recency_weight = default_recency_weight
        self.default_access_weight = default_access_weight
        self.half_life_days = half_life_days

        self._entries: Dict[str, HybridMemoryEntry] = {}
        self._bm25 = BM25Index()
        self._bootstrap_knowledge()

    def _bootstrap_knowledge(self) -> None:
        """Seeds foundational homelab infrastructure context."""
        seeds = [
            (
                "homelab",
                "Proxmox VE Hypervisor (pve-node-1) rulează pe IP-ul 192.168.1.132 pe portul 8006. "
                "Găzduiește VM 200 (OPNsense Firewall) și VM 201 (Windows Server 2025 Datacenter) și containerele LXC.",
                {"tags": ["proxmox", "pve", "192.168.1.132", "hypervisor", "vm200", "vm201"]},
            ),
            (
                "homelab",
                "OpenMediaVault NAS (openmediavault-nas) rulează pe IP-ul 192.168.1.135. "
                "Gestionează pool-urile ZFS mirror, share-urile SMB/NFS și backup-urile BorgBackup.",
                {"tags": ["nas", "openmediavault", "192.168.1.135", "zfs", "storage"]},
            ),
            (
                "homelab",
                "Nodul local este Apple M1 Compute (MacBook-Air.local) pe IP-ul 192.168.1.133. "
                "Rulează daemonul ELO Core, aplicația desktop .NET 10 și accelerarea GPU Metal MPS.",
                {"tags": ["m1", "apple", "macbook", "192.168.1.133", "elo", "host"]},
            ),
            (
                "homelab",
                "Home Assistant Core este pe 192.168.1.10:8123 (VLAN 20) pentru control lumini Zigbee, relee Shelly și climă. "
                "Immich este pe 192.168.1.15:2283 pentru poze. Vaultwarden este pe 192.168.1.16:8080 pentru parole. Grafana pe 192.168.1.11:3000.",
                {"tags": ["homeassistant", "immich", "vaultwarden", "grafana", "services"]},
            ),
            (
                "ansible",
                "Ansible automatizează configurarea CIS Level 1 hardening pe toate nodurile din homelab prin playbook-ul playbooks/site.yml.",
                {"tags": ["ansible", "hardening", "cis", "security"]},
            ),
            (
                "secops",
                "OPNsense Firewall pe 192.168.1.1 gestionează VLAN 10 (Management), VLAN 20 (IoT/HA), VLAN 30 (DMZ). "
                "Regulile blochează accesul IoT la LAN-ul intern și permit doar MQTT/Home Assistant.",
                {"tags": ["opnsense", "firewall", "vlan", "iot", "security"]},
            ),
        ]

        for domain, content, meta in seeds:
            self.save_memory_sync(content=content, domain=domain, metadata=meta)

    def save_memory_sync(
        self,
        content: str,
        domain: str = "homelab",
        metadata: Optional[Dict[str, Any]] = None,
        timestamp: Optional[datetime] = None,
    ) -> HybridMemoryEntry:
        """Stores a memory entry synchronously with dense embeddings and BM25 indexation."""
        embedding = self.embedder.embed_text(content)
        entry_id = str(uuid.uuid4())
        created_dt = timestamp or datetime.now(timezone.utc)

        entry = HybridMemoryEntry(
            id=entry_id,
            domain=domain,
            content=content,
            metadata=metadata or {},
            embedding=embedding,
            created_at=created_dt,
            updated_at=created_dt,
            last_accessed_at=created_dt,
        )

        self._entries[entry.id] = entry
        self._bm25.add_document(entry.id, content)
        return entry

    async def save_memory(
        self,
        content: str,
        domain: str = "homelab",
        metadata: Optional[Dict[str, Any]] = None,
        timestamp: Optional[datetime] = None,
    ) -> HybridMemoryEntry:
        """Asynchronously stores a new hybrid memory item."""
        return self.save_memory_sync(content=content, domain=domain, metadata=metadata, timestamp=timestamp)

    def search_sync(
        self,
        query: str,
        domain: Optional[str] = None,
        top_k: int = 5,
        min_score: float = 0.05,
        dense_weight: Optional[float] = None,
        bm25_weight: Optional[float] = None,
        recency_weight: Optional[float] = None,
        access_weight: Optional[float] = None,
        half_life_days: Optional[float] = None,
    ) -> List[HybridSearchResult]:
        """
        Executes hybrid vector + BM25 + recency search synchronously.
        """
        w_dense = dense_weight if dense_weight is not None else self.default_dense_weight
        w_bm25 = bm25_weight if bm25_weight is not None else self.default_bm25_weight
        w_rec = recency_weight if recency_weight is not None else self.default_recency_weight
        w_acc = access_weight if access_weight is not None else self.default_access_weight
        hl_days = half_life_days if half_life_days is not None else self.half_life_days

        # Normalize weights so sum is 1.0
        total_w = w_dense + w_bm25 + w_rec + w_acc
        if total_w > 0:
            w_dense /= total_w
            w_bm25 /= total_w
            w_rec /= total_w
            w_acc /= total_w

        # 1. Dense cosine similarity
        query_vector = self.embedder.embed_text(query)

        # 2. Sparse BM25 scoring
        raw_bm25_scores = self._bm25.compute_scores(query)
        max_bm25 = max(raw_bm25_scores.values()) if raw_bm25_scores else 1.0

        candidates: List[HybridSearchResult] = []
        now_dt = datetime.now(timezone.utc)

        for entry_id, entry in self._entries.items():
            if domain and entry.domain != domain:
                continue

            # Dense score
            dense_sim = cosine_similarity(query_vector, entry.embedding or []) if entry.embedding else 0.0
            dense_sim = max(0.0, min(1.0, dense_sim))

            # BM25 normalized score
            raw_bm = raw_bm25_scores.get(entry_id, 0.0)
            bm25_norm = (raw_bm / max_bm25) if max_bm25 > 0 else 0.0

            # Recency time decay
            time_decay = TimeDecayCalculator.calculate_decay(entry.created_at, half_life_days=hl_days)

            # Access frequency boost (bounded logarithmically)
            access_boost = min(1.0, math.log1p(entry.access_count) / 5.0)

            # Combined hybrid score
            combined = (
                (w_dense * dense_sim)
                + (w_bm25 * bm25_norm)
                + (w_rec * time_decay)
                + (w_acc * access_boost)
            )

            if combined >= min_score:
                candidates.append(
                    HybridSearchResult(
                        entry=entry,
                        dense_score=round(dense_sim, 4),
                        bm25_score=round(bm25_norm, 4),
                        time_decay_factor=round(time_decay, 4),
                        access_boost=round(access_boost, 4),
                        combined_score=round(combined, 4),
                    )
                )

        candidates.sort(key=lambda x: x.combined_score, reverse=True)
        top_results = candidates[:top_k]

        # Update access count & timestamp on returned results
        for r in top_results:
            r.entry.access_count += 1
            r.entry.last_accessed_at = now_dt

        return top_results

    async def search(
        self,
        query: str,
        domain: Optional[str] = None,
        top_k: int = 5,
        min_score: float = 0.05,
        dense_weight: Optional[float] = None,
        bm25_weight: Optional[float] = None,
        recency_weight: Optional[float] = None,
        access_weight: Optional[float] = None,
        half_life_days: Optional[float] = None,
    ) -> List[HybridSearchResult]:
        """Asynchronously searches hybrid memory store."""
        return self.search_sync(
            query=query,
            domain=domain,
            top_k=top_k,
            min_score=min_score,
            dense_weight=dense_weight,
            bm25_weight=bm25_weight,
            recency_weight=recency_weight,
            access_weight=access_weight,
            half_life_days=half_life_days,
        )

    def delete_memory(self, entry_id: str) -> bool:
        """Deletes a memory document from vector store and BM25 index."""
        if entry_id in self._entries:
            del self._entries[entry_id]
            self._bm25.remove_document(entry_id)
            return True
        return False

    def update_memory(
        self,
        entry_id: str,
        content: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Optional[HybridMemoryEntry]:
        """Updates content and/or metadata of an existing entry, recalculating embeddings and BM25 index."""
        entry = self._entries.get(entry_id)
        if not entry:
            return None

        if content is not None and content != entry.content:
            entry.content = content
            entry.embedding = self.embedder.embed_text(content)
            self._bm25.add_document(entry_id, content)

        if metadata is not None:
            entry.metadata.update(metadata)

        entry.updated_at = datetime.now(timezone.utc)
        return entry

    def bulk_insert(self, items: List[Dict[str, Any]]) -> List[HybridMemoryEntry]:
        """Batch inserts memory documents."""
        results = []
        for item in items:
            content = item.get("content", "")
            domain = item.get("domain", "homelab")
            metadata = item.get("metadata", {})
            results.append(self.save_memory_sync(content=content, domain=domain, metadata=metadata))
        return results
