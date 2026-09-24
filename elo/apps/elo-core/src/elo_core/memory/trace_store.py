import json
import time
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ReActStep(BaseModel):
    step_type: str  # reasoning, action, observation, completed
    content: str
    tool_name: Optional[str] = None
    tool_args: Optional[Dict] = None
    timestamp: float = Field(default_factory=time.time)


class ExecutionTrace(BaseModel):
    trace_id: str
    task_description: str
    domain: str  # infra, secops, storage, home_automation, general
    steps: List[ReActStep] = Field(default_factory=list)
    success: bool = True
    feedback_score: float = 1.0  # 0.0 to 1.0
    execution_time_seconds: float = 0.0
    created_at: float = Field(default_factory=time.time)
    metadata: Dict = Field(default_factory=dict)


class TraceStore:
    """
    Self-Reflective Execution Trace Store.
    Indexes verified ReAct execution traces to dynamically induce high-quality Few-Shot prompts.
    """

    def __init__(self, storage_file: Optional[str] = None):
        self.storage_file = storage_file
        self.traces: Dict[str, ExecutionTrace] = {}

    def record_trace(self, trace: ExecutionTrace) -> None:
        """
        Stores a verified execution trace.
        """
        self.traces[trace.trace_id] = trace
        if self.storage_file:
            self._persist()

    def find_similar_exemplars(self, task_query: str, domain: Optional[str] = None, limit: int = 3) -> List[ExecutionTrace]:
        """
        Retrieves top performing exemplar traces for dynamic few-shot prompt induction.
        """
        matching: List[ExecutionTrace] = []
        tokens = set(task_query.lower().split())

        for trace in self.traces.values():
            if not trace.success or trace.feedback_score < 0.8:
                continue
            if domain and trace.domain != domain:
                continue

            trace_tokens = set(trace.task_description.lower().split())
            overlap = len(tokens.intersection(trace_tokens))
            matching.append((overlap, trace))

        # Sort by overlap then feedback score descending
        matching.sort(key=lambda x: (x[0], x[1].feedback_score), reverse=True)
        return [t[1] for t in matching[:limit]]

    def format_few_shot_context(self, exemplars: List[ExecutionTrace]) -> str:
        """
        Formats retrieved execution traces into few-shot context blocks for LLM prompts.
        """
        if not exemplars:
            return ""

        blocks = ["### VERIFIED EXECUTION EXEMPLARS (Few-Shot Reference):"]
        for idx, ex in enumerate(exemplars, 1):
            blocks.append(f"\n--- Exemplar {idx}: {ex.task_description} [Domain: {ex.domain}] ---")
            for step in ex.steps:
                if step.step_type == "reasoning":
                    blocks.append(f"[THOUGHT]: {step.content}")
                elif step.step_type == "action":
                    blocks.append(f"[ACTION]: {step.tool_name}({json.dumps(step.tool_args or {})})")
                elif step.step_type == "observation":
                    blocks.append(f"[OBSERVATION]: {step.content}")
                elif step.step_type == "completed":
                    blocks.append(f"[CONCLUSION]: {step.content}")
        return "\n".join(blocks)

    def _persist(self) -> None:
        if not self.storage_file:
            return
        try:
            with open(self.storage_file, "w") as fh:
                data = {k: v.model_dump() for k, v in self.traces.items()}
                json.dump(data, fh, indent=2)
        except Exception:
            pass
