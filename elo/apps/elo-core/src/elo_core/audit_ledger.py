from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field
from elo_contracts.events import DomainEnum
from elo_contracts.security import SecurityLevel

logger = logging.getLogger("elo.core.audit_ledger")

GENESIS_PREVIOUS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"


class AuditLedgerEntry(BaseModel):
    """
    Tamper-evident, cryptographically chained audit ledger entry.
    """
    index: int
    entry_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    domain: DomainEnum
    actor: str
    action: str
    security_level: SecurityLevel
    tool_name: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    approval_status: Optional[str] = None
    execution_result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    client_ip: Optional[str] = None
    previous_hash: str
    entry_hash: str
    signature: str

    def compute_canonical_payload(self) -> bytes:
        """Returns deterministic JSON bytes of the entry payload for hashing."""
        payload = {
            "index": self.index,
            "entry_id": self.entry_id,
            "timestamp": self.timestamp,
            "domain": self.domain.value if isinstance(self.domain, DomainEnum) else str(self.domain),
            "actor": self.actor,
            "action": self.action,
            "security_level": (
                self.security_level.value
                if isinstance(self.security_level, SecurityLevel)
                else str(self.security_level)
            ),
            "tool_name": self.tool_name,
            "parameters": self.parameters or {},
            "approval_status": self.approval_status,
            "execution_result": self.execution_result or {},
            "error_message": self.error_message,
            "client_ip": self.client_ip,
            "previous_hash": self.previous_hash,
        }
        return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


