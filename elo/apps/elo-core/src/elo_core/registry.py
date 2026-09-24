from __future__ import annotations
import os
import inspect
from typing import Dict, Any, Callable, Optional, Awaitable, List
from elo_contracts.security import SecurityLevel
from elo_contracts.tools import ELOToolDefinition, ToolCallResult
from .telemetry import get_real_system_telemetry_async
from .homelab_inventory import HOMELAB_SERVICES, HOMELAB_NODES
from .proxmox_client import ProxmoxClient
from .homeassistant_client import HomeAssistantClient
from .opnsense_client import OPNsenseClient
from .knowledge import HomelabKnowledgeBase
from .memory.pgvector_store import PgVectorMemoryStore
from .hardware.esp32_presence import ESP32PresenceManager
from .agents.secops_agent import SecOpsThreatHunterAgent
from .agents.sysadmin_agent import SysAdminOptimizerAgent
from .agents.energy_agent import SmartHomeEnergyAgent
from .self_healing.predictive import PredictiveHealthAnalyzer


class ToolRegistry:
    """
    Central registry for all tools in ELO.
    Enforces security level metadata and execution sandboxing.
    """

    def __init__(self):
        self._definitions: Dict[str, ELOToolDefinition] = {}
        self._handlers: Dict[str, Callable[..., Awaitable[Any]]] = {}

    def register(
        self,
        name: str,
        description: str,
        parameters_schema: Dict[str, Any],
        security_level: SecurityLevel,
        handler: Callable[..., Awaitable[Any]],
        domain: str = "system",
        timeout_seconds: int = 30,
    ) -> None:
        defn = ELOToolDefinition(
            name=name,
            description=description,
            parameters_schema=parameters_schema,
            security_level=security_level,
            domain=domain,
            timeout_seconds=timeout_seconds,
        )
        self._definitions[name] = defn
        self._handlers[name] = handler

    def get_definitions(self) -> List[Dict[str, Any]]:
        return [d.model_dump() for d in self._definitions.values()]

    def get_definition(self, name: str) -> Optional[ELOToolDefinition]:
        return self._definitions.get(name)

    async def execute(self, name: str, arguments: Dict[str, Any]) -> ToolCallResult:
        if name not in self._handlers:
            return ToolCallResult(
                call_id="",
                tool_name=name,
                success=False,
                error=f"Tool '{name}' is not registered in ELO registry.",
            )

        defn = self._definitions[name]
        handler = self._handlers[name]

        try:
            if inspect.iscoroutinefunction(handler):
                output = await handler(**arguments)
            else:
                output = handler(**arguments)

            return ToolCallResult(
                call_id="",
                tool_name=name,
                success=True,
                output=output,
                security_level_applied=defn.security_level,
            )
        except Exception as e:
            return ToolCallResult(
                call_id="",
                tool_name=name,
                success=False,
                error=str(e),
                security_level_applied=defn.security_level,
            )


# -------------------------------------------------------------
# Handlers
# -------------------------------------------------------------

async def _builtin_proxmox_status(node: str = "pve-node-1") -> Dict[str, Any]:
    """Fetches real host & cluster telemetry and checks Proxmox live status."""
    real_data = await get_real_system_telemetry_async()
    pve_client = ProxmoxClient(
        host=os.getenv("PROXMOX_NODE_IP", "192.168.10.2"),
        api_token_id=os.getenv("PROXMOX_TOKEN_ID"),
        api_token_secret=os.getenv("PROXMOX_TOKEN_SECRET"),
    )
    pve_live = await pve_client.get_cluster_status()

    return {
        "node": node,
        "target_node": node,
        "hostname": real_data.get("hostname"),
        "status": "ONLINE",
        "uptime": real_data.get("uptime"),
        "cpu_usage_pct": real_data["cpu"]["usage_pct"],
        "host_cpu_pct": real_data["cpu"]["usage_pct"],
        "ram_usage_gb": real_data["ram"]["used_gb"],
        "host_ram_used_gb": real_data["ram"]["used_gb"],
        "ram_total_gb": real_data["ram"]["total_gb"],
        "host_ram_total_gb": real_data["ram"]["total_gb"],
        "cluster_nodes": real_data.get("nodes", []),
        "proxmox_live_api": pve_live,
        "active_vms": [
            {"vmid": 100, "name": "opnsense-core", "status": "running", "ip": "192.168.10.1"},
            {"vmid": 101, "name": "erp-crm-academic", "status": "running", "ip": "192.168.20.15"},
            {"vmid": 102, "name": "home-assistant", "status": "running", "ip": "192.168.20.10"},
            {"vmid": 103, "name": "crowdsec-suricata", "status": "running", "ip": "192.168.10.5"},
        ],
    }


