from __future__ import annotations
import os
import pathlib
import uvicorn
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from elo_contracts.security import ApprovalDecision
from elo_security.gatekeeper import SecurityGatekeeper
from elo_ai_client.mock_client import MockLLMClient
from elo_ai_client.local_client import LocalOllamaClient
from elo_ai_client.cloud_client import CloudGeminiClient
from elo_ai_client.groq_client import GroqClient
from elo_ai_client.openrouter_client import OpenRouterClient
from elo_ai_client.router import HybridRouter, CascadeRouter
from .config import config
from .registry import create_default_registry
from .audit import AuditLogger
from .engine import ELOEngine
from .bot.telegram_bot import TelegramBotNotifier

# Dependency singletons
gatekeeper = SecurityGatekeeper(
    secret_key=config.secret_key,
    default_timeout_seconds=config.approval_timeout_seconds,
)
telegram_bot = TelegramBotNotifier(
    bot_token=config.telegram_bot_token,
    admin_chat_id=config.telegram_admin_chat_id,
    gatekeeper=gatekeeper,
)
gatekeeper.notifier_callback = telegram_bot.notify_approval_required

audit_logger = AuditLogger()
tool_registry = create_default_registry()


def build_llm_router(
    primary_prov: Optional[str] = None,
    gemini_key: Optional[str] = None,
    gemini_mdl: Optional[str] = None,
    groq_key: Optional[str] = None,
    groq_mdl: Optional[str] = None,
    openrouter_key: Optional[str] = None,
    openrouter_mdl: Optional[str] = None,
    ollama_url: Optional[str] = None,
    ollama_mdl: Optional[str] = None,
) -> CascadeRouter:
    prov = primary_prov or config.primary_provider
    g_key = gemini_key if gemini_key is not None else config.gemini_api_key
    g_mdl = gemini_mdl or config.gemini_model
    grq_key = groq_key if groq_key is not None else config.groq_api_key
    grq_mdl = groq_mdl or config.groq_model
    or_key = openrouter_key if openrouter_key is not None else config.openrouter_api_key
    or_mdl = openrouter_mdl or config.openrouter_model
    o_url = ollama_url or config.local_llm_base_url
    o_mdl = ollama_mdl or config.local_llm_model

    providers = []

    # Priority 1: Gemini (Generous free tier)
    if g_key:
        providers.append(CloudGeminiClient(api_key=g_key, model=g_mdl))

    # Priority 2: Groq LPU (Ultra-fast free tier)
    if grq_key:
        providers.append(GroqClient(api_key=grq_key, model=grq_mdl))

    # Priority 3: OpenRouter Universal Hub (Free tier models pool)
    if or_key:
        providers.append(OpenRouterClient(api_key=or_key, model=or_mdl))

    # Priority 4: Local Ollama (Self-hosted on Apple Silicon Metal MPS)
    if prov == "local_ollama" or config.fallback_provider == "local_ollama" or o_url:
        providers.append(LocalOllamaClient(base_url=o_url, model=o_mdl))

    # Priority 5: Deterministic Mock fallback (failsafe)
    providers.append(MockLLMClient())

    return CascadeRouter(providers=providers)


llm_router = build_llm_router()
engine = ELOEngine(
    llm_router=llm_router,
    tool_registry=tool_registry,
    gatekeeper=gatekeeper,
    audit_logger=audit_logger,
)


def update_engine_llm(
    primary_prov: Optional[str] = None,
    gemini_key: Optional[str] = None,
    gemini_mdl: Optional[str] = None,
    groq_key: Optional[str] = None,
    groq_mdl: Optional[str] = None,
    openrouter_key: Optional[str] = None,
    openrouter_mdl: Optional[str] = None,
    ollama_url: Optional[str] = None,
    ollama_mdl: Optional[str] = None,
):
    global llm_router, engine
    if gemini_key is not None:
        config.gemini_api_key = gemini_key
    if gemini_mdl:
        config.gemini_model = gemini_mdl
    if groq_key is not None:
        config.groq_api_key = groq_key
    if groq_mdl:
        config.groq_model = groq_mdl
    if openrouter_key is not None:
        config.openrouter_api_key = openrouter_key
    if openrouter_mdl:
        config.openrouter_model = openrouter_mdl
    if ollama_url:
        config.local_llm_base_url = ollama_url
    if ollama_mdl:
        config.local_llm_model = ollama_mdl
    if primary_prov:
        config.primary_provider = primary_prov

    llm_router = build_llm_router(
        primary_prov=primary_prov,
        gemini_key=gemini_key,
        gemini_mdl=gemini_mdl,
        groq_key=groq_key,
        groq_mdl=groq_mdl,
        openrouter_key=openrouter_key,
        openrouter_mdl=openrouter_mdl,
        ollama_url=ollama_url,
        ollama_mdl=ollama_mdl,
    )
    engine.llm = llm_router
    return llm_router


