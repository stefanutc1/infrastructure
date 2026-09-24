from __future__ import annotations
import time
import httpx
import json
import logging
from typing import List, Dict, Any, Optional
from .base import BaseLLMClient, ChatMessage, LLMResponse, ToolCall, Role

logger = logging.getLogger("elo.ai.gemini")


class CloudGeminiClient(BaseLLMClient):
    """
    Cloud Gemini Client communicating with Google Generative Language API.
    Supports system instructions, multi-turn chat, function/tool calling with thought signatures, and structured output.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "gemini-3.6-flash",
        timeout: float = 35.0,
    ):
        self.api_key = api_key.strip() if api_key else ""
        self.model = model.strip() if model else "gemini-3.6-flash"
        self.timeout = timeout

    async def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        start_time = time.perf_counter()
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured. Please add it in settings or .env.")

        # Separate system instruction from conversational turns
        system_text = None
        contents = []

        for m in messages:
            if m.role == Role.SYSTEM:
                system_text = m.content
                continue

            role = "user" if m.role == Role.USER else "model"
            
            if m.raw_parts:
                contents.append({"role": role, "parts": m.raw_parts})
                continue

            parts = []

            if m.content:
                parts.append({"text": m.content})

            if m.tool_calls:
                for tc in m.tool_calls:
                    parts.append({
                        "functionCall": {
                            "name": tc.name,
                            "args": tc.arguments,
                        }
                    })

            if m.role == Role.TOOL:
                role = "user"  # In Gemini, function responses are provided by user turn
                # Parse tool content as dict or string
                tool_output_dict = {}
                if m.content:
                    try:
                        tool_output_dict = json.loads(m.content)
                    except Exception:
                        tool_output_dict = {"output": m.content}
                
                parts.append({
                    "functionResponse": {
                        "name": m.name or "tool",
                        "response": tool_output_dict if isinstance(tool_output_dict, dict) else {"result": tool_output_dict},
                    }
                })

            if parts:
                contents.append({"role": role, "parts": parts})

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            }
        }

        if system_text:
            payload["system_instruction"] = {
                "parts": [{"text": system_text}]
            }

        if tools:
            function_declarations = []
            for t in tools:
                raw_schema = t.get("parameters_schema") or t.get("parameters") or {}
                # Clean schema for Gemini API
                cleaned_schema = {
                    "type": raw_schema.get("type", "OBJECT").upper() if isinstance(raw_schema.get("type"), str) else "OBJECT",
                    "properties": raw_schema.get("properties", {}),
                }
                if "required" in raw_schema:
                    cleaned_schema["required"] = raw_schema["required"]

                function_declarations.append({
                    "name": t.get("name"),
                    "description": t.get("description", ""),
                    "parameters": cleaned_schema,
                })

            payload["tools"] = [{"function_declarations": function_declarations}]

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                err_body = resp.text
                logger.error(f"Gemini API Error ({resp.status_code}): {err_body}")
                raise RuntimeError(f"Gemini API Error [{resp.status_code}]: {err_body}")
            data = resp.json()

        candidates = data.get("candidates", [])
        if not candidates:
            return LLMResponse(
                content="",
                tool_calls=[],
                model_used=self.model,
                provider="cloud_gemini",
                latency_ms=(time.perf_counter() - start_time) * 1000,
            )

        candidate = candidates[0]
        content_parts = candidate.get("content", {}).get("parts", [])
        text_content = []
        tool_calls: List[ToolCall] = []

        for p in content_parts:
            if "text" in p:
                text_content.append(p["text"])
            if "functionCall" in p:
                fc = p["functionCall"]
                tool_calls.append(
                    ToolCall(
                        id=f"call_{int(time.time()*1000)}",
                        name=fc.get("name", "unknown_tool"),
                        arguments=fc.get("args", {}),
                    )
                )

        usage = data.get("usageMetadata", {})
        return LLMResponse(
            content="".join(text_content) if text_content else None,
            tool_calls=tool_calls,
            model_used=self.model,
            provider="cloud_gemini",
            prompt_tokens=usage.get("promptTokenCount", 0),
            completion_tokens=usage.get("candidatesTokenCount", 0),
            latency_ms=(time.perf_counter() - start_time) * 1000,
            raw_parts=content_parts,
        )

    async def health_check(self) -> bool:
        if not self.api_key:
            return False
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models?key={self.api_key}"
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(url)
                return resp.status_code == 200
        except Exception:
            return False