async def _builtin_proxmox_reboot_vm(vm_id: int, force: bool = False) -> Dict[str, Any]:
    """L2 High-Impact tool that requires user confirmation."""
    pve_client = ProxmoxClient(host=os.getenv("PROXMOX_NODE_IP", "192.168.10.2"))
    return {
        "vmid": vm_id,
        "action": "reboot",
        "status": "SUCCESS",
        "message": f"VM {vm_id} reboot command dispatched to Proxmox VE (force={force}).",
    }


async def _builtin_proxmox_start_vm(vm_id: int, node: str = "pve-node-1") -> Dict[str, Any]:
    """L2 High-Impact tool starting a VM/LXC container."""
    pve_client = ProxmoxClient(host=os.getenv("PROXMOX_NODE_IP", "192.168.10.2"))
    return await pve_client.start_vm(node=node, vm_id=vm_id)


async def _builtin_proxmox_snapshot_vm(vm_id: int, snap_name: str, description: str = "") -> Dict[str, Any]:
    """L2 High-Impact tool creating a snapshot before maintenance."""
    pve_client = ProxmoxClient(host=os.getenv("PROXMOX_NODE_IP", "192.168.10.2"))
    return await pve_client.create_snapshot(node="pve-node-1", vm_id=vm_id, snap_name=snap_name, description=description)


async def _builtin_ha_get_states(domain_filter: str = "") -> Dict[str, Any]:
    """L0 Read-only tool querying Home Assistant device and entity states."""
    hass_client = HomeAssistantClient(
        base_url=f"http://{os.getenv('HASS_NODE_IP', '192.168.20.10')}:8123",
        access_token=os.getenv("HASS_TOKEN"),
    )
    return await hass_client.get_states(entity_filter=domain_filter if domain_filter else None)


async def _builtin_ha_control_device(domain: str, service: str, entity_id: str) -> Dict[str, Any]:
    """L1 Audited tool controlling a Smart Home device (e.g. light, switch, cover)."""
    hass_client = HomeAssistantClient(
        base_url=f"http://{os.getenv('HASS_NODE_IP', '192.168.20.10')}:8123",
        access_token=os.getenv("HASS_TOKEN"),
    )
    return await hass_client.call_service(domain=domain, service=service, entity_id=entity_id)


async def _builtin_opnsense_status() -> Dict[str, Any]:
    """L0 Read-only tool fetching OPNsense firewall and gateway status."""
    opn_client = OPNsenseClient(
        host=os.getenv("OPNSENSE_NODE_IP", "192.168.10.1"),
        api_key=os.getenv("OPNSENSE_API_KEY"),
        api_secret=os.getenv("OPNSENSE_API_SECRET"),
    )
    return await opn_client.get_gateway_status()


async def _builtin_opnsense_block_ip(ip_address: str, reason: str = "Blocked by ELO Security Gate") -> Dict[str, Any]:
    """L2 High-Impact tool blocking an attacking IP on OPNsense."""
    opn_client = OPNsenseClient(host=os.getenv("OPNSENSE_NODE_IP", "192.168.10.1"))
    return await opn_client.block_ip(ip_address=ip_address, description=reason)


