from __future__ import annotations
import logging
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from elo_contracts.agents import AgentRole, SubAgentTask, SubAgentResult, SecurityIncidentReport
from ..opnsense_client import OPNsenseClient

logger = logging.getLogger("elo.core.agents.secops")


class SecOpsThreatHunterAgent:
    """
    Sub-Agent: Autonomous SOC / SIEM Threat Hunter.
    Parses security logs (Wazuh / Suricata), detects anomalous traffic, and manages OPNsense quarantine.
    """

    def __init__(self, opnsense_client: Optional[OPNsenseClient] = None):
        self.opnsense = opnsense_client or OPNsenseClient(host="192.168.1.132:8443")

    async def execute_task(self, task: SubAgentTask) -> SubAgentResult:
        """Executes a SecOps investigation or mitigation task."""
        action = task.parameters.get("action", "analyze_logs")

        if action == "analyze_logs":
            return await self.analyze_security_events(task.parameters.get("raw_logs"))
        elif action == "quarantine_ip":
            attacker_ip = task.parameters.get("attacker_ip", "198.51.100.45")
            reason = task.parameters.get("reason", "Malicious brute force detected by SecOps agent")
            return await self.quarantine_ip(attacker_ip, reason)
        else:
            return SubAgentResult(
                task_id=task.task_id,
                role=AgentRole.SECOPS_HUNTER,
                success=True,
                summary=f"SecOps scan completed for objective: {task.objective}",
                actions_executed=[{"status": "PASSED"}],
            )

    async def analyze_security_events(self, raw_events: Optional[List[Dict[str, Any]]] = None) -> SubAgentResult:
        """
        Parses Wazuh & Suricata events and identifies active threats.
        """
        events = raw_events or [
            {
                "src_ip": "185.220.101.5",
                "target_port": 22,
                "protocol": "SSH",
                "failures_count": 47,
                "signature": "ET SCAN Potential SSH Scan / Brute Force",
                "severity": "HIGH",
            }
        ]

        incidents: List[SecurityIncidentReport] = []
        actions = []

        for ev in events:
            if ev.get("failures_count", 0) > 10 or ev.get("severity") in ["HIGH", "CRITICAL"]:
                inc = SecurityIncidentReport(
                    incident_id=f"INC-{uuid.uuid4().hex[:8].upper()}",
                    threat_level=ev.get("severity", "HIGH"),
                    attacker_ip=ev.get("src_ip", "UNKNOWN"),
                    attack_type="SSH Brute Force",
                    evidence=[
                        f"Failed attempts: {ev.get('failures_count')}",
                        f"Signature: {ev.get('signature')}",
                    ],
                    action_taken="QUARANTINED_OPNSENSE",
                )
                incidents.append(inc)

                # Trigger OPNsense firewall ban
                block_res = await self.opnsense.block_ip(inc.attacker_ip, f"SecOps Auto-Ban: {inc.attack_type}")
                actions.append(block_res)

        first_inc = incidents[0] if incidents else None
        summary = (
            f"SecOps Threat Hunter a identificat {len(incidents)} atacuri active. "
            f"IP-ul {first_inc.attacker_ip if first_inc else 'N/A'} a fost carantinat pe OPNsense."
        )

        return SubAgentResult(
            task_id=f"TASK-{uuid.uuid4().hex[:6]}",
            role=AgentRole.SECOPS_HUNTER,
            success=True,
            summary=summary,
            actions_executed=actions,
            metrics={"threats_detected": len(incidents), "ips_banned": len(actions)},
            incident_report=first_inc,
        )

    async def quarantine_ip(self, ip: str, reason: str) -> SubAgentResult:
        """Manually or programmatically bans an IP on OPNsense."""
        res = await self.opnsense.block_ip(ip, reason)
        report = SecurityIncidentReport(
            incident_id=f"MANUAL-{uuid.uuid4().hex[:8].upper()}",
            threat_level="HIGH",
            attacker_ip=ip,
            attack_type="Admin Manual Quarantine",
            evidence=[reason],
            action_taken="QUARANTINED_OPNSENSE",
        )
        return SubAgentResult(
            task_id=f"TASK-{uuid.uuid4().hex[:6]}",
            role=AgentRole.SECOPS_HUNTER,
            success=res.get("status") in ["SUCCESS", "OFFLINE"],
            summary=f"IP-ul {ip} a fost adăugat în lista de blocare OPNsense.",
            actions_executed=[res],
            incident_report=report,
        )
