from __future__ import annotations
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from .security import SecurityLevel


class ELOToolDefinition(BaseModel):
    name: str = Field(..., description="Unique tool identifier (e.g. proxmox_get_cluster_status)")
    description: str = Field(..., description="Detailed description for LLM reasoning and planning")
    parameters_schema: Dict[str, Any] = Field(..., description="JSON Schema specification for tool arguments")
    security_level: SecurityLevel = Field(default=SecurityLevel.L0_READ_ONLY)
    timeout_seconds: int = Field(default=30)
    domain: str = Field(default="system", description="Domain classification: homelab, business, saas, system")


class ToolCallRequest(BaseModel):
    call_id: str
    tool_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    explanation: Optional[str] = None


class ToolCallResult(BaseModel):
    call_id: str
    tool_name: str
    success: bool
    output: Any = None
    error: Optional[str] = None
    execution_time_ms: float = 0.0
    security_level_applied: SecurityLevel = SecurityLevel.L0_READ_ONLY
