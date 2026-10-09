#!/usr/bin/env python3
"""
EntityExtractor: Autonomous Extraction of Cyber Threat Indicators and OSINT Entities
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Set, Any, Optional

DEFAULT_SOURCES_PATH = Path(__file__).resolve().parent.parent / "config" / "osint_sources.json"


class EntityExtractor:
    def __init__(self, config_path: Optional[str] = None):
        cfg_file = Path(config_path) if config_path else DEFAULT_SOURCES_PATH
        if cfg_file.exists():
            with open(cfg_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.regex_specs = data.get("entity_regexes", {})
        else:
            self.regex_specs = {
                "ipv4": r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b",
                "domain": r"\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b",
                "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
                "cve": r"\bCVE-\d{4}-\d{4,7}\b",
                "sha256": r"\b[a-fA-F0-9]{64}\b",
                "md5": r"\b[a-fA-F0-9]{32}\b",
                "asn": r"\bAS\d{1,10}\b",
                "btc_address": r"\b(?:1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})\b"
            }

        self.compiled_patterns: Dict[str, re.Pattern] = {}
        for entity_type, pat in self.regex_specs.items():
            try:
                self.compiled_patterns[entity_type] = re.compile(pat)
            except re.error:
                pass

    def extract_all(self, raw_text: str) -> Dict[str, List[str]]:
        """
        Scans raw text and returns deduplicated lists of detected IOCs per category.
        """
        results: Dict[str, List[str]] = {}
        if not raw_text:
            return {k: [] for k in self.compiled_patterns.keys()}

        for entity_type, pattern in self.compiled_patterns.items():
            matches = pattern.findall(raw_text)
            cleaned_set: Set[str] = set()

            for item in matches:
                # Discard common false-positive extensions if captured as domains
                if entity_type == "domain":
                    item_lower = item.lower()
                    if item_lower.endswith((".png", ".jpg", ".jpeg", ".gif", ".pdf", ".py", ".md", ".json", ".conf")):
                        continue
                cleaned_set.add(item)

            results[entity_type] = sorted(list(cleaned_set))

        return results

    def extract_summary(self, raw_text: str) -> Dict[str, Any]:
        """Returns extraction results along with total count metrics."""
        entities = self.extract_all(raw_text)
        total_count = sum(len(items) for items in entities.values())
        return {
            "total_extracted_indicators": total_count,
            "entities_by_type": entities
        }
