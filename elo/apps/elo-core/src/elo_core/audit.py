from __future__ import annotations
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from elo_contracts.events import AuditLogEntry, DomainEnum
from elo_contracts.security import SecurityLevel

logger = logging.getLogger("elo.audit")


class AuditLogger:
    """
    Append-only audit logger for all ELO operations, security checks, and tool invocations.
    """

    def __init__(self):
        self._in_memory_logs: List[AuditLogEntry] = []

    def log(
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
    ) -> AuditLogEntry:
        entry = AuditLogEntry(
            timestamp=datetime.utcnow(),
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
        )
        self._in_memory_logs.append(entry)
        
        log_level = logging.INFO if not error_message else logging.ERROR
        logger.log(
            log_level,
            f"[AUDIT] [{domain.value.upper()}] [{security_level.value}] actor={actor} action={action} "
            f"tool={tool_name} status={approval_status} error={error_message}",
        )
        return entry

    def get_recent_logs(self, limit: int = 50) -> List[AuditLogEntry]:
        return list(reversed(self._in_memory_logs[-limit:]))
