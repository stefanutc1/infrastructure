from __future__ import annotations

import base64
import hashlib
import json
import secrets
import struct
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
try:
    from cryptography.exceptions import InvalidSignature
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import ec, ed25519, padding, rsa
    from cryptography.hazmat.primitives.serialization import (
        load_der_public_key,
        load_pem_public_key,
    )
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False
    InvalidSignature = Exception  # type: ignore
from elo_contracts.security import SecurityLevel


def _b64url_decode(payload: str) -> bytes:
    """Decodes base64url encoded string with padding correction."""
    rem = len(payload) % 4
    if rem > 0:
        payload += "=" * (4 - rem)
    return base64.urlsafe_b64decode(payload)


def _b64url_encode(data: bytes) -> str:
    """Encodes bytes to base64url string without padding."""
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


class StepUpChallenge(BaseModel):
    """
    FIDO2 / WebAuthn challenge generated for step-up authentication before L3 destructive actions.
    """
    challenge_id: str = Field(default_factory=lambda: secrets.token_hex(16))
    challenge_b64: str = Field(
        default_factory=lambda: _b64url_encode(secrets.token_bytes(32)),
        description="Base64url-encoded random 32-byte cryptographic challenge",
    )
    user_id: str
    action: str
    security_level: SecurityLevel = Field(default=SecurityLevel.L3_CRITICAL)
    parameters_hash: str = Field(description="SHA-256 digest of action parameters")
    rp_id: str = Field(default="elo.homelab")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    is_used: bool = Field(default=False)
    allow_credentials: List[str] = Field(default_factory=list)


