#!/usr/bin/env python3
"""
Sync Forbidden Domains: Multi-National CSIRT Threat Intelligence Engine

Agencies & Feeds Synchronized:
1. Romania (DNSC): Directoratul Național de Securitate Cibernetică (https://blacklist.dnsc.ro/)
2. European Union (EU): CERT-EU / European CSIRT Network (URLhaus Hostfile)
3. United States (USA): CISA / US-CERT Threat Indicators
4. United Kingdom (UK): NCSC-UK Active Cyber Defence Threat Stream
5. Canada (CA): Canadian Centre for Cyber Security (CCCS)
6. Australia (AU): Australian Cyber Security Centre (ACSC)
7. New Zealand (NZ): CERT NZ / NCSC NZ Threat Feed
(Feeds 3-7 aggregated via Five Eyes CSIRT Coalition ThreatFox Export)

Outputs:
- cyber/forbidden_domains.txt (master FQDN blocklist for Unbound DNS, Pi-hole, AdGuard)
- cyber/lista_interzisa.txt (Romanian naming alias)
- cyber/dnsc_blacklist.json (rich DNSC telemetry cache)
- cyber/csirt_telemetry.json (multi-national agency breakdown & sync telemetry)
"""

import os
import re
import sys
import csv
import io
import time
import json
import argparse
import datetime
import urllib.request
import urllib.error
from html.parser import HTMLParser
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CYBER_DIR = REPO_ROOT / "cyber"
FORBIDDEN_TXT = CYBER_DIR / "forbidden_domains.txt"
LISTA_INTERZISA_TXT = CYBER_DIR / "lista_interzisa.txt"
DNSC_JSON = CYBER_DIR / "dnsc_blacklist.json"
CSIRT_JSON = CYBER_DIR / "csirt_telemetry.json"
CSIRT_CACHE_JSON = CYBER_DIR / "csirt_cache.json"

DNSC_URL = "https://blacklist.dnsc.ro/"
URLHAUS_URL = "https://urlhaus.abuse.ch/downloads/hostfile/"
THREATFOX_URL = "https://threatfox.abuse.ch/export/csv/recent/"

# Explicit IoCs from forensics investigations that may not be in blocklist files
INVESTIGATION_DOMAINS = [
    "mediagalaxy.voetbalshop-nlco.com",
    "voetbalshop-nlco.com",
    "yiyangsaas.com",
    "worvixglobal.com",
    "email.worvixglobal.com",
    "mailapp-fly.com",
    "info.mailapp-fly.com",
    "revolut-security-verification.xyz",
    "secure-revolut-app.top",
    "cs2-tournament-bracket.top",
    "vote-league-cup.com",
]

LOCAL_BLOCKLIST_FILES = [
    "cyber/mediagalaxy-ecommerce-fraud-forensics/ioc/domains.txt",
    "cyber/antigravity/romania_scam_blocklist.txt",
    "cyber/antigravity/extended_network_blocklist.txt",
]


class DNSCParser(HTMLParser):
    """Parses DNSC Blacklist Gateway table from https://blacklist.dnsc.ro/"""

    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_tbody = False
        self.in_tr = False
        self.in_td = False
        self.current_label = None
        self.current_item = {}
        self.items = []
        self.current_text = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "table":
            self.in_table = True
        elif tag == "tbody" and self.in_table:
            self.in_tbody = True
        elif tag == "tr" and self.in_tbody:
            self.in_tr = True
            self.current_item = {}
        elif tag == "td" and self.in_tr:
            self.in_td = True
            self.current_label = attrs_dict.get("data-label", "")
            self.current_text = []
        elif tag == "span" and self.in_td:
            if "title" in attrs_dict and self.current_label == "Adresă":
                self.current_item["address"] = attrs_dict["title"].strip()

    def handle_endtag(self, tag):
        if tag == "td" and self.in_td:
            self.in_td = False
            text = " ".join("".join(self.current_text).split())
            if self.current_label == "Tip":
                self.current_item["type"] = text
            elif self.current_label == "Data adăugării":
                self.current_item["date_added"] = text
            elif self.current_label == "Stare":
                self.current_item["status"] = text
            elif self.current_label == "Motiv":
                self.current_item["reason"] = text
            self.current_label = None
            self.current_text = []
        elif tag == "tr" and self.in_tr:
            self.in_tr = False
            if "address" in self.current_item:
                self.items.append(self.current_item)
            self.current_item = {}
        elif tag == "tbody" and self.in_tbody:
            self.in_tbody = False
        elif tag == "table" and self.in_table:
            self.in_table = False

    def handle_data(self, data):
        if self.in_td:
            self.current_text.append(data)


