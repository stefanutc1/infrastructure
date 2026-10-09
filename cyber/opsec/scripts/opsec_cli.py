#!/usr/bin/env python3
"""
OPSEC Command Line Interface
Autonomous OPSEC & AI Countermeasure Framework
"""

import argparse
import json
import sys
from pathlib import Path

# Add lib directory to path
LIB_PATH = Path(__file__).resolve().parent.parent / "lib"
sys.path.insert(0, str(LIB_PATH))

from sanitizer import OpsecSanitizer
from canary import CanaryManager
from prompt_guard import PromptGuard


def cmd_scan(args):
    sanitizer = OpsecSanitizer()
    content = ""
    if args.file:
        content = Path(args.file).read_text(encoding="utf-8", errors="ignore")
    elif args.text:
        content = args.text
    else:
        content = sys.stdin.read()

    findings = sanitizer.detect_secrets(content)
    print(json.dumps({"total_findings": len(findings), "findings": findings}, indent=2))
    sys.exit(1 if findings else 0)


def cmd_sanitize(args):
    sanitizer = OpsecSanitizer()
    if args.file:
        p = Path(args.file)
        success, count = sanitizer.sanitize_file(str(p), args.output)
        print(f"Sanitization complete: {count} secrets scrubbed. Output written to {args.output or str(p)}.")
    elif args.text:
        print(sanitizer.sanitize(args.text))
    else:
        raw = sys.stdin.read()
        print(sanitizer.sanitize(raw))


def cmd_canary_gen(args):
    mgr = CanaryManager()
    token = mgr.generate_token(label=args.label or "generic_canary")
    print(f"CANARY_TOKEN={token}")


def cmd_prompt_audit(args):
    guard = PromptGuard()
    content = args.prompt or sys.stdin.read()
    result = guard.evaluate_prompt(content)
    print(json.dumps(result, indent=2))
    sys.exit(1 if result["verdict"] == "BLOCK_INJECTION_DETECTED" else 0)


def main():
    parser = argparse.ArgumentParser(description="Autonomous OPSEC & AI Security CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Scan command
    scan_p = subparsers.add_parser("scan", help="Scan text or file for sensitive secrets and tokens")
    scan_p.add_argument("--file", "-f", help="Target file path")
    scan_p.add_argument("--text", "-t", help="Raw input string")

    # Sanitize command
    san_p = subparsers.add_parser("sanitize", help="Scrub sensitive data from file or text")
    san_p.add_argument("--file", "-f", help="Target file path")
    san_p.add_argument("--output", "-o", help="Destination file path")
    san_p.add_argument("--text", "-t", help="Raw input string")

    # Canary command
    canary_p = subparsers.add_parser("canary-gen", help="Generate honeypot canary token")
    canary_p.add_argument("--label", "-l", default="cli_generated", help="Canary token label")

    # Prompt audit command
    prompt_p = subparsers.add_parser("prompt-audit", help="Audit AI agent prompt input against injections")
    prompt_p.add_argument("--prompt", "-p", help="Prompt content to evaluate")

    args = parser.parse_args()
    if args.command == "scan":
        cmd_scan(args)
    elif args.command == "sanitize":
        cmd_sanitize(args)
    elif args.command == "canary-gen":
        cmd_canary_gen(args)
    elif args.command == "prompt-audit":
        cmd_prompt_audit(args)


if __name__ == "__main__":
    main()
