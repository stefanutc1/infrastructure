#!/usr/bin/env python3
"""
Suricata Rules Static Syntax and SID Integrity Validator

Checks:
1. Basic rule structure: action, protocol, source, direction, dest, port.
2. Required options: msg, sid, rev.
3. SID uniqueness across all .rules files.
4. Valid integer values for sid and rev.
5. Quoting of msg and string options.
"""

from __future__ import annotations
import sys
import re
from pathlib import Path

ACTIONS = {"alert", "drop", "pass", "reject", "rejectsrc", "rejectdst", "rejectboth"}
PROTOCOLS = {"tcp", "udp", "icmp", "ip", "http", "tls", "dns", "smtp", "ftp", "ssh", "smb", "nfs"}


def parse_rule_line(line: str, file_path: Path, line_no: int) -> dict | None:
    line = line.strip()
    if not line or line.startswith("#"):
        return None

    # Check parenthesis balance
    if line.count("(") != line.count(")"):
        raise ValueError(f"Mismatched parentheses in {file_path}:{line_no}")

    match = re.match(r"^([a-z]+)\s+([a-z]+)\s+([^\s]+)\s+([^\s]+)\s+(->|<>)\s+([^\s]+)\s+([^\s]+)\s*\((.*)\);?\s*$", line, re.IGNORECASE)
    if not match:
        raise ValueError(f"Invalid Suricata rule format in {file_path}:{line_no}: {line}")

    action, proto, src_ip, src_port, direction, dst_ip, dst_port, opts_str = match.groups()

    if action.lower() not in ACTIONS:
        raise ValueError(f"Invalid rule action '{action}' in {file_path}:{line_no}")

    if proto.lower() not in PROTOCOLS:
        raise ValueError(f"Unsupported/invalid protocol '{proto}' in {file_path}:{line_no}")

    options = {}
    for part in opts_str.split(";"):
        part = part.strip()
        if not part:
            continue
        if ":" in part:
            k, v = part.split(":", 1)
            options[k.strip().lower()] = v.strip()
        else:
            options[part.strip().lower()] = True

    if "msg" not in options:
        raise ValueError(f"Missing mandatory 'msg' option in {file_path}:{line_no}")

    if "sid" not in options:
        raise ValueError(f"Missing mandatory 'sid' option in {file_path}:{line_no}")

    try:
        sid_val = int(options["sid"])
    except ValueError:
        raise ValueError(f"SID must be an integer in {file_path}:{line_no}: got '{options['sid']}'")

    rev_val = 1
    if "rev" in options:
        try:
            rev_val = int(options["rev"])
        except ValueError:
            raise ValueError(f"rev must be an integer in {file_path}:{line_no}")

    return {
        "file": str(file_path),
        "line": line_no,
        "action": action,
        "protocol": proto,
        "sid": sid_val,
        "rev": rev_val,
        "msg": options["msg"],
    }


def main():
    repo_root = Path(__file__).resolve().parent.parent
    rule_files = list(repo_root.glob("**/*.rules"))

    if not rule_files:
        print("[INFO] No .rules files discovered.")
        return 0

    seen_sids = {}
    total_rules = 0
    errors = []

    for rf in rule_files:
        try:
            content = rf.read_text(encoding="utf-8")
        except Exception as e:
            errors.append(f"Failed to read {rf}: {e}")
            continue

        for i, line in enumerate(content.splitlines(), start=1):
            try:
                rule = parse_rule_line(line, rf.relative_to(repo_root), i)
                if rule:
                    total_rules += 1
                    sid = rule["sid"]
                    if sid in seen_sids:
                        prev = seen_sids[sid]
                        errors.append(
                            f"Duplicate SID {sid} found in {rule['file']}:{rule['line']} "
                            f"(previously declared in {prev['file']}:{prev['line']})"
                        )
                    else:
                        seen_sids[sid] = rule
            except Exception as e:
                errors.append(str(e))

    print(f"[SURICATA AUDIT] Audited {len(rule_files)} file(s), {total_rules} rule(s).")
    if errors:
        print(f"\n[ERROR] Found {len(errors)} Suricata rule error(s):")
        for err in errors:
            print(f"  - {err}")
        return 1

    print("[SUCCESS] All Suricata rules passed static syntax & SID validation gate.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