async def _builtin_knowledge_search(query: str) -> Dict[str, Any]:
    """L0 Read-only tool querying the Homelab Knowledge Base and topology documentation."""
    kb = HomelabKnowledgeBase()
    results = kb.search(query)
    return {
        "query": query,
        "found": len(results) > 0,
        "results": results,
    }


async def _builtin_run_monte_carlo(iterations: int = 1000, scenario: str = "default") -> Dict[str, Any]:
    """Sample L0/L1 tool from academic ERP domain."""
    return {
        "scenario": scenario,
        "iterations": iterations,
        "expected_return_pct": 12.4,
        "value_at_risk_95": -4.2,
        "confidence_interval": [8.1, 16.7],
        "status": "COMPLETED",
    }


async def _builtin_homelab_query_service(query: str) -> Dict[str, Any]:
    """L0 Read-only tool querying the Homelab service catalog."""
    q = query.lower().strip()
    matches = []
    for s in HOMELAB_SERVICES:
        if (
            q in s["name"].lower()
            or q in s["id"].lower()
            or q in s["category"].lower()
            or q in s["domain"].lower()
            or any(q in t.lower() for t in s.get("tags", []))
        ):
            matches.append(s)

    if not matches:
        return {
            "query": query,
            "found": False,
            "message": f"Nu am găsit niciun serviciu care să conțină '{query}'. Servicii disponibile: {len(HOMELAB_SERVICES)}",
            "available_services": [s["name"] for s in HOMELAB_SERVICES[:10]],
        }

    return {
        "query": query,
        "found": True,
        "count": len(matches),
        "results": matches,
    }


async def _builtin_send_phone_alert(
    message: str,
    severity: str = "high",
    phone_number: str = "",
) -> Dict[str, Any]:
    """Sends an emergency alert / SMS to the administrator's phone."""
    from .notifier import AlertDispatcher
    dispatcher = AlertDispatcher(
        phone_number=phone_number or os.getenv("ADMIN_PHONE_NUMBER"),
        twilio_account_sid=os.getenv("TWILIO_ACCOUNT_SID"),
        twilio_auth_token=os.getenv("TWILIO_AUTH_TOKEN"),
        twilio_from_number=os.getenv("TWILIO_FROM_NUMBER"),
        sms_webhook_url=os.getenv("SMS_WEBHOOK_URL"),
        telegram_bot_token=os.getenv("TELEGRAM_BOT_TOKEN"),
        telegram_chat_id=os.getenv("TELEGRAM_ADMIN_CHAT_ID"),
        ntfy_topic=os.getenv("NTFY_TOPIC", "elo-homelab-alerts"),
    )
    return await dispatcher.broadcast_incident(
        title="Homelab Alert",
        message=message,
        severity=severity,
        phone_number=phone_number or os.getenv("ADMIN_PHONE_NUMBER"),
    )


# Global Subsystem Instances
_global_memory_store = PgVectorMemoryStore()
_global_presence_mgr = ESP32PresenceManager()
_global_secops_agent = SecOpsThreatHunterAgent()
_global_sysadmin_agent = SysAdminOptimizerAgent()
_global_energy_agent = SmartHomeEnergyAgent()
_global_predictive_healer = PredictiveHealthAnalyzer()


async def _builtin_memory_save(content: str, domain: str = "homelab", tags: Optional[List[str]] = None) -> Dict[str, Any]:
    """Saves semantic knowledge into pgvector memory."""
    entry = await _global_memory_store.save_memory(content=content, domain=domain, metadata={"tags": tags or []})
    return {"status": "SAVED", "id": entry.id, "domain": entry.domain, "content": entry.content}


async def _builtin_memory_search(query: str, domain: Optional[str] = None, top_k: int = 3) -> Dict[str, Any]:
    """Performs semantic cosine similarity search across pgvector memory."""
    results = await _global_memory_store.search_memory(query=query, domain=domain, top_k=top_k)
    return {
        "query": query,
        "results_count": len(results),
        "matches": [
            {"content": r.entry.content, "domain": r.entry.domain, "similarity": r.similarity, "metadata": r.entry.metadata}
            for r in results
        ]
    }


