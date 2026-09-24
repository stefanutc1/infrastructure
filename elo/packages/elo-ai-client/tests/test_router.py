import pytest
from elo_ai_client.base import ChatMessage, Role, LLMResponse, ToolCall
from elo_ai_client.mock_client import MockLLMClient
from elo_ai_client.router import HybridRouter


@pytest.mark.asyncio
async def test_mock_client_chat():
    client = MockLLMClient()
    messages = [ChatMessage(role=Role.USER, content="Hello ELO")]
    resp = await client.chat(messages)

    assert resp.model_used == "elo-hybrid-core"
    assert resp.provider == "elo_brain"
    assert "ELO" in (resp.content or "")


@pytest.mark.asyncio
async def test_hybrid_router_primary_success():
    primary = MockLLMClient()
    fallback = MockLLMClient()
    router = HybridRouter(primary_client=primary, fallback_client=fallback)

    messages = [ChatMessage(role=Role.USER, content="Check server status")]
    resp = await router.chat(messages)

    assert resp.provider == "elo_brain"
    assert len(resp.tool_calls) == 1
    assert resp.tool_calls[0].name == "proxmox_get_cluster_status"


@pytest.mark.asyncio
async def test_hybrid_router_fallback_on_failure():
    primary = MockLLMClient()
    primary.is_healthy = False  # Simulates primary provider crash

    fallback_response = LLMResponse(
        content="Response from Cloud Fallback Provider",
        tool_calls=[],
        model_used="gemini-fallback",
        provider="cloud_gemini",
    )
    fallback = MockLLMClient(predefined_responses=[fallback_response])
    router = HybridRouter(primary_client=primary, fallback_client=fallback)

    messages = [ChatMessage(role=Role.USER, content="Important complex calculation")]
    resp = await router.chat(messages)

    assert resp.provider == "cloud_gemini"
    assert resp.content == "Response from Cloud Fallback Provider"


@pytest.mark.asyncio
async def test_cascade_router_out_of_credits_instant_failover():
    class FailingQuotaClient(MockLLMClient):
        async def chat(self, messages, tools=None, temperature=0.2, max_tokens=2048):
            raise RuntimeError("HTTP 429: ResourceExhausted - You have exceeded your current quota or credit balance is zero.")

    tier1 = FailingQuotaClient()
    tier2 = MockLLMClient(predefined_responses=[
        LLMResponse(
            content="Instant Failover Response from Tier 2 OpenRouter",
            tool_calls=[],
            model_used="openai/gpt-4o-mini",
            provider="openrouter",
        )
    ])

    from elo_ai_client.router import CascadeRouter
    router = CascadeRouter(providers=[tier1, tier2], cooldown_seconds=60)

    # 1. First call: Tier 1 fails with quota -> instantly cascades to Tier 2 and puts Tier 1 on cooldown
    resp1 = await router.chat([ChatMessage(role=Role.USER, content="Test message 1")])
    assert resp1.provider == "openrouter"
    assert resp1.content == "Instant Failover Response from Tier 2 OpenRouter"

    # 2. Second call: Tier 1 is skipped in 0ms due to active cooldown, directly hitting Tier 2 (Mock fallback)
    resp2 = await router.chat([ChatMessage(role=Role.USER, content="Test message 2")])
    assert resp2.model_used == "elo-hybrid-core"