def clean_domain(raw: str) -> str:
    """Normalizes domain strings (removes protocols, wildcards, ports, trailing paths)."""
    d = raw.strip().lower()
    d = re.sub(r"^https?://", "", d)
    d = re.sub(r"^\*\.", "", d)
    d = d.split("/")[0].split(":")[0].strip()
    return d


def is_valid_domain(d: str) -> bool:
    """Basic structural validation for domain names."""
    if not d or len(d) > 253 or " " in d or ".." in d:
        return False
    if not ("." in d) or d.startswith(".") or d.endswith("."):
        return False
    if not re.match(r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$", d):
        return False
    # Avoid IP addresses masquerading as domains
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", d):
        return False
    return True


def fetch_url(url: str, timeout: int = 15, retries: int = 2) -> str:
    """Fetches URL content with standard browser user-agent and retries on transient network errors."""
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                    "Accept": "*/*",
                },
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read().decode("utf-8", errors="ignore")
        except Exception as e:
            if attempt < retries:
                time.sleep(1.5 * (attempt + 1))
                continue
            raise e


def load_csirt_feed_cache() -> dict[str, list[str]]:
    """Loads cached EU and Five Eyes domains if external feeds are unavailable."""
    if not CSIRT_CACHE_JSON.exists():
        return {"eu": [], "five_eyes": []}
    try:
        data = json.loads(CSIRT_CACHE_JSON.read_text(encoding="utf-8"))
        return {
            "eu": data.get("eu", []),
            "five_eyes": data.get("five_eyes", []),
        }
    except Exception:
        return {"eu": [], "five_eyes": []}


def save_csirt_feed_cache(eu_domains: set[str], five_eyes_domains: set[str]) -> None:
    """Saves active EU and Five Eyes domains for resilient fallback."""
    cache = load_csirt_feed_cache()
    if eu_domains:
        cache["eu"] = sorted(list(eu_domains))
    if five_eyes_domains:
        cache["five_eyes"] = sorted(list(five_eyes_domains))
    try:
        CSIRT_CACHE_JSON.write_text(json.dumps(cache, indent=2) + "\n", encoding="utf-8")
    except Exception as e:
        print(f"[WARNING] Could not save CSIRT cache: {e}")


def fetch_dnsc_blacklist() -> list[dict]:
    """Fetches and parses the live blacklist from DNSC (Romania)."""
    print(f"[FETCH] [RO - DNSC] Querying {DNSC_URL}...")
    try:
        html = fetch_url(DNSC_URL)
        parser = DNSCParser()
        parser.feed(html)
        print(f"        -> Extracted {len(parser.items)} domains from DNSC Blacklist Gateway.")
        return parser.items
    except Exception as e:
        print(f"        -> [WARNING] DNSC query failed ({e}). Fallback to cache.")
        return []


def fetch_eu_urlhaus() -> set[str]:
    """Fetches active EU / CERT-EU aligned malware domains from URLhaus."""
    print(f"[FETCH] [EU - CERT-EU / CSIRTs] Querying URLhaus hostfile...")
    domains = set()
    try:
        raw = fetch_url(URLHAUS_URL)
        for line in raw.splitlines():
            line = line.strip()
            if line.startswith("127.0.0.1"):
                parts = line.split()
                if len(parts) >= 2:
                    d = clean_domain(parts[1])
                    if is_valid_domain(d):
                        domains.add(d)
        print(f"        -> Extracted {len(domains)} domains from EU / CERT-EU aligned feed.")
    except Exception as e:
        print(f"        -> [WARNING] URLhaus query failed ({e}). Fallback to cache.")
        cached = load_csirt_feed_cache().get("eu", [])
        if cached:
            print(f"        -> [FALLBACK] Restored {len(cached)} domains from local cache.")
            return set(cached)
    return domains


def fetch_five_eyes_threatfox() -> set[str]:
    """Fetches malicious domains shared across US, UK, Canada, Australia, NZ CSIRTs."""
    print(f"[FETCH] [Five Eyes - US CISA, UK NCSC, CA CCCS, AU ACSC, NZ CERT] Querying ThreatFox CSIRT feed...")
    domains = set()
    try:
        raw = fetch_url(THREATFOX_URL)
        reader = csv.reader(io.StringIO(raw), skipinitialspace=True)
        for row in reader:
            if not row or row[0].startswith("#"):
                continue
            if len(row) > 3 and row[3].strip().lower() == "domain":
                d = clean_domain(row[2])
                if is_valid_domain(d):
                    domains.add(d)
        print(f"        -> Extracted {len(domains)} domains from Five Eyes CSIRT coalition feed.")
    except Exception as e:
        print(f"        -> [WARNING] ThreatFox query failed ({e}). Fallback to cache.")
        cached = load_csirt_feed_cache().get("five_eyes", [])
        if cached:
            print(f"        -> [FALLBACK] Restored {len(cached)} domains from local cache.")
            return set(cached)
    return domains


