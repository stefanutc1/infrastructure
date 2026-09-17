#!/usr/bin/env python3
"""
Ad Threat Intelligence & Scam Pattern Analyzer
==============================================
Analyzes sponsored ad destinations, social media campaign links, and landing pages
to detect known fraud patterns:
  1. Retail Brand Impersonation (lookalikes, deceptive subdomains, e.g. Media Galaxy clones)
  2. Chinese Fraud SaaS Clusters (turnkey platforms like YiyangSaaS, OEMCart engines)
  3. Ephemeral High-Discount Dropshipping Fronts (suspicious storefronts)
  4. Secondary Phishing & ATO Infrastructure (disposable SMTP relays, fake order lures)

Usage:
    python3 ad_threat_intel_analyzer.py --file /tmp/links.txt
    python3 ad_threat_intel_analyzer.py --url "https://mediagalaxy.voetbalshop-nlco.com"
"""

import argparse
import json
import re
import sys
import urllib.parse
from typing import Dict, List, Set


KNOWN_THREAT_INDICATORS = {
    "retail_brands_ro": [
        "mediagalaxy", "altex", "emag", "flanco", "dedeman",
        "carrefour", "kaufland", "lidl", "auchan", "aboutyou"
    ],
    "fraud_saas_signatures": [
        "yiyangsaas", "oemcart", "ename", "guoqi.png", "module_login_default",
        "tiktok-ads-preloading-nocache"
    ],
    "suspicious_dropship_fronts": [
        "zondo.ro", "ufit.ro", "top-deals", "super-discount", "outlet-ro"
    ],
    "disposable_mail_relays": [
        "mailapp-fly.com", "worvixglobal.com"
    ]
}


class ThreatAnalyzer:
    def __init__(self):
        self.iocs: Set[str] = set()

    def analyze_domain(self, domain: str) -> Dict[str, any]:
        domain = domain.lower().strip()
        parts = domain.split(".")
        findings = []
        severity = "INFO"

        # Check for brand impersonation via subdomain
        for brand in KNOWN_THREAT_INDICATORS["retail_brands_ro"]:
            if brand in domain:
                # Is it an official domain or spoofed?
                official = f"{brand}.ro"
                if domain != official and not domain.endswith(f".{official}"):
                    findings.append(f"Deceptive brand impersonation: '{brand}' present in non-official domain '{domain}'")
                    severity = "CRITICAL"
                    self.iocs.add(domain)

        # Check known malicious backend SaaS or relays
        for saas in KNOWN_THREAT_INDICATORS["fraud_saas_signatures"] + KNOWN_THREAT_INDICATORS["disposable_mail_relays"]:
            if saas in domain:
                findings.append(f"Matched known fraud/phishing cluster infrastructure: '{saas}'")
                severity = "CRITICAL"
                self.iocs.add(domain)

        # Check suspicious dropship fronts
        for front in KNOWN_THREAT_INDICATORS["suspicious_dropship_fronts"]:
            if front in domain:
                findings.append(f"Matched suspicious commercial storefront pattern: '{front}'")
                severity = "HIGH"
                self.iocs.add(domain)

        # Heuristic: multi-subdomain spoofing (e.g., brand.legitlooking-random.com)
        if len(parts) >= 3 and any(b in parts[0] for b in KNOWN_THREAT_INDICATORS["retail_brands_ro"]):
            findings.append("Anomalous subdomain hierarchy mimicking known corporate entity")
            severity = "CRITICAL"
            self.iocs.add(domain)

        return {
            "domain": domain,
            "severity": severity,
            "findings": findings
        }

    def analyze_url(self, raw_url: str) -> Dict[str, any]:
        parsed = urllib.parse.urlparse(raw_url)
        domain = parsed.netloc.split(":")[0].lower()
        result = self.analyze_domain(domain)
        result["raw_url"] = raw_url
        return result


def main():
    parser = argparse.ArgumentParser(description="Ad Threat Intel & Fraud Pattern Analyzer")
    parser.add_argument("--url", help="Single URL to analyze")
    parser.add_argument("--file", help="File with list of URLs or domains to analyze")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    args = parser.parse_args()

    analyzer = ThreatAnalyzer()
    reports = []

    if args.url:
        reports.append(analyzer.analyze_url(args.url))
    elif args.file:
        with open(args.file, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    if line.startswith("http"):
                        reports.append(analyzer.analyze_url(line))
                    else:
                        reports.append(analyzer.analyze_domain(line))
    else:
        # Default analysis of active investigation cluster
        default_domains = [
            "voetbalshop-nlco.com",
            "mediagalaxy.voetbalshop-nlco.com",
            "worvixglobal.com",
            "email.worvixglobal.com",
            "yiyangsaas.com",
            "mailapp-fly.com",
            "info.mailapp-fly.com",
            "zondo.ro",
            "ufit.ro"
        ]
        for d in default_domains:
            reports.append(analyzer.analyze_domain(d))

    if args.json:
        print(json.dumps({"reports": reports, "extracted_iocs": sorted(list(analyzer.iocs))}, indent=2))
    else:
        print("=" * 60)
        print("AD THREAT INTELLIGENCE & FRAUD PATTERN REPORT")
        print("=" * 60)
        for r in reports:
            sev_color = {"CRITICAL": "[!]", "HIGH": "[*]", "INFO": "[-]"}.get(r["severity"], "[?]")
            print(f"{sev_color} Domain: {r['domain']} | Severity: {r['severity']}")
            for f in r["findings"]:
                print(f"    - {f}")
        print("\n" + "=" * 60)
        print(f"IDENTIFIED MALICIOUS / FRAUDULENT IOCS ({len(analyzer.iocs)}):")
        for ioc in sorted(analyzer.iocs):
            print(f"  {ioc}")
        print("=" * 60)


if __name__ == "__main__":
    main()
