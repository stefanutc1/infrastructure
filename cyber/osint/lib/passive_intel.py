#!/usr/bin/env python3
"""
PassiveIntelEngine: Non-Intrusive Open Source Intelligence Gathering & Reconnaissance
Performs passive domain analysis, certificate transparency modeling, and autonomous correlation.
"""

import json
import re
import socket
from pathlib import Path
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse


class PassiveIntelEngine:
    def __init__(self, offline_mode: bool = True):
        self.offline_mode = offline_mode

    @staticmethod
    def extract_apex_domain(target: str) -> str:
        """Extracts apex/root domain from FQDN or URL."""
        if "://" in target:
            target = urlparse(target).netloc
        target = target.split(":")[0].strip().lower()
        parts = target.split(".")
        if len(parts) >= 2:
            return ".".join(parts[-2:])
        return target

    def passive_resolve_dns(self, hostname: str) -> Dict[str, Any]:
        """
        Performs safe, standard DNS A-record resolution.
        In offline mode or on lookup failure, provides structured mock telemetry.
        """
        clean_host = hostname.strip().lower()
        if "://" in clean_host:
            clean_host = urlparse(clean_host).netloc.split(":")[0]

        record = {
            "hostname": clean_host,
            "apex_domain": self.extract_apex_domain(clean_host),
            "resolved_ips": [],
            "status": "UNRESOLVED"
        }

        if not self.offline_mode:
            try:
                ip_list = socket.gethostbyname_ex(clean_host)[2]
                record["resolved_ips"] = ip_list
                record["status"] = "SUCCESS"
            except (socket.gaierror, socket.herror, OSError) as err:
                record["status"] = f"ERROR: {str(err)}"
        else:
            # Deterministic offline mock for CI/CD test runs
            record["resolved_ips"] = ["198.51.100.24", "203.0.113.88"]
            record["status"] = "SIMULATED_OFFLINE_TELEMETRY"

        return record

    def build_ct_query_url(self, domain: str) -> str:
        """Constructs crt.sh certificate transparency log search URL."""
        apex = self.extract_apex_domain(domain)
        return f"https://crt.sh/?q=%25.{apex}&output=json"

    def profile_infrastructure(self, domain: str, subdomains: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Builds a comprehensive passive OSINT profile for an infrastructure target.
        """
        apex = self.extract_apex_domain(domain)
        subs = subdomains or [f"api.{apex}", f"portal.{apex}", f"mail.{apex}"]

        return {
            "target": domain,
            "apex_domain": apex,
            "crt_sh_lookup_endpoint": self.build_ct_query_url(apex),
            "subdomain_candidates": sorted(list(set(subs))),
            "recommended_dorks": [
                f'site:{apex} filetype:pdf confidential',
                f'site:{apex} intitle:"index of /"',
                f'site:{apex} inurl:wp-content'
            ],
            "enumeration_methodology": "PASSIVE_NON_INVASIVE"
        }
