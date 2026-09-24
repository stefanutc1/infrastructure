from __future__ import annotations
from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class SecurityLevel(str, Enum):
    """
    Security execution levels for ELO tools:
    - L0_READ_ONLY: Pure reading/querying. Zero side-effects. Auto-executed.
    - L1_LOW_WRITE: Idempotent or low-risk changes. Auto-executed with audit notification.
    - L2_HIGH_IMPACT: Financial, infrastructure or external messaging. Requires interactive user approval.
    - L3_CRITICAL: Destructive actions, secrets modification, system wipe. Requires 2FA / strict challenge.
    """
    L0_READ_ONLY = "L0_READ_ONLY"
    L1_LOW_WRITE = "L1_LOW_WRITE"
    L2_HIGH_IMPACT = "L2_HIGH_IMPACT"
    L3_CRITICAL = "L3_CRITICAL"


class ApprovalStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class ApprovalRequest(BaseModel):
    id: str = Field(..., description="Unique approval request ID (e.g. UUID)")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(..., description="Expiration timestamp (default 5m timeout)")
    tool_name: str = Field(..., description="Name of tool requesting execution")
    security_level: SecurityLevel
    parameters: Dict[str, Any] = Field(default_factory=dict)
    explanation: str = Field(..., description="Plain language justification from LLM")
    diff_preview: Optional[str] = Field(None, description="Markdown/diff of expected system changes")
    status: ApprovalStatus = Field(default=ApprovalStatus.PENDING)
    approved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None


class ApprovalDecision(BaseModel):
    request_id: str
    approved: bool
    actor: str
    challenge_token: Optional[str] = None  # Used for L3 2FA verification
    reason: Optional[str] = None


class CapabilityToken(BaseModel):
    """Ephemeral scoped permission token for MCP / external tools."""
    token: str
    tool_name: str
    security_level: SecurityLevel
    expires_at: datetime
    issuer: str = "elo-core-gatekeeper"
    allowed_params_hash: Optional[str] = None
