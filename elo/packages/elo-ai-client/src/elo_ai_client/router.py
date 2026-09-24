from __future__ import annotations
import time
import logging
from typing import List, Dict, Any, Optional
from .base import BaseLLMClient, ChatMessage, LLMResponse

logger = logging.getLogger("elo.ai.cascade")

QUOTA_ERROR_KEYWORDS = [
    "quota",
    "credit",
    "balance",
    "insufficient",
    "rate_limit",
    "rate limit",
    "ratelimit",
    "resource_exhausted",
    "resourceexhausted",
    "exceeded",
    "billing",
    "payment",
    "429",
    "402",
    "401",
    "403",
    "unauthorized",
]


class CascadeRouter(BaseLLMClient):
    """
    Multi-Provider Tiered Cascade Router with Instant Free-Tier Failover & Smart Cooldown.
    
    Order of execution:
    Tier 1: Google Gemini (Free Generous Tier - Gemini 2.5 Flash / Pro)
    Tier 2: Groq LPU (Ultra-Fast Free Tier - Llama 3.3 70B / Llama 3.1 8B)
    Tier 3: OpenRouter Universal Hub (Free Tier Models Pool - meta-llama/llama-3.3-70b-instruct:free)
    Tier 4: Local Ollama / vLLM (Self-Hosted on Apple Silicon Metal MPS)
    Tier 5: Deterministic Mock Failsafe (Offline Test Fallback)
    
    If any model runs out of free quota (429/ResourceExhausted),
    the router IMMEDIATELY routes the request to the next available tier without interrupting the user.
    """

    def __init__(
        self,
        providers: List[BaseLLMClient],
        name: str = "elo-cascade-engine",
        cooldown_seconds: float = 300.0,
    ):
        self.providers = [p for p in providers if p is not None]
        self.name = name
        self.cooldown_seconds = cooldown_seconds
        # provider_class_name -> cooldown_until_timestamp
        self._provider_cooldowns: Dict[str, float] = {}

    def _is_quota_exhausted(self, error: Exception) -> bool:
        """Determines if the exception is due to lack of credits, quota exhaustion, or rate limits."""
        err_str = str(error).lower()
        return any(keyword in err_str for keyword in QUOTA_ERROR_KEYWORDS)

    def _is_in_cooldown(self, provider_key: str) -> bool:
        """Checks if a provider is currently under temporary cooldown."""
        cooldown_until = self._provider_cooldowns.get(provider_key, 0.0)
        return time.time() < cooldown_until

    def reset_cooldowns(self):
        """Clears all provider cooldowns (e.g. after user updates API keys)."""
        self._provider_cooldowns.clear()

    async def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        errors = []
        now = time.time()

        for idx, client in enumerate(self.providers):
            provider_type = getattr(client, "__class__", type(client)).__name__
            model_name = getattr(client, "model", "default")
            provider_key = f"{provider_type}:{model_name}"

            # If provider is currently on quota cooldown and not the only fallback, skip instantly
            if self._is_in_cooldown(provider_key) and idx < len(self.providers) - 1:
                remaining = int(self._provider_cooldowns[provider_key] - now)
                logger.info(
                    f"[CASCADE SKIP] Tier {idx+1} ({provider_key}) is in quota cooldown ({remaining}s remaining). Skipping instantly..."
                )
                continue

            try:
                resp = await client.chat(
                    messages=messages,
                    tools=tools,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                
                # If we succeeded on a fallback tier, log it
                if idx > 0:
                    logger.info(
                        f"[CASCADE FAILOVER SUCCESS] Request completed by Tier {idx+1}: {provider_type} ({model_name})"
                    )
                
                # If this provider was previously in cooldown and now succeeded, clear it
                if provider_key in self._provider_cooldowns:
                    del self._provider_cooldowns[provider_key]

                return resp

            except Exception as e:
                is_quota = self._is_quota_exhausted(e)
                if is_quota:
                    self._provider_cooldowns[provider_key] = time.time() + self.cooldown_seconds
                    logger.warning(
                        f"[CASCADE QUOTA EXHAUSTED] Tier {idx+1} ({provider_key}) out of credits/quota ({e}). "
                        f"Placed on {int(self.cooldown_seconds)}s cooldown. Instantly switching to next provider..."
                    )
                else:
                    logger.warning(
                        f"[CASCADE ERROR] Tier {idx+1} ({provider_key}) failed ({e}). Switching to next provider..."
                    )

                errors.append(f"{provider_key}: {str(e)}")

        raise RuntimeError(f"All {len(self.providers)} cascaded LLM providers failed: {'; '.join(errors)}")

    async def health_check(self) -> bool:
        for client in self.providers:
            provider_type = getattr(client, "__class__", type(client)).__name__
            model_name = getattr(client, "model", "default")
            provider_key = f"{provider_type}:{model_name}"
            
            if self._is_in_cooldown(provider_key):
                continue
                
            try:
                if await client.health_check():
                    return True
            except Exception:
                continue
        return False


class HybridRouter(CascadeRouter):
    """Backwards-compatible wrapper around CascadeRouter."""

    def __init__(
        self,
        primary_client: BaseLLMClient,
        fallback_client: Optional[BaseLLMClient] = None,
        max_retries: int = 2,
    ):
        providers = [primary_client]
        if fallback_client:
            providers.append(fallback_client)
        super().__init__(providers=providers)
        self.primary_client = primary_client
        self.fallback_client = fallback_client