from .watchdog import SelfHealingWatchdog

# Watchdog singleton
watchdog = SelfHealingWatchdog(check_interval=30.0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await watchdog.start()
    yield
    # Shutdown
    await watchdog.stop()


STATIC_DIR = pathlib.Path(__file__).parent / "static"

app = FastAPI(
    title="ELO — AI Operating Layer & Orchestrator",
    version="0.1.0",
    description="Autonomous control plane for Homelab, Business ERP, and SaaS integration.",
    lifespan=lifespan,
)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
async def root():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "ELO Core API Online. Navigate to /docs for API schema."}


# Request/Response Schemas
class ChatRequest(BaseModel):
    message: str
    actor: str = Field(default="user")
    auto_wait_for_approval: bool = Field(default=False)


class ApprovalResolutionRequest(BaseModel):
    approved: bool
    actor: str = Field(default="admin")
    challenge_token: Optional[str] = None
    reason: Optional[str] = None


from .telemetry import get_real_system_telemetry


@app.get("/health")
async def health():
    llm_healthy = await llm_router.health_check()
    return {
        "status": "ONLINE",
        "system": "ELO Core",
        "env": config.env,
        "llm_status": "HEALTHY" if llm_healthy else "DEGRADED",
    }


class LLMConfigRequest(BaseModel):
    provider: Optional[str] = Field(None, description="cascade, cloud_gemini, groq, openrouter, local_ollama, mock")
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    groq_api_key: Optional[str] = None
    groq_model: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    openrouter_model: Optional[str] = None
    local_llm_base_url: Optional[str] = None
    local_llm_model: Optional[str] = None


@app.get("/v1/llm/status")
async def get_llm_status():
    is_healthy = await llm_router.health_check()
    
    # Active cascade tier info
    configured_cascade = []
    if config.gemini_api_key:
        configured_cascade.append(f"Gemini ({config.gemini_model})")
    if config.groq_api_key:
        configured_cascade.append(f"Groq ({config.groq_model})")
    if config.openrouter_api_key:
        configured_cascade.append(f"OpenRouter ({config.openrouter_model})")
    if config.local_llm_base_url and config.primary_provider == "local_ollama":
        configured_cascade.append(f"Ollama ({config.local_llm_model})")
    configured_cascade.append("Mock (Failsafe)")

    return {
        "active_provider": config.primary_provider,
        "is_healthy": is_healthy,
        "cascade_chain": " -> ".join(configured_cascade),
        "gemini_configured": bool(config.gemini_api_key),
        "gemini_model": config.gemini_model,
        "groq_configured": bool(config.groq_api_key),
        "groq_model": config.groq_model,
        "openrouter_configured": bool(config.openrouter_api_key),
        "openrouter_model": config.openrouter_model,
        "local_ollama_url": config.local_llm_base_url,
        "local_ollama_model": config.local_llm_model,
    }


@app.post("/v1/llm/config")
async def set_llm_config(req: LLMConfigRequest):
    update_engine_llm(
        primary_prov=req.provider,
        gemini_key=req.gemini_api_key,
        gemini_mdl=req.gemini_model,
        groq_key=req.groq_api_key,
        groq_mdl=req.groq_model,
        openrouter_key=req.openrouter_api_key,
        openrouter_mdl=req.openrouter_model,
        ollama_url=req.local_llm_base_url,
        ollama_mdl=req.local_llm_model,
    )
    is_healthy = await llm_router.health_check()
    return {
        "status": "CONFIG_UPDATED",
        "provider": config.primary_provider,
        "is_healthy": is_healthy,
        "gemini_configured": bool(config.gemini_api_key),
        "groq_configured": bool(config.groq_api_key),
        "openrouter_configured": bool(config.openrouter_api_key),
    }


from .telemetry import get_real_system_telemetry_async


@app.get("/v1/telemetry")
async def get_telemetry():
    return await get_real_system_telemetry_async()


@app.post("/v1/chat")
async def chat_endpoint(req: ChatRequest):
    result = await engine.process_user_message(
        user_text=req.message,
        actor=req.actor,
        auto_wait_for_approval=req.auto_wait_for_approval,
    )
    return result


@app.get("/v1/tools")
async def list_tools():
    return {"tools": tool_registry.get_definitions()}


@app.get("/v1/approvals")
async def list_pending_approvals():
    return {"pending_approvals": gatekeeper.get_pending_requests()}


@app.post("/v1/approvals/{request_id}/resolve")
async def resolve_approval(request_id: str, req: ApprovalResolutionRequest):
    decision = ApprovalDecision(
        request_id=request_id,
        approved=req.approved,
        actor=req.actor,
        challenge_token=req.challenge_token,
        reason=req.reason,
    )
    success, cap_token = gatekeeper.resolve_request(decision)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Failed to resolve ticket. Either invalid ID, already resolved, or expired.",
        )
    return {
        "request_id": request_id,
        "status": "APPROVED" if req.approved else "REJECTED",
        "capability_token": cap_token,
    }


