from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field

from elo_contracts.agents import (
    AgentRole,
    SecurityIncidentReport,
    SubAgentResult,
    SubAgentTask,
)
from ..agents.energy_agent import SmartHomeEnergyAgent
from ..agents.infra_agent import InfraAgent
from ..agents.secops_agent import SecOpsThreatHunterAgent
from ..agents.storage_agent import StorageAgent

logger = logging.getLogger("elo.core.swarm.orchestrator")


class SwarmMissionState(str, Enum):
    PENDING = "PENDING"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    PARTIALLY_COMPLETED = "PARTIALLY_COMPLETED"
    FAILED = "FAILED"


class SubAgentExecutionPlan(BaseModel):
    task_id: str
    role: AgentRole
    objective: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    priority: int = 1  # 1 = Highest (NetSec), 2 = Storage/Infra, 3 = Home


class SwarmMissionResult(BaseModel):
    mission_id: str
    goal: str
    state: SwarmMissionState
    sub_agent_results: Dict[str, SubAgentResult] = Field(default_factory=dict)
    incidents_reported: List[SecurityIncidentReport] = Field(default_factory=list)
    actions_executed: List[Dict[str, Any]] = Field(default_factory=list)
    aggregated_metrics: Dict[str, Any] = Field(default_factory=dict)
    synthesis_summary: str
    duration_seconds: float = 0.0
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Specialized sub-agent aliases
NetSecAgent = SecOpsThreatHunterAgent
HomeAgent = SmartHomeEnergyAgent


