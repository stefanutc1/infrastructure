import pytest
from elo_ai_client.openrouter_client import OpenRouterClient
from elo_ai_client.base import ChatMessage, Role


@pytest.mark.asyncio
async def test_openrouter_client_instantiation():
    client = OpenRouterClient(
        api_key="sk-or-v1-test-fake-key",
        model="openai/gpt-4o-mini"
    )
    assert client.api_key == "sk-or-v1-test-fake-key"
    assert client.model == "openai/gpt-4o-mini"
