from __future__ import annotations
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple, Callable, Awaitable
from elo_contracts.security import (
    SecurityLevel,
    ApprovalStatus,
    ApprovalRequest,
    ApprovalDecision,
)
from .tokens import TokenManager


class SecurityGatekeeper:
    """
    Zero-Trust Gatekeeper responsible for enforcing authorization,
    creating approval tickets for L2/L3 operations, and handling user resolutions.
    """

    def __init__(
        self,
        secret_key: str,
        default_timeout_seconds: int = 300,
        notifier_callback: Optional[Callable[[ApprovalRequest], Awaitable[None]]] = None,
    ):
        self.token_manager = TokenManager(secret_key)
        self.default_timeout = default_timeout_seconds
        self.notifier_callback = notifier_callback
        self._pending_requests: Dict[str, ApprovalRequest] = {}
        self._async_futures: Dict[str, asyncio.Future[bool]] = {}

    def assess_execution(
        self,
        tool_name: str,
        security_level: SecurityLevel,
        parameters: Dict[str, Any],
        explanation: str,
        diff_preview: Optional[str] = None,
    ) -> Tuple[bool, Optional[ApprovalRequest], Optional[str]]:
        """
        Assesses if an action can be executed immediately or requires approval.
        Returns: (can_execute_immediately, approval_request, capability_token)
        """
        # L0 & L1 execute automatically
        if security_level in (SecurityLevel.L0_READ_ONLY, SecurityLevel.L1_LOW_WRITE):
            token = self.token_manager.create_capability_token(
                tool_name=tool_name,
                security_level=security_level.value,
                parameters=parameters,
                ttl_seconds=60,
            )
            return True, None, token

        # L2 & L3 require approval ticket
        req_id = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(seconds=self.default_timeout)
        req = ApprovalRequest(
            id=req_id,
            tool_name=tool_name,
            security_level=security_level,
            parameters=parameters,
            explanation=explanation,
            diff_preview=diff_preview,
            expires_at=expires_at,
            status=ApprovalStatus.PENDING,
        )
        self._pending_requests[req_id] = req
        return False, req, None

    async def wait_for_approval(self, request_id: str, timeout_seconds: Optional[int] = None) -> bool:
        """
        Asynchronously suspends until user resolves the approval ticket or timeout fires.
        """
        if request_id not in self._pending_requests:
            return False

        req = self._pending_requests[request_id]
        if req.status != ApprovalStatus.PENDING:
            return req.status == ApprovalStatus.APPROVED

        loop = asyncio.get_running_loop()
        fut: asyncio.Future[bool] = loop.create_future()
        self._async_futures[request_id] = fut

        if self.notifier_callback:
            try:
                await self.notifier_callback(req)
            except Exception as e:
                # Keep request active even if notification delivery encounters issues
                pass

        timeout = timeout_seconds or self.default_timeout
        try:
            approved = await asyncio.wait_for(fut, timeout=timeout)
            return approved
        except asyncio.TimeoutError:
            self.expire_request(request_id)
            return False
        finally:
            self._async_futures.pop(request_id, None)

    def resolve_request(self, decision: ApprovalDecision) -> Tuple[bool, Optional[str]]:
        """
        Resolves a pending request with user's decision.
        Returns: (success, capability_token_if_approved)
        """
        req_id = decision.request_id
        if req_id not in self._pending_requests:
            return False, None

        req = self._pending_requests[req_id]
        if req.status != ApprovalStatus.PENDING:
            return False, None

        if datetime.utcnow() > req.expires_at:
            req.status = ApprovalStatus.EXPIRED
            if req_id in self._async_futures and not self._async_futures[req_id].done():
                self._async_futures[req_id].set_result(False)
            return False, None

        req.resolved_at = datetime.utcnow()
        req.approved_by = decision.actor

        if decision.approved:
            req.status = ApprovalStatus.APPROVED
            token = self.token_manager.create_capability_token(
                tool_name=req.tool_name,
                security_level=req.security_level.value,
                parameters=req.parameters,
                ttl_seconds=120,
            )
            if req_id in self._async_futures and not self._async_futures[req_id].done():
                self._async_futures[req_id].set_result(True)
            return True, token
        else:
            req.status = ApprovalStatus.REJECTED
            if req_id in self._async_futures and not self._async_futures[req_id].done():
                self._async_futures[req_id].set_result(False)
            return True, None

    def expire_request(self, request_id: str) -> None:
        if request_id in self._pending_requests:
            req = self._pending_requests[request_id]
            if req.status == ApprovalStatus.PENDING:
                req.status = ApprovalStatus.EXPIRED
                req.resolved_at = datetime.utcnow()
            if request_id in self._async_futures and not self._async_futures[request_id].done():
                self._async_futures[request_id].set_result(False)

    def get_pending_requests(self) -> Dict[str, ApprovalRequest]:
        now = datetime.utcnow()
        active = {}
        for rid, req in list(self._pending_requests.items()):
            if req.status == ApprovalStatus.PENDING:
                if now > req.expires_at:
                    self.expire_request(rid)
                else:
                    active[rid] = req
        return active
