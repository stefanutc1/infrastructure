import pytest
import asyncio
from datetime import datetime
from elo_contracts.security import SecurityLevel, ApprovalDecision, ApprovalStatus
from elo_security.tokens import TokenManager
from elo_security.gatekeeper import SecurityGatekeeper


def test_token_creation_and_verification():
    secret = "super_secure_test_key_123456789"
    tm = TokenManager(secret)

    token = tm.create_capability_token(
        tool_name="proxmox_reboot_vm",
        security_level=SecurityLevel.L2_HIGH_IMPACT.value,
        parameters={"vm_id": 101},
        ttl_seconds=60,
    )

    # Valid token verification
    assert tm.verify_capability_token(token, "proxmox_reboot_vm", {"vm_id": 101}) is True

    # Tampered tool name
    assert tm.verify_capability_token(token, "other_tool", {"vm_id": 101}) is False

    # Tampered parameters
    assert tm.verify_capability_token(token, "proxmox_reboot_vm", {"vm_id": 999}) is False


def test_token_expiration():
    secret = "super_secure_test_key_123456789"
    tm = TokenManager(secret)

    # Expired token (-10s TTL)
    token = tm.create_capability_token(
        tool_name="test_tool",
        security_level=SecurityLevel.L0_READ_ONLY.value,
        ttl_seconds=-10,
    )
    assert tm.verify_capability_token(token, "test_tool") is False


def test_gatekeeper_l0_l1_auto_exec():
    gk = SecurityGatekeeper(secret_key="super_secure_test_key_123456789")

    # L0 Auto-executes
    can_exec_l0, req_l0, token_l0 = gk.assess_execution(
        tool_name="get_status",
        security_level=SecurityLevel.L0_READ_ONLY,
        parameters={},
        explanation="Read system status",
    )
    assert can_exec_l0 is True
    assert req_l0 is None
    assert token_l0 is not None

    # L1 Auto-executes
    can_exec_l1, req_l1, token_l1 = gk.assess_execution(
        tool_name="turn_on_light",
        security_level=SecurityLevel.L1_LOW_WRITE,
        parameters={"room": "office"},
        explanation="Turn on office lamp",
    )
    assert can_exec_l1 is True
    assert req_l1 is None
    assert token_l1 is not None


def test_gatekeeper_l2_requires_approval():
    gk = SecurityGatekeeper(secret_key="super_secure_test_key_123456789")

    # L2 requires approval
    can_exec, req, token = gk.assess_execution(
        tool_name="proxmox_reboot_vm",
        security_level=SecurityLevel.L2_HIGH_IMPACT,
        parameters={"vm_id": 101},
        explanation="Reboot CRM container",
    )
    assert can_exec is False
    assert req is not None
    assert token is None
    assert req.status == ApprovalStatus.PENDING

    # Resolve with approval
    decision = ApprovalDecision(
        request_id=req.id,
        approved=True,
        actor="admin_user",
    )
    success, cap_token = gk.resolve_request(decision)
    assert success is True
    assert cap_token is not None
    assert req.status == ApprovalStatus.APPROVED
    assert req.approved_by == "admin_user"
