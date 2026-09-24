from __future__ import annotations
import hmac
import hashlib
import json
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any


class TokenManager:
    """
    Manages short-lived capability tokens for tool execution.
    Prevents tool abuse and ensures callers only execute authorized parameters.
    """

    def __init__(self, secret_key: str):
        if len(secret_key) < 16:
            raise ValueError("Secret key must be at least 16 characters long.")
        self._secret = secret_key.encode("utf-8")

    def create_capability_token(
        self,
        tool_name: str,
        security_level: str,
        parameters: Optional[Dict[str, Any]] = None,
        ttl_seconds: int = 60,
    ) -> str:
        expires_at = (datetime.utcnow() + timedelta(seconds=ttl_seconds)).isoformat()
        param_hash = hashlib.sha256(json.dumps(parameters or {}, sort_keys=True).encode()).hexdigest()

        payload = {
            "tool": tool_name,
            "lvl": security_level,
            "exp": expires_at,
            "phash": param_hash,
        }
        payload_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
        signature = hmac.new(self._secret, payload_bytes, hashlib.sha256).hexdigest()
        
        token_data = {
            "p": base64.urlsafe_b64encode(payload_bytes).decode("utf-8"),
            "s": signature,
        }
        return base64.urlsafe_b64encode(json.dumps(token_data).encode("utf-8")).decode("utf-8")

    def verify_capability_token(
        self,
        token: str,
        expected_tool: str,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> bool:
        try:
            raw_token_data = base64.urlsafe_b64decode(token.encode("utf-8")).decode("utf-8")
            token_data = json.loads(raw_token_data)
            payload_bytes = base64.urlsafe_b64decode(token_data["p"].encode("utf-8"))
            signature = token_data["s"]

            expected_sig = hmac.new(self._secret, payload_bytes, hashlib.sha256).hexdigest()
            if not hmac.compare_digest(signature, expected_sig):
                return False

            payload = json.loads(payload_bytes.decode("utf-8"))

            # Check expiration
            expires_at = datetime.fromisoformat(payload["exp"])
            if datetime.utcnow() > expires_at:
                return False

            # Check tool name
            if payload["tool"] != expected_tool:
                return False

            # Check parameter hash if parameters provided
            if parameters is not None:
                param_hash = hashlib.sha256(json.dumps(parameters, sort_keys=True).encode()).hexdigest()
                if payload["phash"] != param_hash:
                    return False

            return True
        except Exception:
            return False
