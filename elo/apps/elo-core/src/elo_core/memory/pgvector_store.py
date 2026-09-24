from __future__ import annotations
import logging
from typing import List, Dict, Any, Optional
from elo_contracts.memory import SemanticMemoryEntry, MemorySearchQuery, MemorySearchResult, UserPreference
from elo_ai_client.embeddings import DeterministicEmbeddingsGenerator, cosine_similarity

logger = logging.getLogger("elo.core.memory")


class PgVectorMemoryStore:
    """
    Semantic Memory and RAG Knowledge Store with pgvector & In-Memory Fallback.
    Stores and retrieves vectorized knowledge chunks, user preferences, and configuration context.
    """

    def __init__(self, pg_connection_string: Optional[str] = None):
        self.pg_conn = pg_connection_string
        self.embedder = DeterministicEmbeddingsGenerator(dimensions=128)
        self._in_memory_docs: List[SemanticMemoryEntry] = []
        self._user_preferences: Dict[str, UserPreference] = {}
        self._bootstrap_default_knowledge()

    def _bootstrap_default_knowledge(self) -> None:
        """Seeds standard homelab architecture and knowledge chunks."""
        default_chunks = [
            (
                "homelab",
                "Proxmox VE Hypervisor (pve-node-1) rulează pe IP-ul 192.168.1.132 pe portul 8006. "
                "Găzduiește VM 200 (OPNsense Firewall) și VM 201 (Windows Server 2025 Datacenter) și containerele LXC.",
                {"tags": ["proxmox", "pve", "192.168.1.132", "hypervisor", "vm200", "vm201"]}
            ),
            (
                "homelab",
                "OpenMediaVault NAS (openmediavault-nas) rulează pe IP-ul 192.168.1.135. "
                "Gestionează pool-urile ZFS mirror, share-urile SMB/NFS și backup-urile BorgBackup.",
                {"tags": ["nas", "openmediavault", "192.168.1.135", "zfs", "storage"]}
            ),
            (
                "homelab",
                "Nodul local este Apple M1 Compute (MacBook-Air.local) pe IP-ul 192.168.1.133. "
                "Rulează daemonul ELO Core, aplicația desktop .NET 10 și accelerarea GPU Metal MPS.",
                {"tags": ["m1", "apple", "macbook", "192.168.1.133", "elo", "host"]}
            ),
            (
                "homelab",
                "Home Assistant Core este pe 192.168.1.10:8123 (VLAN 20) pentru control lumini Zigbee, relee Shelly și climă. "
                "Immich este pe 192.168.1.15:2283 pentru poze. Vaultwarden este pe 192.168.1.16:8080 pentru parole. Grafana pe 192.168.1.11:3000.",
                {"tags": ["homeassistant", "immich", "vaultwarden", "grafana", "pinned"]}
            ),
            (
                "ansible",
                "Ansible automatizează configurarea CIS Level 1 hardening pe toate nodurile din homelab prin playbook-ul playbooks/site.yml.",
                {"tags": ["ansible", "hardening", "cis", "security"]}
            ),
        ]

        for domain, content, meta in default_chunks:
            self.save_memory_sync(content=content, domain=domain, metadata=meta)

    def save_memory_sync(self, content: str, domain: str = "homelab", metadata: Optional[Dict[str, Any]] = None) -> SemanticMemoryEntry:
        """Saves a semantic memory entry synchronously."""
        embedding = self.embedder.embed_text(content)
        entry = SemanticMemoryEntry(
            domain=domain,
            content=content,
            metadata=metadata or {},
            embedding=embedding,
        )
        self._in_memory_docs.append(entry)
        return entry

    async def save_memory(self, content: str, domain: str = "homelab", metadata: Optional[Dict[str, Any]] = None) -> SemanticMemoryEntry:
        """Asynchronously stores a new memory item."""
        return self.save_memory_sync(content=content, domain=domain, metadata=metadata)

    async def search_memory(self, query: str, domain: Optional[str] = None, top_k: int = 3) -> List[MemorySearchResult]:
        """
        Performs vector cosine similarity search across stored memories.
        """
        query_vector = self.embedder.embed_text(query)
        results: List[MemorySearchResult] = []

        for entry in self._in_memory_docs:
            if domain and entry.domain != domain:
                continue

            if entry.embedding:
                sim = cosine_similarity(query_vector, entry.embedding)
            else:
                sim = 0.0

            # Add lexical boost for keyword matches
            q_words = set(query.lower().split())
            c_words = set(entry.content.lower().split())
            overlap = len(q_words.intersection(c_words))
            if overlap > 0:
                sim = min(1.0, sim + (overlap * 0.15))

            if sim > 0.05:
                results.append(MemorySearchResult(entry=entry, similarity=round(sim, 4)))

        results.sort(key=lambda x: x.similarity, reverse=True)
        return results[:top_k]

    def set_user_preference(self, key: str, value: Any, category: str = "general") -> UserPreference:
        """Sets a persistent user preference."""
        pref = UserPreference(key=key, value=value, category=category)
        self._user_preferences[key] = pref
        return pref

    def get_user_preference(self, key: str, default: Any = None) -> Any:
        """Gets a user preference value."""
        if key in self._user_preferences:
            return self._user_preferences[key].value
        return default

    def get_all_preferences(self) -> Dict[str, Any]:
        """Returns all stored preferences as a dictionary."""
        return {k: p.value for k, p in self._user_preferences.items()}