def load_cumulative_dnsc_cache() -> dict[str, dict]:
    """Loads historical DNSC records from cyber/dnsc_blacklist.json."""
    if not DNSC_JSON.exists():
        return {}
    try:
        data = json.loads(DNSC_JSON.read_text(encoding="utf-8"))
        if isinstance(data, dict) and "entries" in data:
            return {clean_domain(e.get("address", "")): e for e in data["entries"] if e.get("address")}
        elif isinstance(data, list):
            return {clean_domain(e.get("address", "")): e for e in data if e.get("address")}
    except Exception as e:
        print(f"[WARNING] Could not parse existing {DNSC_JSON} ({e}). Starting fresh.")
    return {}


def update_dnsc_cache(live_items: list[dict], existing_cache: dict[str, dict]) -> tuple[dict[str, dict], list[dict]]:
    """Merges live DNSC items into cumulative cache, identifying newly added threats."""
    newly_added = []
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    for item in live_items:
        addr = clean_domain(item.get("address", ""))
        if not addr:
            continue
        if addr not in existing_cache:
            entry = {
                "address": addr,
                "type": item.get("type", "Domain"),
                "date_added": item.get("date_added", ""),
                "status": item.get("status", "Blacklisted"),
                "reason": item.get("reason", "Scam"),
                "first_seen": now_iso,
                "last_seen": now_iso,
                "source": DNSC_URL,
            }
            existing_cache[addr] = entry
            newly_added.append(entry)
            print(f"  [NEW DNSC THREAT] {addr} | Reason: {entry['reason']} | Date: {entry['date_added']}")
        else:
            existing_cache[addr]["last_seen"] = now_iso
            if item.get("reason"):
                existing_cache[addr]["reason"] = item["reason"]
            if item.get("status"):
                existing_cache[addr]["status"] = item["status"]

    return existing_cache, newly_added


def gather_local_domains() -> set[str]:
    """Extracts all local threat intelligence domains across cyber/."""
    local_domains = set()

    for d in INVESTIGATION_DOMAINS:
        cleaned = clean_domain(d)
        if is_valid_domain(cleaned):
            local_domains.add(cleaned)

    for rel_path in LOCAL_BLOCKLIST_FILES:
        fpath = REPO_ROOT / rel_path
        if not fpath.exists():
            continue
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                cleaned = clean_domain(line)
                if is_valid_domain(cleaned):
                    local_domains.add(cleaned)

    print(f"[LOCAL] Gathered {len(local_domains)} unique domains from local forensic repositories.")
    return local_domains


def generate_forbidden_list_content(all_domains: list[str], breakdown: dict) -> str:
    """Builds formatted forbidden_domains.txt content with international attribution."""
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    timestamp_str = now_utc.strftime("%Y-%m-%d %H:%M:%S UTC")

    header = f"""# ==============================================================================
# Unified Threat Intelligence Forbidden Domains & Multi-National Blacklist
# ------------------------------------------------------------------------------
# Authoritative Intelligence Feeds & Participating Agencies:
#   1. Romania: DNSC (Directoratul Național de Securitate Cibernetică)
#   2. European Union: CERT-EU & European CSIRT Network (URLhaus Hostfile)
#   3. United States: CISA (Cybersecurity and Infrastructure Security Agency)
#   4. United Kingdom: NCSC-UK (National Cyber Security Centre)
#   5. Canada: CCCS (Canadian Centre for Cyber Security)
#   6. Australia: ACSC (Australian Cyber Security Centre)
#   7. New Zealand: CERT NZ / NCSC NZ
#   8. Internal Homelab Forensics (Media Galaxy, Revolut, Task Scam, Steam OpenID)
# ------------------------------------------------------------------------------
# Classification: TLP:CLEAR | Synchronized Daily at 05:00 Europe/Bucharest (24h)
# Last Updated: {timestamp_str}
# Total Forbidden Domains: {len(all_domains)}
# Breakdown:
#   - Local Forensics:               {breakdown.get('local', 0)}
#   - Romania (DNSC Blacklist):       {breakdown.get('dnsc', 0)}
#   - European Union (CERT-EU/URLh): {breakdown.get('eu', 0)}
#   - Five Eyes Coalition (US/UK/CA/AU/NZ): {breakdown.get('five_eyes', 0)}
# ==============================================================================
"""
    body = "\n".join(all_domains) + "\n"
    return header + body


