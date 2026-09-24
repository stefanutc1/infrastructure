import asyncio
import time
from typing import Dict, Optional
from pydantic import BaseModel, Field


class RateLimitConfig(BaseModel):
    requests_per_minute: int = 15
    tokens_per_minute: int = 1000000
    daily_request_cap: int = 1500
    backoff_factor: float = 1.5
    max_retries: int = 3


class ProviderRateState(BaseModel):
    provider_name: str
    tokens_used_this_minute: int = 0
    requests_this_minute: int = 0
    requests_today: int = 0
    window_start: float = Field(default_factory=time.time)
    daily_start: float = Field(default_factory=time.time)
    consecutive_429s: int = 0
    is_cooling_down: bool = False
    cooldown_until: float = 0.0


class HierarchicalRateLimiter:
    """
    Hierarchical Token Bucket & Sliding-Window Rate Limiter.
    Prevents HTTP 429 quota exhaustion across Gemini, Groq, OpenRouter, and Ollama.
    """

    def __init__(self, configs: Optional[Dict[str, RateLimitConfig]] = None):
        self.configs: Dict[str, RateLimitConfig] = configs or {
            "gemini": RateLimitConfig(requests_per_minute=15, tokens_per_minute=1000000, daily_request_cap=1500),
            "groq": RateLimitConfig(requests_per_minute=30, tokens_per_minute=500000, daily_request_cap=14400),
            "openrouter": RateLimitConfig(requests_per_minute=20, tokens_per_minute=200000, daily_request_cap=200),
            "ollama": RateLimitConfig(requests_per_minute=120, tokens_per_minute=10000000, daily_request_cap=100000),
        }
        self.states: Dict[str, ProviderRateState] = {}
        self._lock = asyncio.Lock()

    def _get_or_create_state(self, provider: str) -> ProviderRateState:
        if provider not in self.states:
            self.states[provider] = ProviderRateState(provider_name=provider)
        return self.states[provider]

    async def can_dispatch(self, provider: str, estimated_tokens: int = 500) -> bool:
        """
        Determines whether a request can be immediately dispatched without exceeding quota.
        """
        async with self._lock:
            state = self._get_or_create_state(provider)
            config = self.configs.get(provider, RateLimitConfig())
            now = time.time()

            if now - state.window_start >= 60.0:
                state.tokens_used_this_minute = 0
                state.requests_this_minute = 0
                state.window_start = now

            if now - state.daily_start >= 86400.0:
                state.requests_today = 0
                state.daily_start = now

            if state.is_cooling_down:
                if now < state.cooldown_until:
                    return False
                state.is_cooling_down = False
                state.consecutive_429s = 0

            if state.requests_today >= config.daily_request_cap:
                return False

            if state.requests_this_minute >= config.requests_per_minute:
                return False

            if state.tokens_used_this_minute + estimated_tokens > config.tokens_per_minute:
                return False

            return True

    async def record_usage(self, provider: str, actual_tokens: int = 500) -> None:
        """
        Registers consumed tokens and requests after successful inference.
        """
        async with self._lock:
            state = self._get_or_create_state(provider)
            state.requests_this_minute += 1
            state.requests_today += 1
            state.tokens_used_this_minute += actual_tokens
            state.consecutive_429s = 0

    async def record_rate_limit_error(self, provider: str, cooldown_seconds: float = 60.0) -> None:
        """
        Handles 429 response by placing provider into exponential cooldown.
        """
        async with self._lock:
            state = self._get_or_create_state(provider)
            state.consecutive_429s += 1
            config = self.configs.get(provider, RateLimitConfig())
            backoff = cooldown_seconds * (config.backoff_factor ** (state.consecutive_429s - 1))
            state.is_cooling_down = True
            state.cooldown_until = time.time() + backoff
