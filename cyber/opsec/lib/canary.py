#!/usr/bin/env python3
"""
CanaryManager: Autonomous Honeypot & Memory Canary Token Engine
Part of Autonomous OPSEC & AI Countermeasure Framework
"""

import hashlib
import hmac
import os
import secrets
from typing import Dict, List, Optional, Any


class CanaryManager:
    def __init__(self, prefix: str = "CANARY-OPSEC-TK-", secret_key: Optional[bytes] = None):
        self.prefix = prefix
        self.secret_key = secret_key or os.urandom(32)
        self.active_canaries: Dict[str, Dict[str, Any]] = {}

    def generate_token(self, label: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """Generates a cryptographically strong canary token and registers it."""
        entropy = secrets.token_hex(16)
        token_id = f"{self.prefix}{entropy}"
        signature = hmac.new(self.secret_key, token_id.encode("utf-8"), hashlib.sha256).hexdigest()[:12]
        full_token = f"{token_id}-{signature}"

        self.active_canaries[full_token] = {
            "label": label,
            "created_at": secrets.token_hex(4),
            "metadata": metadata or {},
            "tripped": False
        }
        return full_token

    def verify_token_integrity(self, token: str) -> bool:
        """Verifies HMAC signature of a candidate canary token."""
        if not token.startswith(self.prefix):
            return False
        parts = token.rsplit("-", 1)
        if len(parts) != 2:
            return False
        token_id, signature = parts[0], parts[1]
        expected_sig = hmac.new(self.secret_key, token_id.encode("utf-8"), hashlib.sha256).hexdigest()[:12]
        return hmac.compare_digest(signature, expected_sig)

    def scan_for_leak(self, payload: str) -> List[Dict[str, Any]]:
        """Scans payload text to determine if any registered canary token has leaked."""
        leaks = []
        if not payload:
            return leaks

        for token, details in self.active_canaries.items():
            if token in payload:
                details["tripped"] = True
                leaks.append({
                    "token": token,
                    "label": details["label"],
                    "metadata": details["metadata"],
                    "severity": "CRITICAL_TRIPWIRE_ACTIVATION"
                })
        return leaks

    def revoke_token(self, token: str) -> bool:
        """Revokes a registered canary token."""
        if token in self.active_canaries:
            del self.active_canaries[token]
            return True
        return False