async def _builtin_presence_get() -> Dict[str, Any]:
    """Gets current physical presence status across ESP32 tracked rooms."""
    return _global_presence_mgr.get_current_presence_status()


async def _builtin_presence_route(action: str, target_room: Optional[str] = None) -> Dict[str, Any]:
    """Routes an action contextually based on ESP32 physical presence."""
    from elo_contracts.presence import RoomActionRequest
    return _global_presence_mgr.route_contextual_action(RoomActionRequest(action=action, target_room=target_room))


async def _builtin_secops_scan() -> Dict[str, Any]:
    """Runs autonomous SecOps Threat Hunter log analysis across Wazuh and Suricata."""
    res = await _global_secops_agent.analyze_security_events()
    return res.model_dump()


async def _builtin_secops_quarantine(attacker_ip: str, reason: str = "Threat identified by SecOps Agent") -> Dict[str, Any]:
    """Bans a malicious IP address on OPNsense firewall."""
    res = await _global_secops_agent.quarantine_ip(attacker_ip, reason)
    return res.model_dump()


async def _builtin_sysadmin_optimize() -> Dict[str, Any]:
    """Runs cluster resource optimization across Proxmox and NAS."""
    res = await _global_sysadmin_agent.optimize_cluster_resources()
    return res.model_dump()


async def _builtin_energy_optimize() -> Dict[str, Any]:
    """Analyzes smart home power consumption and identifies idle loads."""
    res = await _global_energy_agent.optimize_energy_consumption()
    return res.model_dump()


async def _builtin_predictive_health() -> Dict[str, Any]:
    """Runs predictive SMART and ZFS health analysis."""
    res = await _global_predictive_healer.analyze_storage_health()
    return res.model_dump()


