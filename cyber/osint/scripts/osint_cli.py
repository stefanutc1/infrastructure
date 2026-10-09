#!/usr/bin/env python3
"""
OSINT Command Line Interface
Autonomous OSINT & Threat Intelligence Gathering Engine
"""

import argparse
import json
import sys
from pathlib import Path

# Add lib directory to path
LIB_PATH = Path(__file__).resolve().parent.parent / "lib"
sys.path.insert(0, str(LIB_PATH))

from entity_extractor import EntityExtractor
from admiralty import AdmiraltyEvaluator
from passive_intel import PassiveIntelEngine
from synthesis import IntelligenceSynthesizer


def cmd_extract(args):
    extractor = EntityExtractor()
    content = ""
    if args.file:
        content = Path(args.file).read_text(encoding="utf-8", errors="ignore")
    elif args.text:
        content = args.text
    else:
        content = sys.stdin.read()

    res = extractor.extract_summary(content)
    print(json.dumps(res, indent=2))
    sys.exit(0)


def cmd_score(args):
    evaluator = AdmiraltyEvaluator()
    try:
        res = evaluator.evaluate(args.code)
        print(json.dumps(res, indent=2))
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


def cmd_recon(args):
    recon_engine = PassiveIntelEngine(offline_mode=args.offline)
    profile = recon_engine.profile_infrastructure(args.target)
    dns_res = recon_engine.passive_resolve_dns(args.target)
    output = {
        "reconnaissance_profile": profile,
        "dns_resolution": dns_res
    }
    print(json.dumps(output, indent=2))


def cmd_synthesize(args):
    synthesizer = IntelligenceSynthesizer()
    content = ""
    if args.file:
        content = Path(args.file).read_text(encoding="utf-8", errors="ignore")
    elif args.text:
        content = args.text
    else:
        content = sys.stdin.read()

    briefing = synthesizer.generate_briefing(
        title=args.title or "Automated OSINT Threat Intelligence Dossier",
        raw_text=content,
        admiralty_code=args.code or "B2",
        tlp_level=args.tlp or "TLP:AMBER",
        analyst=args.analyst or "stefanutc1"
    )
    print(json.dumps(briefing, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Autonomous OSINT Intelligence Framework CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Extract command
    ext_p = subparsers.add_parser("extract", help="Extract cyber entities and IOCs from text or file")
    ext_p.add_argument("--file", "-f", help="Target input file")
    ext_p.add_argument("--text", "-t", help="Raw input string")

    # Score command
    score_p = subparsers.add_parser("score", help="Score source reliability and credibility using Admiralty Code")
    score_p.add_argument("--code", "-c", required=True, help="Admiralty code (e.g. A1, B2, C3)")

    # Recon command
    recon_p = subparsers.add_parser("recon", help="Passive infrastructure reconnaissance profiling")
    recon_p.add_argument("--target", "-t", required=True, help="Target domain or hostname")
    recon_p.add_argument("--offline", action="store_true", default=True, help="Execute in offline mock mode")

    # Synthesize command
    syn_p = subparsers.add_parser("synthesize", help="Synthesize structured threat intelligence dossier")
    syn_p.add_argument("--title", help="Dossier title")
    syn_p.add_argument("--file", "-f", help="Notes or log file")
    syn_p.add_argument("--text", "-t", help="Raw string")
    syn_p.add_argument("--code", "-c", default="B2", help="Admiralty Code (default: B2)")
    syn_p.add_argument("--tlp", default="TLP:AMBER", help="Traffic Light Protocol classification")
    syn_p.add_argument("--analyst", default="stefanutc1", help="Analyst attribution")

    args = parser.parse_args()
    if args.command == "extract":
        cmd_extract(args)
    elif args.command == "score":
        cmd_score(args)
    elif args.command == "recon":
        cmd_recon(args)
    elif args.command == "synthesize":
        cmd_synthesize(args)


if __name__ == "__main__":
    main()
