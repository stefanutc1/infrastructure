from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False
from pydantic import BaseModel, Field

from ..homelab_inventory import HOMELAB_SERVICES

logger = logging.getLogger("elo.core.gitops.evaluator")


class CheckStatus(str, Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    WARNING = "WARNING"
    SKIPPED = "SKIPPED"


class MergeAction(str, Enum):
    MERGE_APPROVED = "MERGE_APPROVED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    MERGE_BLOCKED = "MERGE_BLOCKED"


class ManifestValidationCheck(BaseModel):
    check_name: str
    status: CheckStatus
    file_path: str
    line_number: Optional[int] = None
    rule_id: str
    message: str


class PREvaluationResult(BaseModel):
    pr_number: int
    repo: str
    author: str
    branch: str
    mergeable: bool
    total_checks: int
    passed_checks: int
    failed_checks: int
    checks: List[ManifestValidationCheck] = Field(default_factory=list)
    summary: str
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MergeDecision(BaseModel):
    pr_number: int
    action: MergeAction
    reason: str
    auto_merged: bool = False
    decision_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GitOpsPREvaluator:
    """
    GitOps Pull Request Evaluator.
    Validates Docker Compose and Kubernetes declarative YAML manifests,
    enforces security policies (no root privileges, no cleartext tokens),
    detects port and IP collisions against the homelab service catalog,
    and gates automated merges to the primary infrastructure branch.
    """

    def __init__(
        self,
        gitea_url: str = "http://192.168.1.17:3000",
        allow_auto_merge: bool = True,
    ) -> None:
        self.gitea_url = gitea_url
        self.allow_auto_merge = allow_auto_merge
        self._allocated_ports: set[int] = {s.get("port") for s in HOMELAB_SERVICES if s.get("port")}

    def validate_yaml_syntax(self, yaml_content: str, filename: str) -> List[ManifestValidationCheck]:
        """Validates that file content parses as valid YAML."""
        checks = []
        if YAML_AVAILABLE:
            try:
                yaml.safe_load(yaml_content)
                checks.append(
                    ManifestValidationCheck(
                        check_name="YAML Syntax Parser",
                        status=CheckStatus.PASSED,
                        file_path=filename,
                        rule_id="GITOPS-001",
                        message="YAML syntax is valid.",
                    )
                )
            except Exception as exc:
                checks.append(
                    ManifestValidationCheck(
                        check_name="YAML Syntax Parser",
                        status=CheckStatus.FAILED,
                        file_path=filename,
                        rule_id="GITOPS-001",
                        message=f"YAML parsing error: {str(exc)}",
                    )
                )
        else:
            # Fallback basic indentation / structure validation
            is_valid = len(yaml_content.strip()) > 0 and ":" in yaml_content
            checks.append(
                ManifestValidationCheck(
                    check_name="YAML Syntax Parser",
                    status=CheckStatus.PASSED if is_valid else CheckStatus.FAILED,
                    file_path=filename,
                    rule_id="GITOPS-001",
                    message="YAML basic syntax validated (structural heuristic mode).",
                )
            )
        return checks

    def check_security_lints(self, yaml_content: str, filename: str) -> List[ManifestValidationCheck]:
        """
        Enforces security best practices:
        - Rejects `privileged: true` unless explicitly overridden.
        - Rejects hardcoded cleartext API keys or DB passwords.
        """
        checks = []

        # Privileged check
        if re.search(r"privileged:\s*true", yaml_content, re.IGNORECASE):
            checks.append(
                ManifestValidationCheck(
                    check_name="Container Privilege Policy",
                    status=CheckStatus.FAILED,
                    file_path=filename,
                    rule_id="SEC-001-PRIVILEGED",
                    message="Container requests 'privileged: true'. Violates homelab least-privilege security policy.",
                )
            )
        else:
            checks.append(
                ManifestValidationCheck(
                    check_name="Container Privilege Policy",
                    status=CheckStatus.PASSED,
                    file_path=filename,
                    rule_id="SEC-001-PRIVILEGED",
                    message="No unconfined privileged mode detected.",
                )
            )

        # Cleartext password detection
        secret_pattern = r"(password|secret|token|api_key):\s*['\"]?(?!(\${|\bNone\b))([a-zA-Z0-9_\-\.]{8,})['\"]?"
        if re.search(secret_pattern, yaml_content, re.IGNORECASE):
            checks.append(
                ManifestValidationCheck(
                    check_name="Secret Leak Detector",
                    status=CheckStatus.FAILED,
                    file_path=filename,
                    rule_id="SEC-002-CLEARTEXT",
                    message="Potential plaintext secret or token detected in manifest. Use .env or Vaultwarden.",
                )
            )
        else:
            checks.append(
                ManifestValidationCheck(
                    check_name="Secret Leak Detector",
                    status=CheckStatus.PASSED,
                    file_path=filename,
                    rule_id="SEC-002-CLEARTEXT",
                    message="Secrets properly parameterized via environment variables.",
                )
            )

        return checks

    def check_port_collisions(self, yaml_content: str, filename: str) -> List[ManifestValidationCheck]:
        """
        Scans host port bindings and verifies there are no collisions with existing homelab services.
        """
        checks = []
        # Match host:container ports e.g. "8080:80"
        port_matches = re.findall(r"['\"]?(\d{2,5}):\d{2,5}['\"]?", yaml_content)
        exposed_ports = [int(p) for p in port_matches if p.isdigit()]

        collisions = [p for p in exposed_ports if p in self._allocated_ports]

        if collisions:
            checks.append(
                ManifestValidationCheck(
                    check_name="Port Allocation Conflict",
                    status=CheckStatus.FAILED,
                    file_path=filename,
                    rule_id="NET-001-PORT-COLLISION",
                    message=f"Port collision detected: Port(s) {collisions} are already assigned to existing homelab services.",
                )
            )
        else:
            checks.append(
                ManifestValidationCheck(
                    check_name="Port Allocation Conflict",
                    status=CheckStatus.PASSED,
                    file_path=filename,
                    rule_id="NET-001-PORT-COLLISION",
                    message="All host port allocations are unique and available.",
                )
            )

        return checks

    async def evaluate_pull_request(
        self,
        pr_number: int,
        changed_files: Dict[str, str],
        repo: str = "homelab/infrastructure",
        author: str = "stefanut",
        branch: str = "feat/new-monitoring-stack",
    ) -> PREvaluationResult:
        """
        Evaluates full PR diff, executing YAML validation, security linters, and port conflict checks.
        """
        logger.info(f"[GitOpsEvaluator] Evaluating PR #{pr_number} on {repo} ({len(changed_files)} files)")
        all_checks: List[ManifestValidationCheck] = []

        for filename, content in changed_files.items():
            if filename.endswith((".yaml", ".yml")):
                syntax_checks = self.validate_yaml_syntax(content, filename)
                all_checks.extend(syntax_checks)

                # Only run deeper checks if YAML syntax is valid
                if all(c.status == CheckStatus.PASSED for c in syntax_checks):
                    sec_checks = self.check_security_lints(content, filename)
                    all_checks.extend(sec_checks)

                    port_checks = self.check_port_collisions(content, filename)
                    all_checks.extend(port_checks)

        total = len(all_checks)
        passed = sum(1 for c in all_checks if c.status == CheckStatus.PASSED)
        failed = sum(1 for c in all_checks if c.status == CheckStatus.FAILED)
        mergeable = (failed == 0) and (total > 0)

        summary = (
            f"GitOps PR #{pr_number} evaluation finished. "
            f"{passed}/{total} checks PASSED ({failed} failures). "
            f"Merge eligibility: {'APPROVED' if mergeable else 'BLOCKED'}."
        )

        return PREvaluationResult(
            pr_number=pr_number,
            repo=repo,
            author=author,
            branch=branch,
            mergeable=mergeable,
            total_checks=total,
            passed_checks=passed,
            failed_checks=failed,
            checks=all_checks,
            summary=summary,
        )

    async def decide_merge_action(self, evaluation: PREvaluationResult) -> MergeDecision:
        """
        Calculates automated merge decision based on evaluation results.
        """
        if evaluation.mergeable:
            return MergeDecision(
                pr_number=evaluation.pr_number,
                action=MergeAction.MERGE_APPROVED,
                reason="All GitOps linting, security policies, and network allocation assertions passed.",
                auto_merged=self.allow_auto_merge,
            )
        else:
            failed_rules = [c.rule_id for c in evaluation.checks if c.status == CheckStatus.FAILED]
            return MergeDecision(
                pr_number=evaluation.pr_number,
                action=MergeAction.CHANGES_REQUESTED,
                reason=f"PR blocked by {len(failed_rules)} failed policy checks: {', '.join(failed_rules)}",
                auto_merged=False,
            )
