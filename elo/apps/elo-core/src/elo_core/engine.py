from __future__ import annotations
import json
import logging
from typing import List, Dict, Any, Optional
from elo_contracts.security import SecurityLevel, ApprovalStatus
from elo_contracts.events import DomainEnum
from elo_security.gatekeeper import SecurityGatekeeper
from elo_ai_client.base import BaseLLMClient, ChatMessage, Role, LLMResponse
from .registry import ToolRegistry
from .audit import AuditLogger

logger = logging.getLogger("elo.engine")


class ELOEngine:
    """
    Central Orchestration Engine for ELO.
    Coordinates LLM reasoning, security approvals, tool calls, and audit trails.
    """

    def __init__(
        self,
        llm_router: BaseLLMClient,
        tool_registry: ToolRegistry,
        gatekeeper: SecurityGatekeeper,
        audit_logger: AuditLogger,
        max_react_iterations: int = 5,
    ):
        self.llm = llm_router
        self.registry = tool_registry
        self.gatekeeper = gatekeeper
        self.audit = audit_logger
        self.max_iterations = max_react_iterations

    async def process_user_message(
        self,
        user_text: str,
        actor: str = "user",
        session_history: Optional[List[ChatMessage]] = None,
        auto_wait_for_approval: bool = False,
    ) -> Dict[str, Any]:
        """
        Executes the ReAct loop for a user request.
        Handles tool calls, security gates, and synthesis.
        """
        messages: List[ChatMessage] = list(session_history or [])
        
        # Add system prompt if not present
        if not messages or messages[0].role != Role.SYSTEM:
            system_prompt = (
                "You are ELO, a homelab orchestrator and control plane.\n"
                "You assist with infrastructure management (Proxmox, OPNsense, Home Assistant, storage, telemetry),\n"
                "service operations, and workflow automation. Respond cleanly in Romanian or English based on the user's language."
            )
            messages.insert(0, ChatMessage(role=Role.SYSTEM, content=system_prompt))

        messages.append(ChatMessage(role=Role.USER, content=user_text))

        tools_schema = self.registry.get_definitions()
        pending_approvals = []
        executed_tools = []

        for iteration in range(self.max_iterations):
            resp: LLMResponse = await self.llm.chat(
                messages=messages,
                tools=tools_schema if tools_schema else None,
            )

            # If LLM generated text and no tool calls, we are done
            if not resp.tool_calls:
                messages.append(ChatMessage(role=Role.ASSISTANT, content=resp.content))
                return {
                    "status": "COMPLETED",
                    "response": resp.content,
                    "model_used": resp.model_used,
                    "provider": resp.provider,
                    "tools_executed": executed_tools,
                    "pending_approvals": pending_approvals,
                    "history": messages,
                }

            # If tool calls are requested
            messages.append(
                ChatMessage(
                    role=Role.ASSISTANT,
                    content=resp.content,
                    tool_calls=resp.tool_calls,
                    raw_parts=resp.raw_parts,
                )
            )

            for tc in resp.tool_calls:
                tool_defn = self.registry.get_definition(tc.name)
                sec_level = tool_defn.security_level if tool_defn else SecurityLevel.L0_READ_ONLY
                domain_val = DomainEnum.HOMELAB if "proxmox" in tc.name else DomainEnum.BUSINESS

                # 1. Evaluate Security Gatekeeper
                can_exec, app_req, cap_token = self.gatekeeper.assess_execution(
                    tool_name=tc.name,
                    security_level=sec_level,
                    parameters=tc.arguments,
                    explanation=f"ELO requested tool '{tc.name}' during step {iteration+1}",
                )

                if not can_exec and app_req:
                    # Log audit for pending approval
                    self.audit.log(
                        domain=domain_val,
                        actor=actor,
                        action=f"REQUEST_{tc.name}",
                        security_level=sec_level,
                        tool_name=tc.name,
                        parameters=tc.arguments,
                        approval_status="PENDING_APPROVAL",
                    )
                    pending_approvals.append(app_req.model_dump())

                    if auto_wait_for_approval:
                        approved = await self.gatekeeper.wait_for_approval(app_req.id)
                        if not approved:
                            tool_output_str = json.dumps({"error": "User rejected the action or approval timed out."})
                            messages.append(
                                ChatMessage(
                                    role=Role.TOOL,
                                    name=tc.name,
                                    tool_call_id=tc.id,
                                    content=tool_output_str,
                                )
                            )
                            continue
                    else:
                        # Return immediately asking for approval
                        return {
                            "status": "AWAITING_APPROVAL",
                            "response": (
                                f"Acțiunea `{tc.name}` necesită confirmarea ta (Nivel: {sec_level.value}). "
                                f"Ticket de aprobare: `{app_req.id}`."
                            ),
                            "approval_request": app_req.model_dump(),
                            "model_used": resp.model_used,
                            "history": messages,
                        }

                # 2. Execute Tool
                res = await self.registry.execute(tc.name, tc.arguments)
                executed_tools.append({"tool": tc.name, "success": res.success, "output": res.output})

                # Log Audit
                self.audit.log(
                    domain=domain_val,
                    actor=actor,
                    action=f"EXECUTE_{tc.name}",
                    security_level=sec_level,
                    tool_name=tc.name,
                    parameters=tc.arguments,
                    approval_status="AUTO_APPROVED" if can_exec else "USER_APPROVED",
                    execution_result={"output": res.output} if res.success else None,
                    error_message=res.error,
                )

                # Feed tool result back into context
                tool_output_str = json.dumps(res.output if res.success else {"error": res.error})
                messages.append(
                    ChatMessage(
                        role=Role.TOOL,
                        name=tc.name,
                        tool_call_id=tc.id,
                        content=tool_output_str,
                    )
                )

        # Fallback if max iterations exceeded
        return {
            "status": "MAX_ITERATIONS_REACHED",
            "response": "Am atins limita maximă de pași de execuție pentru această cerere.",
            "tools_executed": executed_tools,
            "history": messages,
        }