class WebAuthnCredential(BaseModel):
    """
    Registered FIDO2 hardware security key credential (e.g. YubiKey 5 NFC / Nitrokey).
    """
    credential_id_b64: str
    user_id: str
    public_key_pem: str
    sign_count: int = Field(default=0)
    aaguid: Optional[str] = None
    device_label: str = Field(default="Hardware Security Key")
    transports: List[str] = Field(default_factory=lambda: ["usb", "nfc"])
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WebAuthnVerifier:
    """
    FIDO2 / WebAuthn Hardware Security Key step-up challenge-response verifier for L3 destructive actions.
    Validates authenticator signatures, user presence, user verification flags, and prevents replay attacks.
    """

    def __init__(
        self,
        rp_id: str = "elo.homelab",
        rp_name: str = "ELO Homelab Control Plane",
        origin: str = "https://elo.homelab",
        default_timeout_seconds: int = 120,
    ) -> None:
        self.rp_id = rp_id
        self.rp_name = rp_name
        self.origin = origin
        self.default_timeout_seconds = default_timeout_seconds
        self._credentials: Dict[str, WebAuthnCredential] = {}
        self._user_credentials: Dict[str, List[str]] = {}
        self._pending_challenges: Dict[str, StepUpChallenge] = {}

    def register_credential(
        self,
        user_id: str,
        credential_id: Union[bytes, str],
        public_key_pem_or_der: Union[str, bytes],
        device_label: str = "Hardware Security Key",
        aaguid: Optional[str] = None,
        transports: Optional[List[str]] = None,
    ) -> WebAuthnCredential:
        """
        Registers a verified hardware security key credential for a user.
        """
        cred_id_b64 = (
            _b64url_encode(credential_id) if isinstance(credential_id, bytes) else credential_id
        )

        pem_str: str
        if isinstance(public_key_pem_or_der, bytes):
            if b"-----BEGIN PUBLIC KEY-----" in public_key_pem_or_der:
                pem_str = public_key_pem_or_der.decode("utf-8")
            else:
                # DER format
                key_obj = load_der_public_key(public_key_pem_or_der)
                pem_str = key_obj.public_bytes(
                    encoding=load_pem_public_key.__module__,  # dummy check
                    format=load_pem_public_key.__name__,
                ).decode("utf-8") if hasattr(key_obj, "public_bytes") else ""
        else:
            pem_str = public_key_pem_or_der

        cred = WebAuthnCredential(
            credential_id_b64=cred_id_b64,
            user_id=user_id,
            public_key_pem=pem_str,
            device_label=device_label,
            aaguid=aaguid,
            transports=transports or ["usb", "nfc"],
        )
        self._credentials[cred_id_b64] = cred
        self._user_credentials.setdefault(user_id, []).append(cred_id_b64)
        return cred

    def get_credential(self, credential_id_b64: str) -> Optional[WebAuthnCredential]:
        """Retrieves a registered credential by credential ID."""
        return self._credentials.get(credential_id_b64)

    def list_credentials_for_user(self, user_id: str) -> List[WebAuthnCredential]:
        """Lists all registered hardware keys for a given user."""
        cred_ids = self._user_credentials.get(user_id, [])
        return [self._credentials[cid] for cid in cred_ids if cid in self._credentials]

    def create_step_up_challenge(
        self,
        user_id: str,
        action: str,
        parameters: Optional[Dict[str, Any]] = None,
        security_level: SecurityLevel = SecurityLevel.L3_CRITICAL,
        timeout_seconds: Optional[int] = None,
    ) -> StepUpChallenge:
        """
        Generates a new step-up WebAuthn authentication challenge for an L3 operation.
        """
        ttl = timeout_seconds or self.default_timeout_seconds
        expires_at = datetime.fromtimestamp(
            datetime.now(timezone.utc).timestamp() + ttl, tz=timezone.utc
        )
        param_str = json.dumps(parameters or {}, sort_keys=True)
        param_hash = hashlib.sha256(param_str.encode("utf-8")).hexdigest()

        allowed_creds = self._user_credentials.get(user_id, [])

        challenge = StepUpChallenge(
            user_id=user_id,
            action=action,
            security_level=security_level,
            parameters_hash=param_hash,
            rp_id=self.rp_id,
            expires_at=expires_at,
            allow_credentials=allowed_creds,
        )

        self._pending_challenges[challenge.challenge_id] = challenge
        return challenge

    def verify_step_up_response(
        self,
        challenge_id: str,
        credential_id_b64: str,
        client_data_json: bytes,
        authenticator_data: bytes,
        signature: bytes,
        require_user_verification: bool = False,
    ) -> Tuple[bool, Optional[str]]:
        """
        Verifies the FIDO2 WebAuthn assertion response against the pending challenge.
        Returns: (is_valid: bool, error_reason: Optional[str])
        """
        # 1. Challenge lookup
        if challenge_id not in self._pending_challenges:
            return False, "Challenge not found or invalid"

        challenge = self._pending_challenges[challenge_id]
        if challenge.is_used:
            return False, "Challenge has already been consumed"

        now = datetime.now(timezone.utc)
        if now > challenge.expires_at:
            return False, "Challenge has expired"

        # 2. Credential lookup
        credential = self._credentials.get(credential_id_b64)
        if not credential:
            return False, f"Unknown credential ID: {credential_id_b64}"

        if credential.user_id != challenge.user_id:
            return False, "Credential user mismatch"

        # 3. Parse and verify clientDataJSON
        try:
            client_data = json.loads(client_data_json.decode("utf-8"))
        except Exception:
            return False, "Failed to parse clientDataJSON"

        expected_type = "webauthn.get"
        if client_data.get("type") != expected_type:
            return False, f"Invalid clientData type: {client_data.get('type')}, expected {expected_type}"

        if client_data.get("challenge") != challenge.challenge_b64:
            return False, "ClientData challenge mismatch"

        client_origin = client_data.get("origin", "")
        if client_origin != self.origin and not client_origin.endswith(self.rp_id):
            return False, f"Origin mismatch: {client_origin} not authorized for {self.rp_id}"

        # 4. Parse and verify authenticatorData
        if len(authenticator_data) < 37:
            return False, "Authenticator data too short (< 37 bytes)"

        rp_id_hash = authenticator_data[0:32]
        expected_rp_hash = hashlib.sha256(self.rp_id.encode("utf-8")).digest()
        if rp_id_hash != expected_rp_hash:
            return False, "Authenticator data rpIdHash does not match RP ID"

        flags = authenticator_data[32]
        user_present = bool(flags & 0x01)
        user_verified = bool(flags & 0x04)

        if not user_present:
            return False, "User Presence (UP) flag was not set by authenticator"

        if require_user_verification and not user_verified:
            return False, "User Verification (UV) flag was required but not set (PIN/biometrics missing)"

        sign_count = struct.unpack(">I", authenticator_data[33:37])[0]
        # Replay / clone detection: if both current and recorded > 0, incoming sign_count must be strictly greater
        if sign_count > 0 and credential.sign_count > 0 and sign_count <= credential.sign_count:
            return False, f"Potential authenticator cloning detected (sign_count {sign_count} <= {credential.sign_count})"

        # 5. Cryptographic signature verification
        # The signed data in WebAuthn is: authenticatorData || SHA-256(clientDataJSON)
        client_data_hash = hashlib.sha256(client_data_json).digest()
        signed_message = authenticator_data + client_data_hash

        pub_key = load_pem_public_key(credential.public_key_pem.encode("utf-8"))
        sig_valid = self._verify_signature(pub_key, signature, signed_message)
        if not sig_valid:
            return False, "Invalid cryptographic signature from security key"

        # 6. Update state: increment sign count and mark challenge consumed
        credential.sign_count = max(credential.sign_count, sign_count)
        challenge.is_used = True
        return True, None

    def _verify_signature(
        self,
        public_key: Any,
        signature: bytes,
        signed_message: bytes,
    ) -> bool:
        """Verifies signature across ECDSA, Ed25519, or RSA public keys."""
        try:
            if isinstance(public_key, ec.EllipticCurvePublicKey):
                public_key.verify(signature, signed_message, ec.ECDSA(hashes.SHA256()))
                return True
            elif isinstance(public_key, ed25519.Ed25519PublicKey):
                public_key.verify(signature, signed_message)
                return True
            elif isinstance(public_key, rsa.RSAPublicKey):
                try:
                    # Try PSS first (modern WebAuthn RS256 standard)
                    public_key.verify(
                        signature,
                        signed_message,
                        padding.PSS(
                            mgf=padding.MGF1(hashes.SHA256()),
                            salt_length=padding.PSS.MAX_LENGTH,
                        ),
                        hashes.SHA256(),
                    )
                    return True
                except InvalidSignature:
                    # Fallback to PKCS1v15
                    public_key.verify(
                        signature,
                        signed_message,
                        padding.PKCS1v15(),
                        hashes.SHA256(),
                    )
                    return True
        except InvalidSignature:
            return False
        except Exception:
            return False
        return False
