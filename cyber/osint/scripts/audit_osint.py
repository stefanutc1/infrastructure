#!/usr/bin/env python3
"""
OSINT Module Audit Engine
Verifies compliance of OSINT intelligence engines, Admiralty evaluators, and markdown formatting.
"""

import json
import os
import re
import sys
from pathlib import Path

MODULE_ROOT = Path(__file__).resolve().parent.parent
LIB_PATH = MODULE_ROOT / "lib"
sys.path.insert(0, str(LIB_PATH))

from admiralty import AdmiraltyEvaluator
from entity_extractor import EntityExtractor
from passive_intel import PassiveIntelEngine
from synthesis import IntelligenceSynthesizer


def audit_markdown_files():
    print("[OSINT AUDIT] Verifying markdown formatting and emoji restrictions...")
    md_files = sorted(list(set(MODULE_ROOT.glob("**/*.md"))))

    # Comprehensive Unicode emoji patterns
    emoji_pattern = re.compile(
        r"[\U0001F600-\U0001F64F"  # emoticons
        r"\U0001F300-\U0001F5FF"  # symbols & pictographs
        r"\U0001F680-\U0001F6FF"  # transport & map
        r"\U0001F1E0-\U0001F1FF"  # flags (iOS)
        r"\U00002700-\U000027BF"  # dingbats
        r"\U00002600-\U000026FF"  # misc symbols
        r"\U0001F900-\U0001F9FF"  # supplemental symbols
        r"\U0001FA70-\U0001FAFF"  # symbols and pictographs extended-a
        r"]+", flags=re.UNICODE
    )

    failures = 0
    for f in md_files:
        content = f.read_text(encoding="utf-8")
        emojis = emoji_pattern.findall(content)
        if emojis:
            print(f"  [FAIL] Emojis detected in {f.relative_to(MODULE_ROOT)}: {emojis}")
            failures += 1
        else:
            print(f"  [PASS] Zero emojis verified in {f.relative_to(MODULE_ROOT)}")

        lines = [line.strip() for line in content.splitlines() if line.strip()]
        if lines and lines[0] != '<div align="center">':
            print(f"  [WARN] Heading not explicitly centered with <div align=\"center\"> in {f.relative_to(MODULE_ROOT)}")
        else:
            print(f"  [PASS] Centered header verified in {f.relative_to(MODULE_ROOT)}")

    return failures == 0


def audit_entity_extractor():
    print("[OSINT AUDIT] Verifying EntityExtractor engine...")
    extractor = EntityExtractor()
    sample_text = (
        "Adversary beacon observed at 198.51.100.44 communicating with command node "
        "c2-panel.suspicious-domain.com. Exploit utilized CVE-2024-38077 against target. "
        "Contact email forensic-inbox@intel-share.net. Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855. "
        "Ransom wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa."
    )
    res = extractor.extract_all(sample_text)

    if not res.get("ipv4") or "198.51.100.44" not in res["ipv4"]:
        print("  [FAIL] Failed to extract IPv4 address.")
        return False
    if not res.get("domain") or not any("suspicious-domain.com" in d for d in res["domain"]):
        print("  [FAIL] Failed to extract domain.")
        return False
    if not res.get("cve") or "CVE-2024-38077" not in res["cve"]:
        print("  [FAIL] Failed to extract CVE.")
        return False
    if not res.get("sha256") or "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" not in res["sha256"]:
        print("  [FAIL] Failed to extract SHA256.")
        return False
    if not res.get("btc_address") or "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" not in res["btc_address"]:
        print("  [FAIL] Failed to extract cryptocurrency wallet address.")
        return False

    print("  [PASS] EntityExtractor correctly parsed all target telemetry entities.")
    return True


def audit_admiralty_evaluator():
    print("[OSINT AUDIT] Verifying AdmiraltyEvaluator engine...")
    evaluator = AdmiraltyEvaluator()

    # Valid evaluation test
    res = evaluator.evaluate("B2")
    if res["admiralty_code"] != "B2" or res["composite_confidence_index"] != 0.8:
        print(f"  [FAIL] Incorrect Admiralty computation: {res}")
        return False

    # High confidence check
    res_high = evaluator.evaluate("A1")
    if res_high["operational_verdict"] != "HIGH_CONFIDENCE_ACTIONABLE":
        print(f"  [FAIL] Expected HIGH_CONFIDENCE_ACTIONABLE, got {res_high['operational_verdict']}")
        return False

    # Invalid code format check
    try:
        evaluator.evaluate("Z9")
        print("  [FAIL] Evaluator accepted invalid Admiralty code.")
        return False
    except ValueError:
        pass

    print("  [PASS] AdmiraltyEvaluator successfully validated STANAG 2022 scoring matrix.")
    return True


def audit_passive_intel():
    print("[OSINT AUDIT] Verifying PassiveIntelEngine...")
    recon = PassiveIntelEngine(offline_mode=True)
    apex = recon.extract_apex_domain("https://sub.corp.internal.example.org:8443/login")
    if apex != "example.org":
        print(f"  [FAIL] Apex domain extraction failed: got {apex}, expected example.org")
        return False

    profile = recon.profile_infrastructure("threat-nexus.net")
    if "threat-nexus.net" not in profile["crt_sh_lookup_endpoint"]:
        print("  [FAIL] Certificate Transparency endpoint generation failed.")
        return False

    dns = recon.passive_resolve_dns("threat-nexus.net")
    if dns["status"] != "SIMULATED_OFFLINE_TELEMETRY" or not dns["resolved_ips"]:
        print("  [FAIL] Passive DNS offline profile returned unexpected result.")
        return False

    print("  [PASS] PassiveIntelEngine non-intrusive reconnaissance mechanisms verified.")
    return True


def audit_synthesis_engine():
    print("[OSINT AUDIT] Verifying IntelligenceSynthesizer...")
    synth = IntelligenceSynthesizer()
    notes = "Threat infrastructure identified at 203.0.113.19 under domain attacker-infra.com using CVE-2023-22515."
    briefing = synth.generate_briefing(
        title="Automated Test Threat Dossier",
        raw_text=notes,
        admiralty_code="A2"
    )

    if briefing["admiralty_evaluation"]["admiralty_code"] != "A2":
        print("  [FAIL] Synthesis did not preserve Admiralty rating.")
        return False
    if "203.0.113.19" not in briefing["extracted_indicators"]["ipv4"]:
        print("  [FAIL] Synthesis failed to capture extracted IPv4.")
        return False

    print("  [PASS] IntelligenceSynthesizer successfully produced structured threat briefing.")
    return True


def main():
    print("=" * 80)
    print("Enterprise OSINT Autonomous Module Audit")
    print("=" * 80)

    checks = [
        audit_entity_extractor(),
        audit_admiralty_evaluator(),
        audit_passive_intel(),
        audit_synthesis_engine(),
        audit_markdown_files()
    ]

    print("=" * 80)
    if all(checks):
        print("[SUCCESS] All OSINT audit tests passed successfully.")
        sys.exit(0)
    else:
        print("[FAILURE] One or more OSINT audit checks failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
