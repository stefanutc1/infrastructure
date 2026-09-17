#!/usr/bin/env python3
"""
CTF Web Server Log Analyzer
Analizează fișiere access.log pentru a detecta cereri anormale, încercări de exploatare și posibile flag-uri.
"""

import sys
import os
import re
import argparse
from collections import Counter

FLAG_REGEX = re.compile(r'(?:FLAG|ALGO|CTF|cyber)\{[^}]+\}', re.IGNORECASE)

LOG_PATTERN = re.compile(
    r'(?P<ip>\S+)\s+\S+\s+\S+\s+\[(?P<time>[^\]]+)\]\s+"(?P<method>\S+)\s+(?P<path>\S+)\s+(?P<protocol>[^"]+)"\s+(?P<status>\d{3})\s+(?P<size>\S+)'
)

SUSPICIOUS_KEYWORDS = [
    "union", "select", "order by", "information_schema",
    "../", "..\\", "/etc/passwd", "/bin/sh",
    "script", "alert(", "eval(", "<svg",
    "base64", "cat ", "whoami", "curl ", "wget "
]

def analyze_log(filepath: str):
    if not os.path.exists(filepath):
        print(f"[-] Fișierul {filepath} nu a fost găsit.")
        return

    print(f"[*] Analiză log: {filepath}...\n")
    
    ips = Counter()
    statuses = Counter()
    suspicious_lines = []
    flags_found = set()

    total_lines = 0
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            total_lines += 1
            # Căutare flag direct
            for m in FLAG_REGEX.findall(line):
                flags_found.add(m)

            match = LOG_PATTERN.search(line)
            if match:
                data = match.groupdict()
                ips[data["ip"]] += 1
                statuses[data["status"]] += 1
                
                path_lower = data["path"].lower()
                if any(kw in path_lower for kw in SUSPICIOUS_KEYWORDS):
                    suspicious_lines.append((data["ip"], data["status"], data["path"]))
            else:
                # Format non-standard, căutare simplă pe cuvinte cheie
                line_lower = line.lower()
                if any(kw in line_lower for kw in SUSPICIOUS_KEYWORDS):
                    suspicious_lines.append(("Unknown", "N/A", line.strip()[:100]))

    if flags_found:
        print("="*60)
        print("🚩 FLAG(URI) IDENTIFICATE ÎN LOG:")
        for fl in flags_found:
            print(f"  -> {fl}")
        print("="*60 + "\n")

    print(f"📊 Statistici generale (Total linii: {total_lines}):")
    print("  Coduri de stare HTTP:")
    for st, count in statuses.most_common():
        print(f"    - {st}: {count} cereri")

    print("\n  Top 5 Adrese IP:")
    for ip, count in ips.most_common(5):
        print(f"    - {ip:<16} : {count} cereri")

    if suspicious_lines:
        print(f"\n⚠️ Cereri suspecte identificate ({len(suspicious_lines)}):")
        for ip, st, path in suspicious_lines[:15]:
            print(f"  [{st}] {ip:<15} : {path}")
        if len(suspicious_lines) > 15:
            print(f"  ... și încă {len(suspicious_lines)-15} cereri suspecte.")

def main():
    parser = argparse.ArgumentParser(description="CTF Web Server Log Analyzer")
    parser.add_argument("logfile", help="Calea către fișierul de log (ex: access.log)")
    args = parser.parse_args()

    analyze_log(args.logfile)

if __name__ == "__main__":
    main()
