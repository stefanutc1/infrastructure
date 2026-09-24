from __future__ import annotations
from abc import ABC, abstractmethod
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class Role(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


class ToolCall(BaseModel):
    id: str
    name: str
    arguments: Dict[str, Any]


class ChatMessage(BaseModel):
    role: Role
    content: Optional[str] = None
    tool_calls: Optional[List[ToolCall]] = None
    tool_call_id: Optional[str] = None
    name: Optional[str] = None
    raw_parts: Optional[List[Dict[str, Any]]] = None


class LLMResponse(BaseModel):
    content: Optional[str] = None
    tool_calls: List[ToolCall] = Field(default_factory=list)
    model_used: str
    provider: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    latency_ms: float = 0.0
    raw_parts: Optional[List[Dict[str, Any]]] = None


class BaseLLMClient(ABC):
    """Abstract base class for all LLM providers in ELO."""

    @abstractmethod
    async def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        """Sends a conversation history to the model and returns structured response."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Checks if provider is reachable and active."""
        pass
