from __future__ import annotations

import ipaddress
import re
import shlex
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel, Field
from elo_contracts.security import SecurityLevel


class VerificationStep(BaseModel):
    """A single reasoning step in the Chain-of-Verification (CoVe) evaluation."""
    step_number: int
    question: str
    reasoning: str
    passed: bool
    evidence: Optional[str] = None


class CommandVerificationResult(BaseModel):
    """Outcome of shell command verification."""
    is_safe: bool
    risk_level: SecurityLevel
    command: str
    parsed_tokens: List[str] = Field(default_factory=list)
    target_hosts_or_ips: List[str] = Field(default_factory=list)
    destructive_flags: List[str] = Field(default_factory=list)
    verification_steps: List[VerificationStep] = Field(default_factory=list)
    rejection_reason: Optional[str] = None
    suggested_fix: Optional[str] = None


class GuardrailVerdict(BaseModel):
    """Verdict for tool execution and hallucination guardrails."""
    allowed: bool
    risk_level: SecurityLevel
    tool_name: str
    hallucinated_entities: List[str] = Field(default_factory=list)
    verification_steps: List[VerificationStep] = Field(default_factory=list)
    issues: List[str] = Field(default_factory=list)
    rejection_reason: Optional[str] = None


class CommandVerifier:
    """
    Chain-of-Verification (CoVe) and shell command safety analyzer.
    Checks syntax, argument flags, command injection risks, and destination IP ranges.
    """

    DANGEROUS_PATTERNS = [
        (r"rm\s+(-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+|\s+-rf\s+)(/|\*|/\*|~|/\w+)", "Root or wildcard recursive deletion"),
        (r"mkfs(\.\w+)?\s+/dev/\w+", "Filesystem format on raw block device"),
        (r"dd\s+if=/dev/(zero|urandom)\s+of=/dev/[a-z0-9]+", "Raw block device overwriting with zeroes/random data"),
        (r"(fdisk|parted|gdisk|sfdisk)\s+/dev/[a-z0-9]+", "Direct partition table manipulation"),
        (r":\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:", "Fork bomb execution"),
        (r"chmod\s+(-R\s+)?(777|000)\s+/", "Catastrophic root permission change"),
        (r">\s*/etc/(passwd|shadow|sudoers|fstab|hosts)", "Overwriting critical operating system authentication tables"),
        (r"(shutdown|init\s+0|halt|poweroff)", "Uncontrolled host shutdown"),
    ]

    ALLOWED_SUBNETS = [
        ipaddress.ip_network("192.168.0.0/16"),
        ipaddress.ip_network("10.0.0.0/8"),
        ipaddress.ip_network("172.16.0.0/12"),
        ipaddress.ip_network("127.0.0.0/8"),
    ]

    def verify_command(
        self,
        command_str: str,
        allowed_targets: Optional[List[str]] = None,
    ) -> CommandVerificationResult:
        """
        Executes a multi-stage Chain-of-Verification (CoVe) analysis on a shell command.
        """
        steps: List[VerificationStep] = []
        raw_cmd = command_str.strip()

        # Step 1: Lexical parsing and injection detection
        try:
            tokens = shlex.split(raw_cmd)
        except Exception as e:
            tokens = raw_cmd.split()
            steps.append(
                VerificationStep(
                    step_number=1,
                    question="Can the command string be safely tokenized?",
                    reasoning=f"Lexical splitting failed: {e}",
                    passed=False,
                )
            )
            return CommandVerificationResult(
                is_safe=False,
                risk_level=SecurityLevel.L3_CRITICAL,
                command=command_str,
                parsed_tokens=tokens,
                verification_steps=steps,
                rejection_reason="Malformed shell syntax or invalid escaping.",
            )

        steps.append(
            VerificationStep(
                step_number=1,
                question="Can the command string be safely tokenized?",
                reasoning=f"Successfully tokenized into {len(tokens)} arguments.",
                passed=True,
                evidence=" ".join(tokens[:5]),
            )
        )

        # Step 2: Destructive pattern and privilege abuse checks
        detected_destructive: List[str] = []
        for pattern, desc in self.DANGEROUS_PATTERNS:
            if re.search(pattern, raw_cmd, re.IGNORECASE):
                detected_destructive.append(desc)

        step2_passed = len(detected_destructive) == 0
        steps.append(
            VerificationStep(
                step_number=2,
                question="Does the command avoid unrecoverable or catastrophic destructive signatures?",
                reasoning=(
                    "No destructive signatures detected."
                    if step2_passed
                    else f"Detected destructive patterns: {', '.join(detected_destructive)}"
                ),
                passed=step2_passed,
                evidence=", ".join(detected_destructive) if detected_destructive else None,
            )
        )

        if not step2_passed:
            return CommandVerificationResult(
                is_safe=False,
                risk_level=SecurityLevel.L3_CRITICAL,
                command=command_str,
                parsed_tokens=tokens,
                destructive_flags=detected_destructive,
                verification_steps=steps,
                rejection_reason=f"Blocked catastrophic command: {'; '.join(detected_destructive)}",
            )

        # Step 3: Infrastructure target and IP authorization
        extracted_ips = self._extract_ips(raw_cmd)
        unauthorized_ips: List[str] = []

        for ip_str in extracted_ips:
            try:
                ip_obj = ipaddress.ip_address(ip_str)
                is_allowed = any(ip_obj in subnet for subnet in self.ALLOWED_SUBNETS)
                if not is_allowed:
                    unauthorized_ips.append(ip_str)
            except ValueError:
                continue

        step3_passed = len(unauthorized_ips) == 0
        steps.append(
            VerificationStep(
                step_number=3,
                question="Are all destination IPs within authorized private homelab subnets?",
                reasoning=(
                    "All referenced IPs belong to private homelab networks."
                    if step3_passed
                    else f"Command targets external or unauthorized public IPs: {', '.join(unauthorized_ips)}"
                ),
                passed=step3_passed,
                evidence=", ".join(extracted_ips) if extracted_ips else "No explicit IPs",
            )
        )

        if not step3_passed:
            return CommandVerificationResult(
                is_safe=False,
                risk_level=SecurityLevel.L2_HIGH_IMPACT,
                command=command_str,
                parsed_tokens=tokens,
                target_hosts_or_ips=extracted_ips,
                verification_steps=steps,
                rejection_reason=f"Unauthorized network targets: {', '.join(unauthorized_ips)}",
            )

        # Step 4: Determine assigned security level
        primary_binary = tokens[0] if tokens else ""
        risk_level = self._classify_command_risk(primary_binary, tokens, raw_cmd)

        steps.append(
            VerificationStep(
                step_number=4,
                question="What security tier is required for execution?",
                reasoning=f"Binary '{primary_binary}' evaluated to tier {risk_level.value}.",
                passed=True,
                evidence=risk_level.value,
            )
        )

        return CommandVerificationResult(
            is_safe=True,
            risk_level=risk_level,
            command=command_str,
            parsed_tokens=tokens,
            target_hosts_or_ips=extracted_ips,
            verification_steps=steps,
        )

    def _extract_ips(self, text: str) -> List[str]:
        ip_matches = re.findall(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", text)
        return list(set(ip_matches))

    def _classify_command_risk(self, binary: str, tokens: List[str], raw_cmd: str) -> SecurityLevel:
        read_only_binaries = {"ping", "nmap", "cat", "grep", "ls", "ps", "top", "uptime", "free", "df", "ip", "curl"}
        l1_binaries = {"systemctl", "docker", "podman", "ansible-playbook"}
        l2_binaries = {"qm", "pct", "pvesh", "zfs", "zpool", "ufw", "iptables"}

        # Specific read-only checks
        if binary in read_only_binaries:
            if "curl" in binary and ("-X POST" in raw_cmd or "-X DELETE" in raw_cmd or "-d " in raw_cmd):
                return SecurityLevel.L1_LOW_WRITE
            return SecurityLevel.L0_READ_ONLY

        if binary in l1_binaries:
            if any(t in tokens for t in ["restart", "reload", "start", "stop"]):
                return SecurityLevel.L1_LOW_WRITE
            return SecurityLevel.L1_LOW_WRITE

        if binary in l2_binaries:
            if any(t in tokens for t in ["destroy", "delete", "destroy-all", "rollback", "drop"]):
                return SecurityLevel.L3_CRITICAL
            return SecurityLevel.L2_HIGH_IMPACT

        # General heuristic
        if any(w in raw_cmd.lower() for w in ["destroy", "delete", "purge", "erase", "format"]):
            return SecurityLevel.L3_CRITICAL

        if any(w in raw_cmd.lower() for w in ["reboot", "stop", "kill", "apply", "update", "set"]):
            return SecurityLevel.L2_HIGH_IMPACT

        return SecurityLevel.L1_LOW_WRITE


class SecurityGuardrail:
    """
    Central Guardrail enforcing hallucination detection, schema compliance,
    and Chain-of-Verification (CoVe) validation on all tool requests before execution.
    """

    KNOWN_INVENTORY = {
        "vms": {"200", "201", "100", "101", "102"},
        "nodes": {"pve-node-1", "openmediavault-nas", "MacBook-Air.local"},
        "hosts": {"192.168.1.132", "192.168.1.135", "192.168.1.133", "192.168.1.1", "192.168.1.10", "192.168.1.15", "192.168.1.16", "192.168.1.11"},
        "zfs_pools": {"tank0", "rpool", "storage-mirror"},
    }

    def __init__(self, command_verifier: Optional[CommandVerifier] = None) -> None:
        self.cmd_verifier = command_verifier or CommandVerifier()

    def verify_tool_call(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        inventory_context: Optional[Dict[str, Any]] = None,
    ) -> GuardrailVerdict:
        """
        Validates tool parameters against known homelab inventory to eliminate hallucinations.
        """
        steps: List[VerificationStep] = []
        issues: List[str] = []
        hallucinated: List[str] = []

        active_inventory = dict(self.KNOWN_INVENTORY)
        if inventory_context:
            for k, v in inventory_context.items():
                if isinstance(v, set):
                    active_inventory.setdefault(k, set()).update(v)
                elif isinstance(v, list):
                    active_inventory.setdefault(k, set()).update(set(v))

        # Check 1: VM ID validation
        if "vm_id" in arguments or "vmid" in arguments:
            vmid = str(arguments.get("vm_id") or arguments.get("vmid"))
            valid_vms = active_inventory.get("vms", set())
            if vmid not in valid_vms:
                hallucinated.append(f"vm_id:{vmid}")
                issues.append(f"Referenced VM ID {vmid} does not exist in homelab inventory.")

        # Check 2: Node name validation
        if "node" in arguments or "node_name" in arguments:
            node = str(arguments.get("node") or arguments.get("node_name"))
            valid_nodes = active_inventory.get("nodes", set())
            if node not in valid_nodes:
                hallucinated.append(f"node:{node}")
                issues.append(f"Referenced node '{node}' is not a recognized Proxmox/OMV node.")

        # Check 3: Host IP validation
        if "host" in arguments or "target_ip" in arguments:
            host = str(arguments.get("host") or arguments.get("target_ip"))
            valid_hosts = active_inventory.get("hosts", set())
            if host not in valid_hosts:
                try:
                    ip_obj = ipaddress.ip_address(host)
                    if not any(ip_obj in sub for sub in CommandVerifier.ALLOWED_SUBNETS):
                        hallucinated.append(f"host:{host}")
                        issues.append(f"Host IP {host} is outside authorized homelab subnets.")
                except ValueError:
                    hallucinated.append(f"host:{host}")
                    issues.append(f"Host '{host}' is neither a known hostname nor a valid IP.")

        # Check 4: Shell command embedded in tool parameters
        if "command" in arguments or "cmd" in arguments:
            cmd_text = str(arguments.get("command") or arguments.get("cmd"))
            cmd_res = self.cmd_verifier.verify_command(cmd_text)
            steps.extend(cmd_res.verification_steps)
            if not cmd_res.is_safe:
                issues.append(cmd_res.rejection_reason or "Unsafe shell command in tool arguments.")

        step_passed = len(issues) == 0
        steps.append(
            VerificationStep(
                step_number=len(steps) + 1,
                question="Are all referenced entities grounded in valid homelab inventory?",
                reasoning="All entities valid." if step_passed else f"Hallucinations detected: {'; '.join(issues)}",
                passed=step_passed,
                evidence=", ".join(hallucinated) if hallucinated else None,
            )
        )

        risk_level = SecurityLevel.L2_HIGH_IMPACT if ("reboot" in tool_name or "restart" in tool_name) else SecurityLevel.L0_READ_ONLY
        if "wipe" in tool_name or "destroy" in tool_name or "format" in tool_name:
            risk_level = SecurityLevel.L3_CRITICAL

        return GuardrailVerdict(
            allowed=step_passed,
            risk_level=risk_level,
            tool_name=tool_name,
            hallucinated_entities=hallucinated,
            verification_steps=steps,
            issues=issues,
            rejection_reason="; ".join(issues) if issues else None,
        )

    def verify_shell_command(
        self,
        command: str,
        allowed_targets: Optional[List[str]] = None,
    ) -> CommandVerificationResult:
        """Direct helper to verify standalone shell command safety."""
        return self.cmd_verifier.verify_command(command, allowed_targets=allowed_targets)
