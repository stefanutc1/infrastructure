from __future__ import annotations
import time
import httpx
import json
import logging
from typing import List, Dict, Any, Optional
from .base import BaseLLMClient, ChatMessage, LLMResponse, ToolCall, Role

logger = logging.getLogger("elo.ai.openrouter")


class OpenRouterClient(BaseLLMClient):
    """
    OpenRouter.ai Client providing unified access to 200+ models
    (Claude 3.5 Sonnet, GPT-4o, DeepSeek R1/V3, Llama 3.3, Gemini 2.0 Flash)
    with native tool calling support.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "openai/gpt-4o-mini",
        timeout: float = 35.0,
        site_url: str = "https://elo.local",
        site_name: str = "ELO AI Operating Layer",
    ):
        self.api_key = api_key.strip() if api_key else ""
        self.model = model.strip() if model else "openai/gpt-4o-mini"
        self.timeout = timeout
        self.site_url = site_url
        self.site_name = site_name

    async def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        start_time = time.perf_counter()

        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured.")

        # Convert messages to standard chat format
        formatted_messages = []
        for m in messages:
            msg_dict: Dict[str, Any] = {"role": m.role.value}
            
            if m.content is not None:
                msg_dict["content"] = m.content

            if m.tool_calls:
                msg_dict["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.name,
                            "arguments": json.dumps(tc.arguments) if isinstance(tc.arguments, dict) else str(tc.arguments),
                        },
                    }
                    for tc in m.tool_calls
                ]

            if m.role == Role.TOOL:
                msg_dict["tool_call_id"] = m.tool_call_id or (m.name if m.name else "call_unknown")
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
                        "description": t.get("description", ""),
                        "parameters": t.get("parameters_schema") or t.get("parameters") or {},
                    },
                }
                for t in tools
            ]

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": self.site_url,
            "X-Title": self.site_name,
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)
            if resp.status_code != 200:
                err_body = resp.text
                logger.error(f"OpenRouter API Error ({resp.status_code}): {err_body}")
                raise RuntimeError(f"OpenRouter API Error [{resp.status_code}]: {err_body}")
            data = resp.json()

        choices = data.get("choices", [])
        if not choices:
            return LLMResponse(
                content="",
                tool_calls=[],
                model_used=self.model,
                provider="openrouter",
                latency_ms=(time.perf_counter() - start_time) * 1000,
            )

        choice = choices[0]
        msg = choice.get("message", {})
        text_content = msg.get("content")
        raw_tools = msg.get("tool_calls", [])

        tool_calls: List[ToolCall] = []
        for rt in raw_tools:
            fn = rt.get("function", {})
            args_raw = fn.get("arguments", "{}")
            try:
                args = json.loads(args_raw) if isinstance(args_raw, str) else args_raw
            except Exception:
                args = {"raw": args_raw}

            tool_calls.append(
                ToolCall(
                    id=rt.get("id", f"call_{int(time.time()*1000)}"),
                    name=fn.get("name", "unknown_tool"),
                    arguments=args,
                )
            )

        usage = data.get("usage", {})
        return LLMResponse(
            content=text_content,
            tool_calls=tool_calls,
            model_used=data.get("model", self.model),
            provider="openrouter",
            prompt_tokens=usage.get("prompt_tokens", 0),
            completion_tokens=usage.get("completion_tokens", 0),
            latency_ms=(time.perf_counter() - start_time) * 1000,
        )

    async def health_check(self) -> bool:
        if not self.api_key:
            return False
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get("https://openrouter.ai/api/v1/auth/key", headers=headers)
                return resp.status_code == 200
        except Exception:
            return False
