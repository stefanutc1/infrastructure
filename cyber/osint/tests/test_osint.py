#!/usr/bin/env python3
"""
Unit Test Suite for Autonomous OSINT Framework
Tests entity extraction, Admiralty scoring, passive reconnaissance, and report synthesis.
"""

import sys
import unittest
from pathlib import Path

# Add lib directory to path
TEST_DIR = Path(__file__).resolve().parent
MODULE_ROOT = TEST_DIR.parent
LIB_DIR = MODULE_ROOT / "lib"
sys.path.insert(0, str(LIB_DIR))

from admiralty import AdmiraltyEvaluator
from entity_extractor import EntityExtractor
from passive_intel import PassiveIntelEngine
from synthesis import IntelligenceSynthesizer


class TestAdmiraltyEvaluator(unittest.TestCase):
    def setUp(self):
        self.evaluator = AdmiraltyEvaluator()

    def test_valid_admiralty_codes(self):
        codes = ["A1", "B2", "C3", "D4", "E5", "F6"]
        for code in codes:
            res = self.evaluator.evaluate(code)
            self.assertEqual(res["admiralty_code"], code)
            self.assertIn("composite_confidence_index", res)
            self.assertIn("operational_verdict", res)

    def test_composite_scoring_calculation(self):
        # A1: 0.4*1.0 + 0.6*1.0 = 1.0
        res_a1 = self.evaluator.evaluate("A1")
        self.assertEqual(res_a1["composite_confidence_index"], 1.0)
        self.assertEqual(res_a1["operational_verdict"], "HIGH_CONFIDENCE_ACTIONABLE")

        # B2: 0.4*0.8 + 0.6*0.8 = 0.8
        res_b2 = self.evaluator.evaluate("B2")
        self.assertEqual(res_b2["composite_confidence_index"], 0.8)
        self.assertEqual(res_b2["operational_verdict"], "MODERATE_CONFIDENCE_CORROBORATION_REQUIRED")

        # E5: 0.4*0.2 + 0.6*0.2 = 0.2
        res_e5 = self.evaluator.evaluate("E5")
        self.assertEqual(res_e5["composite_confidence_index"], 0.2)
        self.assertEqual(res_e5["operational_verdict"], "LOW_CONFIDENCE_UNVERIFIED")

    def test_invalid_code_raises_exception(self):
        with self.assertRaises(ValueError):
            self.evaluator.evaluate("Z1")
        with self.assertRaises(ValueError):
            self.evaluator.evaluate("A9")
        with self.assertRaises(ValueError):
            self.evaluator.evaluate("TOOLONG")


class TestEntityExtractor(unittest.TestCase):
    def setUp(self):
        self.extractor = EntityExtractor()

    def test_extract_ipv4(self):
        text = "Observed outbound connections to 198.51.100.14 and 192.0.2.1."
        res = self.extractor.extract_all(text)
        self.assertIn("198.51.100.14", res["ipv4"])
        self.assertIn("192.0.2.1", res["ipv4"])

    def test_extract_domains_and_filter_extensions(self):
        text = "Report saved to analysis.pdf and image.png while domain malicious-c2.org was active."
        res = self.extractor.extract_all(text)
        self.assertIn("malicious-c2.org", res["domain"])
        self.assertNotIn("analysis.pdf", res["domain"])
        self.assertNotIn("image.png", res["domain"])

    def test_extract_cve(self):
        text = "Adversary exploited CVE-2023-38606 on iOS devices."
        res = self.extractor.extract_all(text)
        self.assertIn("CVE-2023-38606", res["cve"])

    def test_extract_sha256_hash(self):
        text = "Binary hash is e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855."
        res = self.extractor.extract_all(text)
        self.assertIn("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", res["sha256"])

    def test_extract_summary_counts(self):
        text = "Target 203.0.113.50 registered to test@domain.com on domain sample-threat.com."
        summary = self.extractor.extract_summary(text)
        self.assertGreaterEqual(summary["total_extracted_indicators"], 3)


class TestPassiveIntelEngine(unittest.TestCase):
    def setUp(self):
        self.engine = PassiveIntelEngine(offline_mode=True)

    def test_extract_apex_domain(self):
        self.assertEqual(self.engine.extract_apex_domain("https://sub.portal.domain.com:8080/path"), "domain.com")
        self.assertEqual(self.engine.extract_apex_domain("api.service.co.uk"), "co.uk")

    def test_build_ct_query_url(self):
        url = self.engine.build_ct_query_url("sub.targetcorp.com")
        self.assertIn("targetcorp.com", url)
        self.assertTrue(url.startswith("https://crt.sh/"))

    def test_profile_infrastructure(self):
        profile = self.engine.profile_infrastructure("target-infra.com")
        self.assertEqual(profile["target"], "target-infra.com")
        self.assertEqual(profile["apex_domain"], "target-infra.com")
        self.assertIn("subdomain_candidates", profile)
        self.assertGreater(len(profile["recommended_dorks"]), 0)


class TestIntelligenceSynthesizer(unittest.TestCase):
    def setUp(self):
        self.synthesizer = IntelligenceSynthesizer()

    def test_generate_briefing(self):
        notes = "C2 server hosted at 198.51.100.99 for campaign phishing-alert.org using CVE-2024-21413."
        briefing = self.synthesizer.generate_briefing(
            title="Executive Threat Analysis",
            raw_text=notes,
            admiralty_code="B1"
        )
        self.assertEqual(briefing["dossier_title"], "Executive Threat Analysis")
        self.assertEqual(briefing["classification"], "TLP:AMBER")
        self.assertEqual(briefing["analyst_attribution"], "stefanutc1")
        self.assertEqual(briefing["admiralty_evaluation"]["admiralty_code"], "B1")
        self.assertIn("198.51.100.99", briefing["extracted_indicators"]["ipv4"])
        self.assertIn("actionable_takeaway", briefing)


if __name__ == "__main__":
    unittest.main()