@app.get("/v1/audit")
async def list_audit_logs(limit: int = 50):
    return {"audit_logs": audit_logger.get_recent_logs(limit=limit)}


@app.get("/v1/proxmox/status")
async def get_proxmox_status():
    from .proxmox_client import ProxmoxClient
    pve = ProxmoxClient(host=os.getenv("PROXMOX_NODE_IP", "192.168.10.2"))
    return await pve.get_cluster_status()


@app.get("/v1/homeassistant/states")
async def get_homeassistant_states(domain: Optional[str] = None):
    from .homeassistant_client import HomeAssistantClient
    hass = HomeAssistantClient(
        base_url=f"http://{os.getenv('HASS_NODE_IP', '192.168.20.10')}:8123",
        access_token=os.getenv("HASS_TOKEN"),
    )
    return await hass.get_states(entity_filter=domain)


@app.get("/v1/opnsense/status")
async def get_opnsense_status():
    from .opnsense_client import OPNsenseClient
    opn = OPNsenseClient(host=os.getenv("OPNSENSE_NODE_IP", "192.168.10.1"))
    return await opn.get_gateway_status()


@app.get("/v1/watchdog/status")
async def get_watchdog_status():
    return {
        "is_running": watchdog.is_running,
        "interval_seconds": watchdog.check_interval,
        "last_states": watchdog._last_node_states,
    }


# -------------------------------------------------------------
# Phase 3-6: Advanced Hardware, Memory, Swarm & Voice Endpoints
# -------------------------------------------------------------

@app.post("/v1/presence/update")
async def receive_esp32_presence(update: Dict[str, Any]):
    from elo_contracts.presence import ESP32PresenceUpdate
    from .registry import _global_presence_mgr
    parsed = ESP32PresenceUpdate(**update)
    return _global_presence_mgr.process_presence_update(parsed)


@app.get("/v1/presence")
async def get_presence_state():
    from .registry import _global_presence_mgr
    return _global_presence_mgr.get_current_presence_status()


@app.post("/v1/presence/route")
async def route_presence_action(req: Dict[str, Any]):
    from elo_contracts.presence import RoomActionRequest
    from .registry import _global_presence_mgr
    parsed = RoomActionRequest(**req)
    return _global_presence_mgr.route_contextual_action(parsed)


@app.post("/v1/memory/search")
async def search_semantic_memory(query: str, domain: Optional[str] = None, top_k: int = 3):
    from .registry import _global_memory_store
    results = await _global_memory_store.search_memory(query=query, domain=domain, top_k=top_k)
    return {
        "query": query,
        "results_count": len(results),
        "matches": [
            {"content": r.entry.content, "domain": r.entry.domain, "similarity": r.similarity, "metadata": r.entry.metadata}
            for r in results
]
    }


@app.post("/v1/memory/save")
async def save_semantic_memory(content: str, domain: str = "homelab", metadata: Optional[Dict[str, Any]] = None):
    from .registry import _global_memory_store
    entry = await _global_memory_store.save_memory(content=content, domain=domain, metadata=metadata)
    return {"status": "SAVED", "id": entry.id, "domain": entry.domain, "content": entry.content}


@app.post("/v1/agents/execute")
async def execute_subagent_task(role: str, action: str = "default", parameters: Optional[Dict[str, Any]] = None):
    from elo_contracts.agents import AgentRole, SubAgentTask
    from .registry import (
        _global_secops_agent,
        _global_sysadmin_agent,
        _global_energy_agent,
        _global_predictive_healer,
    )
    task = SubAgentTask(
        task_id=f"TASK-REQ-{os.urandom(3).hex()}",
        role=AgentRole(role),
        objective=f"Execute {action}",
        parameters={"action": action, **(parameters or {})},
    )

    if task.role == AgentRole.SECOPS_HUNTER:
        res = await _global_secops_agent.execute_task(task)
    elif task.role == AgentRole.SYSADMIN_OPTIMIZER:
        res = await _global_sysadmin_agent.execute_task(task)
    elif task.role == AgentRole.SMART_HOME_ENERGY:
        res = await _global_energy_agent.execute_task(task)
    elif task.role == AgentRole.PREDICTIVE_HEALER:
        res = await _global_predictive_healer.analyze_storage_health()
    else:
        raise HTTPException(status_code=400, detail=f"Unknown agent role '{role}'")

    return res.model_dump()


@app.get("/v1/voice/status")
async def get_offline_voice_status():
    from elo_ai_client.offline_engine import OfflineVoiceEngine
    engine_offline = OfflineVoiceEngine()
    return engine_offline.get_engine_status()


if __name__ == "__main__":
    uvicorn.run(app, host=config.host, port=config.port)