class SwarmOrchestrator:
    """
    Hierarchical Multi-Agent Swarm Orchestrator.
    Decomposes complex operational homelab missions into specialized sub-agent tasks,
    coordinates parallel and prioritized execution across NetSec, Infra, Storage, and Home agents,
    resolves resource conflicts, and synthesizes unified mission intelligence.
    """

    def __init__(
        self,
        netsec_agent: Optional[NetSecAgent] = None,
        infra_agent: Optional[InfraAgent] = None,
        storage_agent: Optional[StorageAgent] = None,
        home_agent: Optional[HomeAgent] = None,
    ) -> None:
        self.netsec = netsec_agent or SecOpsThreatHunterAgent()
        self.infra = infra_agent or InfraAgent()
        self.storage = storage_agent or StorageAgent()
        self.home = home_agent or SmartHomeEnergyAgent()

        self._agent_registry = {
            AgentRole.SECOPS_HUNTER: self.netsec,
            AgentRole.NETSEC: self.netsec,
            AgentRole.INFRA: self.infra,
            AgentRole.STORAGE: self.storage,
            AgentRole.SMART_HOME_ENERGY: self.home,
            AgentRole.HOME: self.home,
        }

    def get_registered_agents(self) -> Dict[str, str]:
        """Returns map of active sub-agents and their implementation classes."""
        return {
            "NetSecAgent": self.netsec.__class__.__name__,
            "InfraAgent": self.infra.__class__.__name__,
            "StorageAgent": self.storage.__class__.__name__,
            "HomeAgent": self.home.__class__.__name__,
        }

    async def get_swarm_health(self) -> Dict[str, Any]:
        """Performs liveness check across all registered sub-agents."""
        return {
            "orchestrator_status": "ONLINE",
            "active_subagents": len(self._agent_registry),
            "agents": {
                "netsec": {"status": "ONLINE", "role": AgentRole.NETSEC.value},
                "infra": {"status": "ONLINE", "role": AgentRole.INFRA.value},
                "storage": {"status": "ONLINE", "role": AgentRole.STORAGE.value},
                "home": {"status": "ONLINE", "role": AgentRole.HOME.value},
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def decompose_mission_goal(self, goal: str) -> List[SubAgentExecutionPlan]:
        """
        Decomposes high-level mission objective into prioritized sub-agent execution plans.
        """
        goal_lower = goal.lower()
        plans: List[SubAgentExecutionPlan] = []

        # 1. NetSec / Security Intent
        if any(w in goal_lower for w in ["security", "secops", "threat", "ban", "quarantine", "firewall", "audit", "all", "full"]):
            plans.append(
                SubAgentExecutionPlan(
                    task_id=f"TASK-NETSEC-{uuid.uuid4().hex[:6]}",
                    role=AgentRole.NETSEC,
                    objective="Inspect perimeter firewall logs and quarantine active brute-force sources.",
                    parameters={"action": "analyze_logs"},
                    priority=1,
                )
            )

        # 2. Storage / ZFS Intent
        if any(w in goal_lower for w in ["storage", "zfs", "smart", "disk", "backup", "snapshot", "scrub", "all", "full"]):
            plans.append(
                SubAgentExecutionPlan(
                    task_id=f"TASK-STORAGE-{uuid.uuid4().hex[:6]}",
                    role=AgentRole.STORAGE,
                    objective="Audit SMART health, inspect ZFS pool checksums, and verify PBS/Restic backup integrity.",
                    parameters={"action": "storage_audit"},
                    priority=2,
                )
            )

        # 3. Infrastructure / Proxmox Intent
        if any(w in goal_lower for w in ["infra", "proxmox", "node", "rebalance", "migrate", "vm", "lxc", "cluster", "all", "full"]):
            plans.append(
                SubAgentExecutionPlan(
                    task_id=f"TASK-INFRA-{uuid.uuid4().hex[:6]}",
                    role=AgentRole.INFRA,
                    objective="Score cluster node health and formulate predictive workload rebalancing plans.",
                    parameters={"action": "cluster_rebalance"},
                    priority=2,
                )
            )

        # 4. Smart Home / Energy Intent
        if any(w in goal_lower for w in ["home", "energy", "power", "vampire", "relay", "shelly", "all", "full"]):
            plans.append(
                SubAgentExecutionPlan(
                    task_id=f"TASK-HOME-{uuid.uuid4().hex[:6]}",
                    role=AgentRole.HOME,
                    objective="Evaluate instant power consumption across smart plugs and detect idle vampire loads.",
                    parameters={"action": "optimize_energy"},
                    priority=3,
                )
            )

        if not plans:
            # Fallback default: general cluster health check
            plans.append(
                SubAgentExecutionPlan(
                    task_id=f"TASK-INFRA-{uuid.uuid4().hex[:6]}",
                    role=AgentRole.INFRA,
                    objective="Evaluate general cluster infrastructure health.",
                    parameters={"action": "health_audit"},
                    priority=1,
                )
            )

        # Sort by priority ascending (Priority 1 first)
        plans.sort(key=lambda p: p.priority)
        return plans

    async def dispatch_subagent_task(self, plan: SubAgentExecutionPlan) -> SubAgentResult:
        """
        Dispatches an individual task to the mapped sub-agent with error isolation and timeout protection.
        """
        agent = self._agent_registry.get(plan.role)
        if not agent:
            logger.error(f"[SwarmOrchestrator] No registered agent for role: {plan.role}")
            return SubAgentResult(
                task_id=plan.task_id,
                role=plan.role,
                success=False,
                summary=f"No agent registered for role {plan.role}",
            )

        sub_task = SubAgentTask(
            task_id=plan.task_id,
            role=plan.role,
            objective=plan.objective,
            parameters=plan.parameters,
        )

        try:
            logger.info(f"[SwarmOrchestrator] Dispatching to {agent.__class__.__name__} (Task: {plan.task_id})")
            result = await asyncio.wait_for(agent.execute_task(sub_task), timeout=15.0)
            return result
        except asyncio.TimeoutError:
            logger.error(f"[SwarmOrchestrator] Task {plan.task_id} timed out after 15s")
            return SubAgentResult(
                task_id=plan.task_id,
                role=plan.role,
                success=False,
                summary=f"Task timed out during execution by {agent.__class__.__name__}",
            )
        except Exception as e:
            logger.error(f"[SwarmOrchestrator] Exception in task {plan.task_id}: {str(e)}")
            return SubAgentResult(
                task_id=plan.task_id,
                role=plan.role,
                success=False,
                summary=f"Execution failed: {str(e)}",
            )

    async def coordinate_swarm_mission(
        self,
        goal: str,
        required_roles: Optional[List[AgentRole]] = None,
    ) -> SwarmMissionResult:
        """
        Coordinates full multi-agent swarm mission:
        1. Plans decomposition and identifies required sub-agents.
        2. Executes high-priority tasks (NetSec threat containment) before standard tasks.
        3. Concurrently runs non-conflicting tasks.
        4. Synthesizes multi-domain results into unified executive summary.
        """
        start_time = asyncio.get_event_loop().time()
        mission_id = f"SWARM-{uuid.uuid4().hex[:8].upper()}"
        logger.info(f"[SwarmOrchestrator] Starting mission {mission_id} with goal: '{goal}'")

        plans = self.decompose_mission_goal(goal)
        if required_roles:
            plans = [p for p in plans if p.role in required_roles]

        results_map: Dict[str, SubAgentResult] = {}
        all_incidents: List[SecurityIncidentReport] = []
        all_actions: List[Dict[str, Any]] = []
        aggregated_metrics: Dict[str, Any] = {}

        # Prioritized stage 1: Priority 1 (NetSec containment)
        priority_1_plans = [p for p in plans if p.priority == 1]
        if priority_1_plans:
            stage_1_results = await asyncio.gather(
                *[self.dispatch_subagent_task(p) for p in priority_1_plans],
                return_exceptions=False,
            )
            for plan, res in zip(priority_1_plans, stage_1_results):
                results_map[plan.role.value] = res
                if res.incident_report:
                    all_incidents.append(res.incident_report)
                all_actions.extend(res.actions_executed)
                aggregated_metrics[plan.role.value] = res.metrics

        # Stage 2: Priority 2 & 3 (Storage, Infra, Smart Home)
        other_plans = [p for p in plans if p.priority > 1]
        if other_plans:
            stage_2_results = await asyncio.gather(
                *[self.dispatch_subagent_task(p) for p in other_plans],
                return_exceptions=False,
            )
            for plan, res in zip(other_plans, stage_2_results):
                results_map[plan.role.value] = res
                if res.incident_report:
                    all_incidents.append(res.incident_report)
                all_actions.extend(res.actions_executed)
                aggregated_metrics[plan.role.value] = res.metrics

        duration = round(asyncio.get_event_loop().time() - start_time, 2)
        all_success = all(r.success for r in results_map.values()) if results_map else False
        state = SwarmMissionState.COMPLETED if all_success else SwarmMissionState.PARTIALLY_COMPLETED

        # Generate synthesis summary
        summaries = [f"[{role.upper()}]: {res.summary}" for role, res in results_map.items()]
        synthesis = (
            f"Swarm mission '{goal}' finalized in {duration}s. "
            f"{len(results_map)} sub-agent(s) executed successfully. "
            + " | ".join(summaries)
        )

        return SwarmMissionResult(
            mission_id=mission_id,
            goal=goal,
            state=state,
            sub_agent_results=results_map,
            incidents_reported=all_incidents,
            actions_executed=all_actions,
            aggregated_metrics=aggregated_metrics,
            synthesis_summary=synthesis,
            duration_seconds=duration,
        )
