#!/usr/bin/env python3
"""
IntelligenceSynthesizer: Agentic Synthesis and Threat Intelligence Briefing Generator
Compiles extracted IOCs, Admiralty confidence metrics, and passive findings into formal briefings.
"""

from typing import Dict, List, Any, Optional

try:
    from .admiralty import AdmiraltyEvaluator
    from .entity_extractor import EntityExtractor
    from .passive_intel import PassiveIntelEngine
except ImportError:
    from admiralty import AdmiraltyEvaluator
    from entity_extractor import EntityExtractor
    from passive_intel import PassiveIntelEngine


class IntelligenceSynthesizer:
    def __init__(self):
        self.admiralty = AdmiraltyEvaluator()
        self.extractor = EntityExtractor()
        self.passive = PassiveIntelEngine(offline_mode=True)

    def generate_briefing(
        self,
        title: str,
        raw_text: str,
        admiralty_code: str = "B2",
        tlp_level: str = "TLP:AMBER",
        analyst: str = "stefanutc1"
    ) -> Dict[str, Any]:
        """
        Synthesizes an enterprise threat intelligence report from raw field notes.
        """
        eval_score = self.admiralty.evaluate(admiralty_code)
        extracted = self.extractor.extract_all(raw_text)

        domains = extracted.get("domain", [])
        primary_domain = domains[0] if domains else "unknown-threat.org"
        recon_profile = self.passive.profile_infrastructure(primary_domain)

        return {
            "dossier_title": title,
            "classification": tlp_level,
            "analyst_attribution": analyst,
            "admiralty_evaluation": eval_score,
            "extracted_indicators": extracted,
            "passive_reconnaissance_profile": recon_profile,
            "actionable_takeaway": (
                f"Intelligence assessed as {eval_score['operational_verdict']} "
                f"with composite confidence score {eval_score['composite_confidence_index']}. "
                f"Contains {sum(len(v) for v in extracted.values())} distinct indicator entities."
            )
        }
