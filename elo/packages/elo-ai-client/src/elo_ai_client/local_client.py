from __future__ import annotations
import time
import httpx
import json
from typing import List, Dict, Any, Optional
from .base import BaseLLMClient, ChatMessage, LLMResponse, ToolCall, Role


class LocalOllamaClient(BaseLLMClient):
    """
    Client for local LLMs running on Ollama or vLLM (OpenAI-compatible / Ollama API).
    """

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.1:8b", timeout: float = 30.0):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    async def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        start_time = time.perf_counter()
        
        # Prepare OpenAI-compatible chat completion payload
        formatted_messages = []
        for m in messages:
            msg_dict: Dict[str, Any] = {"role": m.role.value}
            if m.content:
                msg_dict["content"] = m.content
            if m.tool_calls:
                msg_dict["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {"name": tc.name, "arguments": json.dumps(tc.arguments)},
                    }
                    for tc in m.tool_calls
                ]
            if m.tool_call_id:
                msg_dict["tool_call_id"] = m.tool_call_id
            if m.name:
                msg_dict["name"] = m.name
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
                        "description": t.get("description"),
                        "parameters": t.get("parameters_schema") or t.get("parameters"),
                    },
                }
                for t in tools
            ]

        endpoint = f"{self.base_url}/v1/chat/completions"
        timeout_cfg = httpx.Timeout(self.timeout, connect=1.0)
        async with httpx.AsyncClient(timeout=timeout_cfg) as client:
            resp = await client.post(endpoint, json=payload)
            resp.raise_for_status()
            data = resp.json()

        choice = data["choices"][0]["message"]
        content = choice.get("content")
        raw_tool_calls = choice.get("tool_calls", [])

        parsed_tool_calls: List[ToolCall] = []
        for tc in raw_tool_calls:
            fn = tc.get("function", {})
            args = fn.get("arguments", "{}")
            if isinstance(args, str):
                try:
                    args = json.loads(args)
                except Exception:
                    args = {}
            parsed_tool_calls.append(
                ToolCall(
                    id=tc.get("id", f"call_{int(time.time()*1000)}"),
                    name=fn.get("name", "unknown_tool"),
                    arguments=args,
                )
            )

        usage = data.get("usage", {})
        return LLMResponse(
            content=content,
            tool_calls=parsed_tool_calls,
            model_used=self.model,
            provider="local_ollama",
            prompt_tokens=usage.get("prompt_tokens", 0),
            completion_tokens=usage.get("completion_tokens", 0),
            usage=usage,
            latency_ms=round((time.perf_counter() - start_time) * 1000, 2),
            finish_reason=choice.get("finish_reason", "stop"),
        )

    async def health_check(self) -> bool:
        try:
            timeout_cfg = httpx.Timeout(2.0, connect=0.5)
            async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                return resp.status_code == 200
        except Exception:
            return False
