#!/usr/bin/env python3
"""
PromptGuard: AI Agent Egress/Ingress Security & Prompt Leak Mitigation
Part of Autonomous OPSEC & AI Countermeasure Framework
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "opsec_rules.json"


class PromptGuard:
    def __init__(self, config_path: Optional[str] = None):
        cfg_file = Path(config_path) if config_path else DEFAULT_CONFIG_PATH
        if cfg_file.exists():
            with open(cfg_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.signatures = data.get("prompt_injection_signatures", [])
        else:
            self.signatures = [
                r"(?i)ignore\s+all\s+prior\s+instructions",
                r"(?i)disregard\s+all\s+safety\s+guidelines",
                r"(?i)reveal\s+your\s+system\s+prompt",
                r"(?i)you\s+are\s+now\s+in\s+developer\s+mode"
            ]
        self.compiled_patterns = [re.compile(p) for p in self.signatures]

    def evaluate_prompt(self, user_prompt: str) -> Dict[str, Any]:
        """
        Analyzes prompt for adversarial injection or prompt extraction vectors.
        Returns safety verdict, score, and matched indicators.
        """
        if not user_prompt:
            return {"verdict": "SAFE", "score": 0.0, "matches": []}

        matches = []
        for pat in self.compiled_patterns:
            found = pat.findall(user_prompt)
            if found:
                matches.append(pat.pattern)

        risk_score = min(1.0, len(matches) * 0.35)
        verdict = "SAFE"
        if risk_score >= 0.7:
            verdict = "BLOCK_INJECTION_DETECTED"
        elif risk_score > 0.0:
            verdict = "SUSPICIOUS_PROMPT_FLAGGED"

        return {
            "verdict": verdict,
            "risk_score": round(risk_score, 2),
            "matches_count": len(matches),
            "matched_signatures": matches
        }

    def validate_agent_output(self, agent_output: str, protected_system_substrings: List[str]) -> Dict[str, Any]:
        """
        Ensures agent output does not leak proprietary system instructions or raw prompts.
        """
        leaks = []
        for protected in protected_system_substrings:
            if protected and len(protected) >= 12 and protected.lower() in agent_output.lower():
                leaks.append(protected)

        return {
            "leak_detected": len(leaks) > 0,
            "leaked_substrings": leaks,
            "action": "QUARANTINE_RESPONSE" if leaks else "ALLOW"
        }