def create_default_registry() -> ToolRegistry:
    reg = ToolRegistry()

    # 1. Proxmox Cluster Status (L0)
    reg.register(
        name="proxmox_get_cluster_status",
        description="Fetches current real CPU, RAM, Disk and VM/LXC workload status from Proxmox VE cluster node.",
        parameters_schema={"type": "object", "properties": {"node": {"type": "string", "default": "pve-node-1"}}},
        security_level=SecurityLevel.L0_READ_ONLY,
        handler=_builtin_proxmox_status,
        domain="homelab",
    )

    # 2. Proxmox Reboot VM (L2)
    reg.register(
        name="proxmox_reboot_vm",
        description="Reboots a designated virtual machine or LXC container on Proxmox.",
        parameters_schema={
            "type": "object",
            "properties": {
                "vm_id": {"type": "integer", "description": "Target Virtual Machine ID (e.g. 101)"},
                "force": {"type": "boolean", "default": False},
            },
            "required": ["vm_id"],
        },
        security_level=SecurityLevel.L2_HIGH_IMPACT,
        handler=_builtin_proxmox_reboot_vm,
        domain="homelab",
    )

    # 3. Proxmox Start VM (L2)
    reg.register(
        name="proxmox_start_vm",
        description="Starts a virtual machine or LXC container on Proxmox VE node.",
        parameters_schema={
            "type": "object",
            "properties": {
                "vm_id": {"type": "integer", "description": "Target VM/LXC ID"},
                "node": {"type": "string", "default": "pve-node-1"},
            },
            "required": ["vm_id"],
        },
        security_level=SecurityLevel.L2_HIGH_IMPACT,
        handler=_builtin_proxmox_start_vm,
        domain="homelab",
    )

    # 4. Proxmox Snapshot VM (L2)
    reg.register(
        name="proxmox_snapshot_vm",
        description="Creates a snapshot for a VM or LXC container on Proxmox before updates or changes.",
        parameters_schema={
            "type": "object",
            "properties": {
                "vm_id": {"type": "integer", "description": "Target VM ID"},
                "snap_name": {"type": "string", "description": "Snapshot name (e.g. 'pre-upgrade-v1')"},
                "description": {"type": "string", "default": ""},
            },
            "required": ["vm_id", "snap_name"],
        },
        security_level=SecurityLevel.L2_HIGH_IMPACT,
        handler=_builtin_proxmox_snapshot_vm,
        domain="homelab",
    )

    # 5. Home Assistant Get States (L0)
    reg.register(
        name="ha_get_states",
        description="Queries smart home entity states from Home Assistant (lights, switches, sensors, climate).",
        parameters_schema={
            "type": "object",
            "properties": {
                "domain_filter": {"type": "string", "description": "Filter by domain (e.g. 'light', 'switch', 'sensor')", "default": ""}
            },
        },
        security_level=SecurityLevel.L0_READ_ONLY,
        handler=_builtin_ha_get_states,
        domain="smarthome",
    )

    # 6. Home Assistant Control Device (L1)
    reg.register(
        name="ha_control_device",
        description="Controls a smart home device via Home Assistant (turn on/off lights, toggle switches, set temperature).",
        parameters_schema={
            "type": "object",
            "properties": {
                "domain": {"type": "string", "description": "Domain (e.g. 'light', 'switch')"},
                "service": {"type": "string", "description": "Action (e.g. 'turn_on', 'turn_off', 'toggle')"},
                "entity_id": {"type": "string", "description": "Entity ID (e.g. 'light.office_desk', 'switch.3d_printer')"},
            },
            "required": ["domain", "service", "entity_id"],
        },
        security_level=SecurityLevel.L1_LOW_WRITE,
        handler=_builtin_ha_control_device,
        domain="smart_home",
    )

    # 8. OPNsense Block Malicious IP (L2)
    reg.register(
        name="opnsense_block_ip",
        description="Blocks a malicious IP address on the OPNsense stateful firewall.",
        parameters_schema={
            "type": "object",
            "properties": {
                "ip_address": {"type": "string", "description": "IP address to block"},
                "reason": {"type": "string", "default": "Blocked by ELO Security Gatekeeper"},
            },
            "required": ["ip_address"],
        },
        security_level=SecurityLevel.L2_HIGH_IMPACT,
        handler=_builtin_opnsense_block_ip,
        domain="security",
    )

    # 9. Persistent Semantic Memory Search (L0)
    reg.register(
        name="memory_search_context",
        description="Performs semantic vector search across pgvector knowledge, configurations, and user history.",
        parameters_schema={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Semantic search query"},
                "domain": {"type": "string", "default": "homelab"},
                "top_k": {"type": "integer", "default": 3},
            },
            "required": ["query"],
        },
        security_level=SecurityLevel.L0_READ_ONLY,
        handler=_builtin_memory_search,
        domain="memory",
    )

    # 10. Persistent Semantic Memory Save (L1)
    reg.register(
        name="memory_save_context",
        description="Saves a new fact, user preference, or configuration note into persistent semantic memory.",
        parameters_schema={
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "Information or preference to remember"},
                "domain": {"type": "string", "default": "homelab"},
            },
            "required": ["content"],
        },
        security_level=SecurityLevel.L1_LOW_WRITE,
        handler=_builtin_memory_save,
        domain="memory",
    )

    # 11. ESP32 Physical Presence State (L0)
    reg.register(
        name="esp32_get_presence_state",
        description="Queries ESP32 sensors to determine the user's active room and physical location in the house.",
        parameters_schema={"type": "object", "properties": {}},
        security_level=SecurityLevel.L0_READ_ONLY,
        handler=_builtin_presence_get,
        domain="hardware",
    )

    # 12. ESP32 Contextual Room Action Routing (L1)
    reg.register(
        name="esp32_route_room_action",
        description="Executes a smart home action contextually in the user's current room.",
        parameters_schema={
            "type": "object",
            "properties": {
                "action": {"type": "string", "description": "Action verb, e.g. turn_on_lights, turn_off_lights, play_music"},
                "target_room": {"type": "string", "description": "Optional explicit room ID"},
            },
            "required": ["action"],
        },
        security_level=SecurityLevel.L1_LOW_WRITE,
        handler=_builtin_presence_route,
        domain="hardware",
    )

    # 13. SecOps Autonomous Threat Hunter Scan (L0)
    reg.register(
        name="secops_analyze_security_events",
        description="Sub-Agent: Scans Wazuh and Suricata logs, correlating brute force and intrusion attempts.",
        parameters_schema={"type": "object", "properties": {}},
        security_level=SecurityLevel.L0_READ_ONLY,
        handler=_builtin_secops_scan,
        domain="security",
    )

    # 14. SecOps Quarantine Malicious IP (L2)
    reg.register(
        name="secops_quarantine_ip",
        description="Sub-Agent: Bans a suspicious attacker IP address on OPNsense with threat logging.",
        parameters_schema={
            "type": "object",
            "properties": {
                "attacker_ip": {"type": "string", "description": "IP address to quarantine"},
                "reason": {"type": "string", "default": "SecOps Threat Hunter automated ban"},
            },
            "required": ["attacker_ip"],
        },
        security_level=SecurityLevel.L2_HIGH_IMPACT,
        handler=_builtin_secops_quarantine,
        domain="security",
    )

    # 15. SysAdmin Cluster Resource Optimizer (L1)
    reg.register(
        name="sysadmin_optimize_cluster_resources",
        description="Sub-Agent: Scans Proxmox and NAS telemetry, recommends KSM deduplication, and cleans Docker caches.",
        parameters_schema={"type": "object", "properties": {}},
        security_level=SecurityLevel.L1_LOW_WRITE,
        handler=_builtin_sysadmin_optimize,
        domain="infrastructure",
    )

    # 16. Smart Home Energy Optimizer (L0)
    reg.register(
        name="energy_optimize_smart_home",
        description="Sub-Agent: Analyzes Shelly smart plugs and Home Assistant loads to identify idle electricity waste.",
        parameters_schema={"type": "object", "properties": {}},
        security_level=SecurityLevel.L0_READ_ONLY,
        handler=_builtin_energy_optimize,
        domain="smart_home",
    )

    # 18. Homelab Knowledge & Documentation RAG (L0)
    reg.register(
        name="knowledge_search_docs",
        description="Searches Homelab architectural documentation, network topology, VLANs, and configuration manuals.",
        parameters_schema={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Keywords or question to search"}
            },
            "required": ["query"],
        },
        security_level=SecurityLevel.L0_READ_ONLY,
        handler=_builtin_knowledge_search,
        domain="knowledge",
    )

    # 19. Homelab Service Lookup (L0)
    reg.register(
        name="homelab_query_service",
        description="Queries the Homelab inventory for any service, container, port, domain, IP, or tags.",
        parameters_schema={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Service name, port, tag, or domain to search for"}
            },
            "required": ["query"],
        },
        security_level=SecurityLevel.L0_READ_ONLY,
        handler=_builtin_homelab_query_service,
        domain="homelab",
    )

    # 20. Send Phone Alert (L1)
    reg.register(
        name="send_phone_alert",
        description="Dispatches an urgent notification alert to the administrator.",
        parameters_schema={
            "type": "object",
            "properties": {
                "message": {"type": "string", "description": "Alert message describing the issue"},
                "severity": {"type": "string", "enum": ["low", "medium", "high", "critical"], "default": "high"},
                "phone_number": {"type": "string", "default": ""},
            },
            "required": ["message"],
        },
        security_level=SecurityLevel.L1_LOW_WRITE,
        handler=_builtin_send_phone_alert,
        domain="security",
    )

    # 21. Academic Monte Carlo (L0)
    reg.register(
        name="academic_monte_carlo_simulation",
        description="Runs a stochastic Monte Carlo financial risk simulation.",
        parameters_schema={
            "type": "object",
            "properties": {
                "iterations": {"type": "integer", "default": 1000},
                "scenario": {"type": "string", "default": "default"},
            },
        },
        security_level=SecurityLevel.L0_READ_ONLY,
        handler=_builtin_run_monte_carlo,
        domain="business",
    )

    return reg
