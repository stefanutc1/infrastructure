from __future__ import annotations

import asyncio
import functools
import logging
import secrets
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from enum import Enum
from typing import Any, AsyncIterator, Callable, Dict, List, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger("elo.core.tracing")


class SpanKind(str, Enum):
    INTERNAL = "INTERNAL"
    SERVER = "SERVER"
    CLIENT = "CLIENT"
    PRODUCER = "PRODUCER"
    CONSUMER = "CONSUMER"


class SpanStatus(str, Enum):
    OK = "OK"
    ERROR = "ERROR"
    UNSET = "UNSET"


class SpanEvent(BaseModel):
    name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    attributes: Dict[str, Any] = Field(default_factory=dict)


class SpanRecord(BaseModel):
    trace_id: str
    span_id: str
    parent_span_id: Optional[str] = None
    name: str
    kind: SpanKind = SpanKind.INTERNAL
    status: SpanStatus = SpanStatus.OK
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_ms: float = 0.0
    attributes: Dict[str, Any] = Field(default_factory=dict)
    events: List[SpanEvent] = Field(default_factory=list)
    error_message: Optional[str] = None


class TraceContext(BaseModel):
    trace_id: str
    span_id: str
    trace_flags: str = "01"
    baggage: Dict[str, str] = Field(default_factory=dict)


class EloTracer:
    """
    OpenTelemetry-Compatible Distributed Tracing Instrumentor.
    Provides cognitive span tracking for AI orchestration, tool execution,
    sub-agent delegation, and hardware telemetry with W3C traceparent propagation.
    """

    def __init__(
        self,
        service_name: str = "elo-core",
        otlp_endpoint: Optional[str] = "http://192.168.1.11:4318",
        max_buffer_size: int = 1000,
    ) -> None:
        self.service_name = service_name
        self.otlp_endpoint = otlp_endpoint
        self.max_buffer_size = max_buffer_size
        self._span_buffer: List[SpanRecord] = []
        self._current_context: Optional[TraceContext] = None

    def generate_trace_id(self) -> str:
        """Generates a 128-bit hex string compliant with W3C Trace Context."""
        return secrets.token_hex(16)

    def generate_span_id(self) -> str:
        """Generates a 64-bit hex string compliant with W3C Trace Context."""
        return secrets.token_hex(8)

    def get_w3c_traceparent(self, context: Optional[TraceContext] = None) -> str:
        """Formats context into W3C traceparent header: 00-traceid-spanid-01."""
        ctx = context or self._current_context
        if not ctx:
            trace_id = self.generate_trace_id()
            span_id = self.generate_span_id()
            return f"00-{trace_id}-{span_id}-01"
        return f"00-{ctx.trace_id}-{ctx.span_id}-{ctx.trace_flags}"

    def parse_w3c_traceparent(self, header: str) -> Optional[TraceContext]:
        """Parses a W3C traceparent header string."""
        parts = header.strip().split("-")
        if len(parts) == 4 and parts[0] == "00":
            return TraceContext(trace_id=parts[1], span_id=parts[2], trace_flags=parts[3])
        return None

    @asynccontextmanager
    async def cognitive_span(
        self,
        name: str,
        kind: SpanKind = SpanKind.INTERNAL,
        attributes: Optional[Dict[str, Any]] = None,
        parent_context: Optional[TraceContext] = None,
    ) -> AsyncIterator[SpanRecord]:
        """
        Async context manager creating a tracked cognitive tracing span.
        """
        parent = parent_context or self._current_context
        trace_id = parent.trace_id if parent else self.generate_trace_id()
        parent_span_id = parent.span_id if parent else None
        span_id = self.generate_span_id()

        span_attrs = {
            "service.name": self.service_name,
            "span.type": "cognitive",
        }
        if attributes:
            span_attrs.update(attributes)

        record = SpanRecord(
            trace_id=trace_id,
            span_id=span_id,
            parent_span_id=parent_span_id,
            name=name,
            kind=kind,
            status=SpanStatus.OK,
            start_time=datetime.now(timezone.utc),
            attributes=span_attrs,
        )

        previous_context = self._current_context
        self._current_context = TraceContext(trace_id=trace_id, span_id=span_id)
        start_perf = time.perf_counter()

        try:
            yield record
        except Exception as exc:
            record.status = SpanStatus.ERROR
            record.error_message = str(exc)
            record.events.append(
                SpanEvent(
                    name="exception",
                    attributes={"exception.type": type(exc).__name__, "exception.message": str(exc)},
                )
            )
            raise
        finally:
            end_perf = time.perf_counter()
            record.end_time = datetime.now(timezone.utc)
            record.duration_ms = round((end_perf - start_perf) * 1000, 2)
            self._current_context = previous_context
            self._record_span(record)

    def _record_span(self, span: SpanRecord) -> None:
        """Appends span to local circular buffer."""
        self._span_buffer.append(span)
        if len(self._span_buffer) > self.max_buffer_size:
            self._span_buffer.pop(0)
        logger.debug(f"[EloTracer] Span '{span.name}' completed in {span.duration_ms}ms ({span.status.value})")

    def record_llm_inference(
        self,
        span: SpanRecord,
        prompt_tokens: int,
        completion_tokens: int,
        model: str,
        provider: str,
    ) -> None:
        """Attaches GenAI semantic conventions to an active span."""
        span.attributes.update({
            "gen_ai.system": provider,
            "gen_ai.request.model": model,
            "gen_ai.usage.prompt_tokens": prompt_tokens,
            "gen_ai.usage.completion_tokens": completion_tokens,
            "gen_ai.usage.total_tokens": prompt_tokens + completion_tokens,
        })

    def get_recent_spans(self, limit: int = 50) -> List[SpanRecord]:
        """Returns the most recent completed spans."""
        return list(reversed(self._span_buffer[-limit:]))


# Global default tracer instance
tracer = EloTracer()


def trace_cognitive(name: Optional[str] = None, attributes: Optional[Dict[str, Any]] = None):
    """
    Decorator for instrumenting async functions with cognitive trace spans.
    """
    def decorator(func: Callable):
        span_name = name or func.__name__

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            async with tracer.cognitive_span(span_name, attributes=attributes) as span:
                return await func(*args, **kwargs)

        return wrapper

    return decorator