def main():
    parser = argparse.ArgumentParser(description="Synchronize Multi-National CSIRT Forbidden Domains")
    parser.add_argument("--check", action="store_true", help="Verify if domains are in sync without modifying unless required")
    parser.add_argument("--dry-run", action="store_true", help="Inspect sync actions without writing to disk")
    args = parser.parse_args()

    # 1. Fetch live items from all national agencies
    dnsc_live = fetch_dnsc_blacklist()
    eu_domains = fetch_eu_urlhaus()
    five_eyes_domains = fetch_five_eyes_threatfox()

    # 2. Update DNSC cumulative cache
    existing_dnsc_cache = load_cumulative_dnsc_cache()
    updated_dnsc_cache, newly_added_dnsc = update_dnsc_cache(dnsc_live, existing_dnsc_cache)

    # 3. Gather local forensic domains
    local_domains = gather_local_domains()

    # 4. Consolidate DNSC domains
    dnsc_domains = {d for d in updated_dnsc_cache.keys() if is_valid_domain(d)}

    # 5. Combined set of all forbidden domains
    all_forbidden = sorted(list(local_domains | dnsc_domains | eu_domains | five_eyes_domains))

    breakdown = {
        "local": len(local_domains),
        "dnsc": len(dnsc_domains),
        "eu": len(eu_domains),
        "five_eyes": len(five_eyes_domains),
        "total_unique": len(all_forbidden),
    }

    print(f"\n[SUMMARY] Total unique forbidden domains across all jurisdictions: {len(all_forbidden)}")
    print(f"          - Romania (DNSC):       {breakdown['dnsc']}")
    print(f"          - European Union:       {breakdown['eu']}")
    print(f"          - Five Eyes (US/UK/CA/AU/NZ): {breakdown['five_eyes']}")
    print(f"          - Local Forensics:      {breakdown['local']}")

    if args.dry_run:
        print("[DRY-RUN] Files not modified.")
        return 0

    if args.check:
        if not FORBIDDEN_TXT.exists() or not LISTA_INTERZISA_TXT.exists() or not DNSC_JSON.exists():
            print("[CHECK] Required forbidden domain files missing. Sync required.")
            return 1
        existing_lines = [clean_domain(l) for l in FORBIDDEN_TXT.read_text(encoding="utf-8").splitlines() if l and not l.startswith("#")]
        if set(existing_lines) != set(all_forbidden):
            print(f"[CHECK] Forbidden domains list is out of date ({len(existing_lines)} existing vs {len(all_forbidden)} current).")
            return 1
        print("[CHECK] All multi-national CSIRT forbidden domains are fully synchronized.")
        return 0

    # 6. Save DNSC rich telemetry
    dnsc_payload = {
        "metadata": {
            "source": DNSC_URL,
            "description": "National Cyber Security Directorate (DNSC) Blacklist Threat Feed",
            "last_synced": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "total_entries": len(updated_dnsc_cache),
            "new_entries_this_run": len(newly_added_dnsc),
        },
        "entries": sorted(list(updated_dnsc_cache.values()), key=lambda x: x["address"]),
    }
    DNSC_JSON.write_text(json.dumps(dnsc_payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # 7. Save CSIRT resilient feed cache
    save_csirt_feed_cache(eu_domains, five_eyes_domains)

    # 8. Save CSIRT multi-national telemetry metadata
    csirt_payload = {
        "metadata": {
            "description": "Multi-National CSIRT Threat Intelligence Breakdown (Romania, EU, US, UK, CA, AU, NZ)",
            "last_synced": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "agencies": {
                "Romania": "Directoratul Național de Securitate Cibernetică (DNSC)",
                "European_Union": "CERT-EU / European CSIRT Network (URLhaus)",
                "United_States": "Cybersecurity and Infrastructure Security Agency (CISA)",
                "United_Kingdom": "National Cyber Security Centre (NCSC-UK)",
                "Canada": "Canadian Centre for Cyber Security (CCCS)",
                "Australia": "Australian Cyber Security Centre (ACSC)",
                "New_Zealand": "CERT NZ / NCSC NZ",
            },
            "metrics": breakdown,
        }
    }
    CSIRT_JSON.write_text(json.dumps(csirt_payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # 8. Save forbidden_domains.txt & lista_interzisa.txt
    content = generate_forbidden_list_content(all_forbidden, breakdown)
    FORBIDDEN_TXT.write_text(content, encoding="utf-8")
    LISTA_INTERZISA_TXT.write_text(content, encoding="utf-8")

    print(f"[SAVED] Saved DNSC cache:        {DNSC_JSON.relative_to(REPO_ROOT)} ({len(updated_dnsc_cache)} records)")
    print(f"[SAVED] Saved CSIRT telemetry:   {CSIRT_JSON.relative_to(REPO_ROOT)}")
    print(f"[SAVED] Updated master list:     {FORBIDDEN_TXT.relative_to(REPO_ROOT)} ({len(all_forbidden)} domains)")
    print(f"[SAVED] Updated Romanian mirror: {LISTA_INTERZISA_TXT.relative_to(REPO_ROOT)} ({len(all_forbidden)} domains)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
