from __future__ import annotations

import base64
import os
import struct
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple, Union
from pydantic import BaseModel, Field
try:
    from cryptography.exceptions import InvalidSignature
    from cryptography.hazmat.primitives.asymmetric import ed25519
    from cryptography.hazmat.primitives.serialization import (
        Encoding,
        NoEncryption,
        PrivateFormat,
        PublicFormat,
        load_ssh_public_key,
    )
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False
    InvalidSignature = Exception  # type: ignore

SSH2_CERT_TYPE_USER = 1
SSH2_CERT_TYPE_HOST = 2


def _encode_string(data: Union[bytes, str]) -> bytes:
    """Encodes bytes or UTF-8 string into OpenSSH wire format (uint32 length + data)."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return struct.pack(">I", len(data)) + data


def _encode_uint32(num: int) -> bytes:
    return struct.pack(">I", num)


def _encode_uint64(num: int) -> bytes:
    return struct.pack(">Q", num)


def _decode_string(data: bytes, offset: int = 0) -> Tuple[bytes, int]:
    """Decodes length-prefixed OpenSSH string from buffer."""
    if offset + 4 > len(data):
        raise ValueError("Buffer underflow reading string length")
    length = struct.unpack(">I", data[offset : offset + 4])[0]
    offset += 4
    if offset + length > len(data):
        raise ValueError("Buffer underflow reading string content")
    val = data[offset : offset + length]
    return val, offset + length


def _decode_uint32(data: bytes, offset: int = 0) -> Tuple[int, int]:
    if offset + 4 > len(data):
        raise ValueError("Buffer underflow reading uint32")
    val = struct.unpack(">I", data[offset : offset + 4])[0]
    return val, offset + 4


def _decode_uint64(data: bytes, offset: int = 0) -> Tuple[int, int]:
    if offset + 8 > len(data):
        raise ValueError("Buffer underflow reading uint64")
    val = struct.unpack(">Q", data[offset : offset + 8])[0]
    return val, offset + 8


def _encode_string_list(items: List[str]) -> bytes:
    """Encodes a list of strings as OpenSSH wire format sequence wrapped in a string."""
    buf = bytearray()
    for item in items:
        buf.extend(_encode_string(item))
    return _encode_string(bytes(buf))


def _encode_extensions(extensions: Dict[str, str]) -> bytes:
    """Encodes SSH certificate extensions dictionary as length-prefixed key-value pairs."""
    buf = bytearray()
    for k, v in extensions.items():
        buf.extend(_encode_string(k))
        buf.extend(_encode_string(v.encode("utf-8") if isinstance(v, str) else v))
    return _encode_string(bytes(buf))


class SSHCertificateMetadata(BaseModel):
    """Parsed OpenSSH Certificate details."""
    key_id: str
    cert_type: int
    serial: int
    principals: List[str]
    valid_after: datetime
    valid_before: datetime
    is_valid_now: bool
    ca_fingerprint: str
    extensions: List[str] = Field(default_factory=list)


class JITCredentials(BaseModel):
    """Ephemeral Just-In-Time SSH credentials for zero-trust node management."""
    username: str
    principals: List[str]
    key_id: str
    private_key_openssh: str
    public_key_openssh: str
    certificate_openssh: str
    valid_after: datetime
    valid_before: datetime
    ttl_seconds: int


class EphemeralSSHCA:
    """
    Ephemeral SSH Certificate Authority for JIT (Just-In-Time) homelab node administration.
    Generates short-lived ED25519 user certificates with strictly bounded TTLs (5-15 min).
    """

    def __init__(
        self,
        ca_private_key: Optional[ed25519.Ed25519PrivateKey] = None,
        ca_comment: str = "elo-ssh-ca@homelab",
    ) -> None:
        self._private_key = ca_private_key or ed25519.Ed25519PrivateKey.generate()
        self._public_key = self._private_key.public_key()
        self.ca_comment = ca_comment

    @property
    def ca_public_key_openssh(self) -> str:
        """Exports CA public key in OpenSSH authorized_keys format."""
        pub_bytes = self._public_key.public_bytes(Encoding.OpenSSH, PublicFormat.OpenSSH)
        return f"{pub_bytes.decode('utf-8')} {self.ca_comment}"

    @property
    def ca_public_key_raw_bytes(self) -> bytes:
        """Returns raw 32-byte Ed25519 public key."""
        return self._public_key.public_bytes(Encoding.Raw, PublicFormat.Raw)

    def issue_certificate(
        self,
        user_public_key_openssh: str,
        key_id: str,
        principals: List[str],
        ttl_seconds: int = 600,  # 10 minutes default (bounded between 300s and 900s)
        serial: Optional[int] = None,
        extensions: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Signs an OpenSSH ED25519 User Certificate valid for JIT homelab access.
        """
        # Clamp TTL to strictly enforce 5-15 minutes JIT constraint
        bounded_ttl = max(300, min(ttl_seconds, 900))

        # Parse user public key
        parsed_key = load_ssh_public_key(user_public_key_openssh.encode("utf-8"))
        if not isinstance(parsed_key, ed25519.Ed25519PublicKey):
            raise ValueError("Only ED25519 public keys are supported by EphemeralSSHCA.")

        user_raw_pub = parsed_key.public_bytes(Encoding.Raw, PublicFormat.Raw)

        nonce = os.urandom(32)
        serial_val = serial if serial is not None else int(time.time() * 1000) & 0xFFFFFFFFFFFFFFFF
        valid_after_ts = int(time.time()) - 30  # 30s clock-skew leeway
        valid_before_ts = valid_after_ts + bounded_ttl + 30

        if extensions is None:
            extensions = {
                "permit-pty": "",
                "permit-user-rc": "",
                "permit-port-forwarding": "",
            }

        # Build certificate body to sign
        body = bytearray()
        body.extend(_encode_string("ssh-ed25519-cert-v01@openssh.com"))
        body.extend(_encode_string(nonce))
        # Public key in certificate: string "ssh-ed25519" + string raw_bytes
        body.extend(_encode_string(b"ssh-ed25519"))
        body.extend(_encode_string(user_raw_pub))
        # Serial & Cert Type
        body.extend(_encode_uint64(serial_val))
        body.extend(_encode_uint32(SSH2_CERT_TYPE_USER))
        # Key ID & Valid Principals
        body.extend(_encode_string(key_id))
        body.extend(_encode_string_list(principals))
        # Validity timestamps
        body.extend(_encode_uint64(valid_after_ts))
        body.extend(_encode_uint64(valid_before_ts))
        # Critical Options (empty) & Extensions
        body.extend(_encode_string(b""))  # empty critical options
        body.extend(_encode_extensions(extensions))
        # Reserved field
        body.extend(_encode_string(b""))

        # CA Public Key wire format
        ca_pub_wire = _encode_string(b"ssh-ed25519") + _encode_string(self.ca_public_key_raw_bytes)
        body.extend(_encode_string(ca_pub_wire))

        # Sign certificate body
        signature = self._private_key.sign(bytes(body))

        # Wire format of signature: string signature_blob = (string "ssh-ed25519" + string signature_bytes)
        sig_wire = _encode_string(b"ssh-ed25519") + _encode_string(signature)
        body.extend(_encode_string(sig_wire))

        # Output OpenSSH certificate string format
        cert_b64 = base64.b64encode(bytes(body)).decode("utf-8")
        return f"ssh-ed25519-cert-v01@openssh.com {cert_b64} {key_id}"

    def verify_certificate(self, certificate_str: str) -> SSHCertificateMetadata:
        """
        Cryptographically verifies an OpenSSH certificate against the CA key.
        """
        parts = certificate_str.strip().split()
        if len(parts) < 2:
            raise ValueError("Malformed SSH certificate string")

        cert_type_str = parts[0]
        if cert_type_str != "ssh-ed25519-cert-v01@openssh.com":
            raise ValueError(f"Unsupported certificate type: {cert_type_str}")

        raw_cert = base64.b64decode(parts[1])
        offset = 0

        cert_type_read, offset = _decode_string(raw_cert, offset)
        nonce, offset = _decode_string(raw_cert, offset)
        pk_algo, offset = _decode_string(raw_cert, offset)
        user_pub_raw, offset = _decode_string(raw_cert, offset)
        serial, offset = _decode_uint64(raw_cert, offset)
        cert_type, offset = _decode_uint32(raw_cert, offset)
        key_id_bytes, offset = _decode_string(raw_cert, offset)
        key_id = key_id_bytes.decode("utf-8")

        # Principals
        principals_blob, offset = _decode_string(raw_cert, offset)
        principals: List[str] = []
        p_offset = 0
        while p_offset < len(principals_blob):
            p_bytes, p_offset = _decode_string(principals_blob, p_offset)
            principals.append(p_bytes.decode("utf-8"))

        valid_after_ts, offset = _decode_uint64(raw_cert, offset)
        valid_before_ts, offset = _decode_uint64(raw_cert, offset)

        crit_opts, offset = _decode_string(raw_cert, offset)
        ext_blob, offset = _decode_string(raw_cert, offset)

        extensions: List[str] = []
        e_offset = 0
        while e_offset < len(ext_blob):
            ext_name, e_offset = _decode_string(ext_blob, e_offset)
            ext_val, e_offset = _decode_string(ext_blob, e_offset)
            extensions.append(ext_name.decode("utf-8"))

        reserved, offset = _decode_string(raw_cert, offset)
        ca_pub_wire, offset = _decode_string(raw_cert, offset)

        signed_body_len = offset
        signed_body = raw_cert[:signed_body_len]

        sig_wire, offset = _decode_string(raw_cert, offset)
        sig_algo, s_offset = _decode_string(sig_wire, 0)
        sig_bytes, _ = _decode_string(sig_wire, s_offset)

        # Verify signature with CA public key
        try:
            self._public_key.verify(sig_bytes, signed_body)
        except InvalidSignature as e:
            raise ValueError("Invalid CA cryptographic signature on SSH certificate") from e

        now_ts = int(time.time())
        is_valid_now = valid_after_ts <= now_ts <= valid_before_ts

        ca_fp = base64.b64encode(self.ca_public_key_raw_bytes[:16]).decode("utf-8")

        return SSHCertificateMetadata(
            key_id=key_id,
            cert_type=cert_type,
            serial=serial,
            principals=principals,
            valid_after=datetime.fromtimestamp(valid_after_ts, tz=timezone.utc),
            valid_before=datetime.fromtimestamp(valid_before_ts, tz=timezone.utc),
            is_valid_now=is_valid_now,
            ca_fingerprint=ca_fp,
            extensions=extensions,
        )

    def create_jit_session(
        self,
        username: str,
        principals: Optional[List[str]] = None,
        ttl_minutes: int = 10,
    ) -> JITCredentials:
        """
        Creates a complete ephemeral JIT credential bundle:
        - Generates a single-use ED25519 private/public keypair
        - Signs a short-lived user certificate (bounded 5-15 min)
        - Returns all material ready for immediate OpenSSH connection
        """
        ttl_sec = max(300, min(ttl_minutes * 60, 900))
        target_principals = principals or [username, "root", "elo-admin", "ubuntu"]

        # Generate ephemeral client keypair
        client_priv = ed25519.Ed25519PrivateKey.generate()
        client_pub = client_priv.public_key()

        priv_pem = client_priv.private_bytes(
            encoding=Encoding.PEM,
            format=PrivateFormat.OpenSSH,
            encryption_algorithm=NoEncryption(),
        ).decode("utf-8")

        pub_ssh = client_pub.public_bytes(
            encoding=Encoding.OpenSSH,
            format=PublicFormat.OpenSSH,
        ).decode("utf-8")

        key_id = f"elo-jit-{username}-{int(time.time())}"
        cert_str = self.issue_certificate(
            user_public_key_openssh=pub_ssh,
            key_id=key_id,
            principals=target_principals,
            ttl_seconds=ttl_sec,
        )

        now_dt = datetime.now(timezone.utc)
        valid_before_dt = datetime.fromtimestamp(now_dt.timestamp() + ttl_sec, tz=timezone.utc)

        return JITCredentials(
            username=username,
            principals=target_principals,
            key_id=key_id,
            private_key_openssh=priv_pem,
            public_key_openssh=pub_ssh,
            certificate_openssh=cert_str,
            valid_after=now_dt,
            valid_before=valid_before_dt,
            ttl_seconds=ttl_sec,
        )
