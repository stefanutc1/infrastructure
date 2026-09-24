from __future__ import annotations
import httpx
import logging
from typing import List, Dict, Any, Optional
from .base import BaseLLMClient, ChatMessage, LLMResponse, ToolCall

logger = logging.getLogger("elo.ai.groq")


class GroqClient(BaseLLMClient):
    """
    Groq High-Speed LPU Cloud Client (Free Tier).
    Supports models like llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "llama-3.3-70b-versatile",
        base_url: str = "https://api.groq.com/openai/v1",
        timeout: float = 30.0,
    ):
        self.api_key = api_key or ""
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    async def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        if not self.api_key:
            raise ValueError("Groq API key is not configured.")

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        formatted_messages = []
        for m in messages:
            msg_dict: Dict[str, Any] = {"role": m.role.value, "content": m.content or ""}
            if m.tool_call_id:
                msg_dict["tool_call_id"] = m.tool_call_id
            if m.tool_calls:
                msg_dict["tool_calls"] = [
                    {
                        "id": tc.call_id,
                        "type": "function",
                        "function": {"name": tc.name, "arguments": tc.arguments},
                    }
                    for tc in m.tool_calls
                ]
            formatted_messages.append(msg_dict)

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": formatted_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if tools:
            payload["tools"] = [
                {
                    "type": "function",
                    "function": {
                        "name": t.get("name"),
                        "description": t.get("description", ""),
                        "parameters": t.get("parameters_schema", {}),
                    },
                }
                for t in tools
            ]
            payload["tool_choice"] = "auto"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                error_body = resp.text
                logger.error(f"[GROQ ERROR] Status {resp.status_code}: {error_body}")
                raise RuntimeError(f"Groq API error (HTTP {resp.status_code}): {error_body}")

            data = resp.json()
            choice = data["choices"][0]["message"]
            content = choice.get("content") or ""

            tool_calls = []
            if "tool_calls" in choice and choice["tool_calls"]:
                for raw_tc in choice["tool_calls"]:
                    fn = raw_tc["function"]
                    tool_calls.append(
                        ToolCall(
                            call_id=raw_tc["id"],
                            name=fn["name"],
                            arguments=fn["arguments"],
                        )
                    )

            usage = data.get("usage", {})
            return LLMResponse(
                content=content,
                tool_calls=tool_calls,
                model_used=f"groq/{self.model}",
                prompt_tokens=usage.get("prompt_tokens", 0),
                completion_tokens=usage.get("completion_tokens", 0),
                raw_response=data,
            )

    async def health_check(self) -> bool:
        if not self.api_key:
            return False
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{self.base_url}/models",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                )
                return res.status_code == 200
        except Exception:
            return False
