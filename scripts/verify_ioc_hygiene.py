#!/usr/bin/env python3
"""
IoC List Hygiene & Integrity Validator

Checks:
1. Valid domain character sets (RFC 1035 / RFC 1123 compliant).
2. No trailing whitespace or Windows CRLF line endings (\r\n).
3. No duplicate entries within the same blocklist.
4. Alphabetical sorting integrity on master blocklists.
"""

from __future__ import annotations
import sys
import re
from pathlib import Path

DOMAIN_REGEX = re.compile(r"^(\*\.)?([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}$")

TARGET_BLOCKLISTS = [
    "cyber/forbidden_domains.txt",
    "cyber/lista_interzisa.txt",
    "cyber/mediagalaxy-ecommerce-fraud-forensics/forbidden_domains.txt",
    "cyber/mediagalaxy-ecommerce-fraud-forensics/lista_interzisa.txt",
    "cyber/mediagalaxy-ecommerce-fraud-forensics/ioc/domains.txt",
    "cyber/antigravity/romania_scam_blocklist.txt",
    "cyber/antigravity/extended_network_blocklist.txt",
]


def audit_file(file_path: Path) -> list[str]:
    errors = []
    if not file_path.exists():
        return [f"File does not exist: {file_path}"]

    raw_bytes = file_path.read_bytes()
    if b"\r" in raw_bytes:
        errors.append(f"{file_path}: Contains Windows CRLF (\\r\\n) carriage returns; must be UNIX LF.")

    try:
        text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError as e:
        return [f"{file_path}: Invalid UTF-8 encoding ({e})"]

    lines = text.split("\n")
    cleaned_entries = []
    seen = set()

    for idx, line in enumerate(lines, start=1):
        if line.endswith(" ") or line.endswith("\t"):
            errors.append(f"{file_path}:{idx}: Trailing whitespace detected: '{line}'")

        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        lower = stripped.lower()
        if lower in seen:
            errors.append(f"{file_path}:{idx}: Duplicate entry detected: '{stripped}'")
        else:
            seen.add(lower)
            cleaned_entries.append(lower)

        # Validate domain format
        if not DOMAIN_REGEX.match(lower):
            errors.append(f"{file_path}:{idx}: Malformed domain format / invalid characters: '{stripped}'")

    # Check sorting on master lists
    if "forbidden_domains.txt" in file_path.name or "lista_interzisa.txt" in file_path.name:
        sorted_entries = sorted(cleaned_entries)
        if cleaned_entries != sorted_entries:
            errors.append(f"{file_path}: Entries are not sorted alphabetically.")

    return errors


def main():
    repo_root = Path(__file__).resolve().parent.parent
    all_errors = []
    total_checked = 0

    for rel_path in TARGET_BLOCKLISTS:
        full_path = repo_root / rel_path
        if full_path.exists():
            total_checked += 1
            errs = audit_file(full_path)
            if errs:
                all_errors.extend(errs)

    print(f"[IOC HYGIENE AUDIT] Checked {total_checked} target blocklists.")
    if all_errors:
        print(f"\n[ERROR] Found {len(all_errors)} hygiene error(s):")
        for err in all_errors:
            print(f"  - {err}")
        return 1

    print("[SUCCESS] All IoC domain blocklists passed hygiene, formatting, and sorting checks.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
