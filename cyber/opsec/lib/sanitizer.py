#!/usr/bin/env python3
"""
OpsecSanitizer: Enterprise Scrubbing & De-identification Engine
Part of Autonomous OPSEC & AI Countermeasure Framework
"""

import json
import math
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple, Any

DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "opsec_rules.json"


class OpsecSanitizer:
    def __init__(self, config_path: str = None):
        cfg_file = Path(config_path) if config_path else DEFAULT_CONFIG_PATH
        if cfg_file.exists():
            with open(cfg_file, "r", encoding="utf-8") as f:
                self.config = json.load(f)
        else:
            self.config = {
                "sanitization_rules": {
                    "api_keys": [],
                    "network_identifiers": [],
                    "pii": []
                },
                "prompt_injection_signatures": []
            }

        self.compiled_rules: List[Tuple[str, re.Pattern, str]] = []
        self._compile_rules()

    def _compile_rules(self):
        rules = self.config.get("sanitization_rules", {})
        for category, rule_list in rules.items():
            for rule in rule_list:
                name = f"{category}::{rule.get('name', 'unnamed')}"
                pattern_str = rule.get("regex", "")
                replacement = rule.get("replacement", "[REDACTED]")
                try:
                    compiled = re.compile(pattern_str)
                    self.compiled_rules.append((name, compiled, replacement))
                except re.error:
                    pass

    @staticmethod
    def calculate_entropy(data: str) -> float:
        """Calculates Shannon entropy for detecting potential cryptographic keys."""
        if not data:
            return 0.0
        entropy = 0.0
        length = len(data)
        counts = {}
        for char in data:
            counts[char] = counts.get(char, 0) + 1
        for count in counts.values():
            prob = count / length
            entropy -= prob * math.log2(prob)
        return entropy

    def detect_secrets(self, text: str) -> List[Dict[str, Any]]:
        """Identifies sensitive tokens and returns their location and category."""
        findings = []
        if not text:
            return findings

        for name, pattern, _ in self.compiled_rules:
            for match in pattern.finditer(text):
                matched_str = match.group(0)
                findings.append({
                    "rule": name,
                    "start": match.start(),
                    "end": match.end(),
                    "length": len(matched_str),
                    "entropy": round(self.calculate_entropy(matched_str), 3)
                })
        return findings

    def sanitize(self, text: str) -> str:
        """Scrubs text of all configured secrets and identifiers."""
        if not text:
            return ""

        sanitized = text
        for _, pattern, replacement in self.compiled_rules:
            sanitized = pattern.sub(replacement, sanitized)
        return sanitized

    def sanitize_file(self, src_path: str, dst_path: str = None) -> Tuple[bool, int]:
        """Scrubs a physical file and optionally writes to destination."""
        src = Path(src_path)
        if not src.exists() or not src.is_file():
            raise FileNotFoundError(f"Source file not found: {src_path}")

        raw_content = src.read_text(encoding="utf-8", errors="ignore")
        secrets_count = len(self.detect_secrets(raw_content))
        cleaned_content = self.sanitize(raw_content)

        target = Path(dst_path) if dst_path else src
        target.write_text(cleaned_content, encoding="utf-8")
        return True, secrets_count
