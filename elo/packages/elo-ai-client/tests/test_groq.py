import pytest
from elo_ai_client.groq_client import GroqClient
from elo_ai_client.base import ChatMessage, Role


def test_groq_client_instantiation():
    client = GroqClient(api_key="gsk_test_mock_token_12345", model="llama-3.3-70b-versatile")
    assert client.api_key == "gsk_test_mock_token_12345"
    assert client.model == "llama-3.3-70b-versatile"
    assert client.base_url == "https://api.groq.com/openai/v1"


@pytest.mark.asyncio
async def test_groq_client_missing_key():
    client = GroqClient(api_key="")
    with pytest.raises(ValueError, match="Groq API key is not configured"):
        await client.chat([ChatMessage(role=Role.USER, content="Hello")])