class AuditLedger:
    """
    Append-only, HMAC-SHA256 signed audit ledger.
    Cryptographically records every ELO decision, user approval, and tool execution.
    """

    def __init__(
        self,
        secret_key: str,
        storage_path: Optional[Union[str, Path]] = None,
    ) -> None:
        if len(secret_key) < 16:
            raise ValueError("Audit ledger secret key must be at least 16 characters.")
        self._secret = secret_key.encode("utf-8")
        self._storage_path = Path(storage_path) if storage_path else None
        self._entries: List[AuditLedgerEntry] = []
        self._id_index: Dict[str, AuditLedgerEntry] = {}

        if self._storage_path and self._storage_path.exists():
            self._load_from_storage()

    @property
    def tip_hash(self) -> str:
        """Returns hash of the latest entry in the ledger, or genesis hash if empty."""
        if not self._entries:
            return GENESIS_PREVIOUS_HASH
        return self._entries[-1].entry_hash

    @property
    def total_entries(self) -> int:
        return len(self._entries)

    def record_event(
        self,
        domain: DomainEnum,
        actor: str,
        action: str,
        security_level: SecurityLevel,
        tool_name: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None,
        approval_status: Optional[str] = None,
        execution_result: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
        client_ip: Optional[str] = None,
    ) -> AuditLedgerEntry:
        """
        Appends a cryptographically signed event to the hash-chained ledger.
        """
        index = len(self._entries)
        prev_hash = self.tip_hash
        entry_id = str(uuid.uuid4())
        timestamp_str = datetime.now(timezone.utc).isoformat()

        # Temporary entry to compute hash
        temp_entry = AuditLedgerEntry(
            index=index,
            entry_id=entry_id,
            timestamp=timestamp_str,
            domain=domain,
            actor=actor,
            action=action,
            security_level=security_level,
            tool_name=tool_name,
            parameters=parameters,
            approval_status=approval_status,
            execution_result=execution_result,
            error_message=error_message,
            client_ip=client_ip,
            previous_hash=prev_hash,
            entry_hash="",
            signature="",
        )

        canonical_bytes = temp_entry.compute_canonical_payload()
        entry_hash = hashlib.sha256(canonical_bytes).hexdigest()
        signature = hmac.new(self._secret, entry_hash.encode("utf-8"), hashlib.sha256).hexdigest()

        entry = AuditLedgerEntry(
            index=index,
            entry_id=entry_id,
            timestamp=timestamp_str,
            domain=domain,
            actor=actor,
            action=action,
            security_level=security_level,
            tool_name=tool_name,
            parameters=parameters,
            approval_status=approval_status,
            execution_result=execution_result,
            error_message=error_message,
            client_ip=client_ip,
            previous_hash=prev_hash,
            entry_hash=entry_hash,
            signature=signature,
        )

        self._entries.append(entry)
        self._id_index[entry.entry_id] = entry

        if self._storage_path:
            self._append_to_storage(entry)

        log_level = logging.INFO if not error_message else logging.ERROR
        logger.log(
            log_level,
            f"[LEDGER #{index}] [{domain.value.upper()}] [{security_level.value}] actor={actor} "
            f"action={action} tool={tool_name} hash={entry_hash[:12]}",
        )
        return entry

    def verify_integrity(self) -> Tuple[bool, List[str]]:
        """
        Validates the entire audit ledger from Genesis block to the tip.
        Verifies sequential indices, hash-chain linkages, SHA-256 digests, and HMAC signatures.
        """
        errors: List[str] = []
        expected_prev_hash = GENESIS_PREVIOUS_HASH

        for idx, entry in enumerate(self._entries):
            # Check sequential index
            if entry.index != idx:
                errors.append(f"Index mismatch at position {idx}: entry has index {entry.index}")

            # Check previous hash linkage
            if entry.previous_hash != expected_prev_hash:
                errors.append(
                    f"Hash chain broken at index {idx}: expected prev_hash {expected_prev_hash}, got {entry.previous_hash}"
                )

            # Recompute entry hash
            canonical_bytes = entry.compute_canonical_payload()
            computed_hash = hashlib.sha256(canonical_bytes).hexdigest()
            if entry.entry_hash != computed_hash:
                errors.append(
                    f"Data tampering detected at index {idx}: stored hash {entry.entry_hash} != computed {computed_hash}"
                )

            # Verify HMAC signature
            expected_sig = hmac.new(self._secret, entry.entry_hash.encode("utf-8"), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(entry.signature, expected_sig):
                errors.append(f"Invalid HMAC signature at index {idx} for entry {entry.entry_id}")

            expected_prev_hash = entry.entry_hash

        is_valid = len(errors) == 0
        return is_valid, errors

    def get_entries(
        self,
        limit: int = 100,
        domain: Optional[DomainEnum] = None,
        actor: Optional[str] = None,
    ) -> List[AuditLedgerEntry]:
        """Queries ledger entries with optional domain and actor filters."""
        results: List[AuditLedgerEntry] = []
        for entry in reversed(self._entries):
            if domain and entry.domain != domain:
                continue
            if actor and entry.actor != actor:
                continue
            results.append(entry)
            if len(results) >= limit:
                break
        return results

    def get_entry_by_id(self, entry_id: str) -> Optional[AuditLedgerEntry]:
        return self._id_index.get(entry_id)

    def export_tamper_proof_proof(self) -> Dict[str, Any]:
        """Exports cryptographic proof of current ledger state."""
        is_valid, errors = self.verify_integrity()
        latest_entry = self._entries[-1] if self._entries else None

        return {
            "ledger_verified": is_valid,
            "total_blocks": len(self._entries),
            "tip_hash": self.tip_hash,
            "latest_signature": latest_entry.signature if latest_entry else None,
            "latest_timestamp": latest_entry.timestamp if latest_entry else None,
            "integrity_errors": errors,
        }

    def _append_to_storage(self, entry: AuditLedgerEntry) -> None:
        if not self._storage_path:
            return
        self._storage_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self._storage_path, "a", encoding="utf-8") as f:
            f.write(entry.model_dump_json() + "\n")

    def _load_from_storage(self) -> None:
        if not self._storage_path or not self._storage_path.exists():
            return
        with open(self._storage_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = AuditLedgerEntry.model_validate_json(line)
                    self._entries.append(entry)
                    self._id_index[entry.entry_id] = entry
                except Exception as e:
                    logger.error(f"Failed to parse audit ledger entry line: {e}")
