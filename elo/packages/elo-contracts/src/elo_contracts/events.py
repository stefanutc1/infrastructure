from __future__ import annotations
from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from .security import SecurityLevel


class DomainEnum(str, Enum):
    HOMELAB = "homelab"
    BUSINESS = "business"
    SAAS = "saas"
    SYSTEM = "system"


class AuditLogEntry(BaseModel):
    id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
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


class SystemEvent(BaseModel):
    event_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_type: str
    source_domain: DomainEnum
    payload: Dict[str, Any] = Field(default_factory=dict)
