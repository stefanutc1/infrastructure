#!/usr/bin/env python3
"""
Sync Forbidden Domains & DNSC Blacklist (https://blacklist.dnsc.ro/)

This script:
1. Fetches the active public blacklist from https://blacklist.dnsc.ro/
2. Extracts domain, type, date added, status, and reason using Python's native HTML parser.
3. Maintains a cumulative database in cyber/dnsc_blacklist.json, logging any newly discovered threats.
4. Gathers all local threat intelligence domains from across cyber/ (Media Galaxy, Revolut, Task Scam, Steam OpenID, Antigravity blocklists).
5. Merges, sanitizes, and deduplicates all entries into:
   - cyber/forbidden_domains.txt (standardized master blocklist)
   - cyber/lista_interzisa.txt (Romanian naming alias)
   - cyber/dnsc_blacklist.json (rich telemetry database)
"""

import os
import re
import sys
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

DNSC_URL = "https://blacklist.dnsc.ro/"

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
    # Validate allowable characters in domain
    if not re.match(r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$", d):
        return False
    return True


def fetch_dnsc_blacklist(timeout: int = 15) -> list[dict]:
    """Fetches and parses the live blacklist from https://blacklist.dnsc.ro/"""
    print(f"[FETCH] Querying DNSC Blacklist Gateway: {DNSC_URL}")
    req = urllib.request.Request(
        DNSC_URL,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except urllib.error.URLError as e:
        print(f"[WARNING] Unable to fetch DNSC Blacklist ({e}). Continuing with cached records.")
        return []

    parser = DNSCParser()
    parser.feed(html)
    print(f"[FETCH] Extracted {len(parser.items)} active threat entries from DNSC Blacklist Gateway.")
    return parser.items


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
            print(f"  [NEW DNSC THREAT] {addr} | Type: {entry['type']} | Reason: {entry['reason']} | Date: {entry['date_added']}")
        else:
            # Update last_seen timestamp
            existing_cache[addr]["last_seen"] = now_iso
            if item.get("reason"):
                existing_cache[addr]["reason"] = item["reason"]
            if item.get("status"):
                existing_cache[addr]["status"] = item["status"]

    return existing_cache, newly_added


def gather_local_domains() -> set[str]:
    """Extracts all local threat intelligence domains across cyber/."""
    local_domains = set()

    # 1. Direct Investigation Domains
    for d in INVESTIGATION_DOMAINS:
        cleaned = clean_domain(d)
        if is_valid_domain(cleaned):
            local_domains.add(cleaned)

    # 2. Local blocklist files
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


def generate_forbidden_list_content(all_domains: list[str], local_count: int, dnsc_count: int) -> str:
    """Builds formatted forbidden_domains.txt content."""
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    timestamp_str = now_utc.strftime("%Y-%m-%d %H:%M:%S UTC")

    header = f"""# ==============================================================================
# Unified Threat Intelligence Forbidden Domains & Blacklist (cyber/)
# Sources: Local Forensics Repositories + DNSC Blacklist Gateway ({DNSC_URL})
# Classification: TLP:CLEAR | Synchronized Daily at 05:00 Europe/Bucharest (24h)
# Last Updated: {timestamp_str}
# Total Forbidden Domains: {len(all_domains)} (Local: {local_count}, DNSC Live: {dnsc_count})
# ==============================================================================
"""
    body = "\n".join(all_domains) + "\n"
    return header + body


def main():
    parser = argparse.ArgumentParser(description="Synchronize Forbidden Domains and DNSC Blacklist")
    parser.add_argument("--check", action="store_true", help="Verify if domains are in sync without modifying unless required")
    parser.add_argument("--dry-run", action="store_true", help="Inspect sync actions without writing to disk")
    args = parser.parse_args()

    # 1. Fetch live DNSC items
    live_items = fetch_dnsc_blacklist()

    # 2. Load cumulative DNSC cache
    existing_cache = load_cumulative_dnsc_cache()
    updated_cache, newly_added = update_dnsc_cache(live_items, existing_cache)

    # 3. Gather local domains
    local_domains = gather_local_domains()

    # 4. Merge all domains
    dnsc_domains = {d for d in updated_cache.keys() if is_valid_domain(d)}
    combined_domains = sorted(list(local_domains | dnsc_domains))

    print(f"[AGGREGATE] Total unique forbidden domains: {len(combined_domains)}")
    print(f"            - Local Forensics: {len(local_domains)}")
    print(f"            - DNSC Blacklist:  {len(dnsc_domains)}")
    print(f"            - Newly Discovered: {len(newly_added)}")

    if args.dry_run:
        print("[DRY-RUN] Files not modified.")
        return 0

    # 5. Check mode
    if args.check:
        if not FORBIDDEN_TXT.exists() or not LISTA_INTERZISA_TXT.exists() or not DNSC_JSON.exists():
            print("[CHECK] Required forbidden domain files missing. Sync required.")
            return 1
        existing_lines = [clean_domain(l) for l in FORBIDDEN_TXT.read_text(encoding="utf-8").splitlines() if l and not l.startswith("#")]
        if set(existing_lines) != set(combined_domains):
            print(f"[CHECK] Forbidden domains list is out of date ({len(existing_lines)} existing vs {len(combined_domains)} current).")
            return 1
        print("[CHECK] All forbidden domains and DNSC blacklist feeds are synchronized.")
        return 0

    # 6. Write DNSC cumulative JSON
    dnsc_payload = {
        "metadata": {
            "source": DNSC_URL,
            "description": "National Cyber Security Directorate (DNSC) Blacklist Threat Feed",
            "last_synced": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "total_entries": len(updated_cache),
            "new_entries_this_run": len(newly_added),
        },
        "entries": sorted(list(updated_cache.values()), key=lambda x: x["address"]),
    }
    DNSC_JSON.write_text(json.dumps(dnsc_payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"[SAVED] Saved DNSC telemetry cache to {DNSC_JSON.relative_to(REPO_ROOT)} ({len(updated_cache)} records)")

    # 7. Write forbidden_domains.txt & lista_interzisa.txt
    file_content = generate_forbidden_list_content(combined_domains, len(local_domains), len(dnsc_domains))
    FORBIDDEN_TXT.write_text(file_content, encoding="utf-8")
    LISTA_INTERZISA_TXT.write_text(file_content, encoding="utf-8")

    print(f"[SAVED] Updated master blocklist: {FORBIDDEN_TXT.relative_to(REPO_ROOT)} ({len(combined_domains)} domains)")
    print(f"[SAVED] Updated Romanian alias:  {LISTA_INTERZISA_TXT.relative_to(REPO_ROOT)} ({len(combined_domains)} domains)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
