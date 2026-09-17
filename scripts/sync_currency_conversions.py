#!/usr/bin/env python3
"""
Currency Conversion Synchronizer for CI/CD Pipeline.

Automatically detects and synchronizes currency conversions in markdown documentation
against live foreign exchange rates.
Example patterns detected and kept in sync:
  - 4 RON (~$0.85) -> 4 RON (~$0.88)
  - 10 RON (~$2.12) -> 10 RON (~$2.19)
  - 118 RON (~€24) -> 118 RON (~€22)
  - ~21 EUR (~105 RON) -> ~21 EUR (~111 RON)
  - 21 EUR (~$23.00) -> 21 EUR (~$22.85)

APIs used (with automated failover):
  1. https://open.er-api.com/v6/latest/RON
  2. https://api.exchangerate-api.com/v4/latest/RON
  3. https://api.frankfurter.dev/v1/latest?base=RON

Usage:
  python3 scripts/sync_currency_conversions.py          # Auto-update all .md files in repo
  python3 scripts/sync_currency_conversions.py --check  # Verify up-to-date (exits 1 on diff)
  python3 scripts/sync_currency_conversions.py --file <path>
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

EXCHANGE_APIS = [
    "https://open.er-api.com/v6/latest/RON",
    "https://api.exchangerate-api.com/v4/latest/RON",
    "https://api.frankfurter.dev/v1/latest?base=RON",
]

EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    "dist",
    ".venv",
    ".system_generated",
    "target",
    "cache",
    ".cache",
}


def fetch_exchange_rates() -> dict[str, float]:
    """Fetches live exchange rates with RON as base currency."""
    for url in EXCHANGE_APIS:
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Datacenter-CICD-CurrencySync/1.0"},
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    rates = data.get("rates", {})
                    if "USD" in rates and "EUR" in rates:
                        rates["RON"] = 1.0
                        print(
                            f"[INFO] Successfully retrieved exchange rates from {url}:"
                            f" USD={rates['USD']:.4f}, EUR={rates['EUR']:.4f}"
                        )
                        return rates
        except Exception as exc:
            print(f"[WARN] Failed to fetch rates from {url}: {exc}")

    print("[ERROR] All exchange rate APIs failed. Proceeding with static fallback.")
    return {
        "RON": 1.0,
        "USD": 0.2192,
        "EUR": 0.1900,
    }


def clean_number(num_str: str) -> float:
    """Sanitizes string number into float."""
    cleaned = num_str.replace("~", "").replace(",", ".").strip()
    return float(cleaned)


def format_converted(amount: float, curr_symbol: str, orig_sample: str) -> str:
    """Formats converted amount maintaining appropriate decimal precision."""
    has_decimal = "." in orig_sample or "," in orig_sample
    if curr_symbol in ("$", "USD"):
        return f"{amount:.2f}"
    elif curr_symbol in ("€", "EUR"):
        if not has_decimal and amount >= 10:
            return f"{round(amount)}"
        return f"{amount:.2f}"
    elif curr_symbol == "RON":
        if not has_decimal:
            return f"{round(amount)}"
        return f"{amount:.2f}"
    else:
        return f"{amount:.2f}"


def build_converters(rates: dict[str, float]):
    """Returns regex transform functions based on current rates."""

    def get_rate(from_c: str, to_c: str) -> float:
        return rates[to_c] / rates[from_c]

    def repl_ron_to_usd(match: re.Match) -> str:
        base_val = clean_number(match.group(1))
        tilde = match.group(2)
        orig_val_str = match.group(3)
        target_curr = match.group(4) if match.lastindex >= 4 else "$"
        converted = base_val * get_rate("RON", "USD")
        formatted_val = format_converted(converted, "USD", orig_val_str)

        if target_curr == "$":
            return f"{match.group(1)} RON ({tilde}${formatted_val})"
        else:
            return f"{match.group(1)} RON ({tilde}{formatted_val} USD)"

    def repl_ron_to_eur(match: re.Match) -> str:
        base_val = clean_number(match.group(1))
        tilde = match.group(2)
        orig_val_str = match.group(3)
        target_curr = match.group(4) if match.lastindex >= 4 else "€"
        converted = base_val * get_rate("RON", "EUR")
        formatted_val = format_converted(converted, "EUR", orig_val_str)

        if target_curr == "€":
            return f"{match.group(1)} RON ({tilde}€{formatted_val})"
        else:
            return f"{match.group(1)} RON ({tilde}{formatted_val} EUR)"

    def repl_eur_to_ron(match: re.Match) -> str:
        lead_prefix = match.group(1)
        base_val = clean_number(lead_prefix)
        tilde = match.group(2)
        orig_val_str = match.group(3)
        converted = base_val * get_rate("EUR", "RON")
        formatted_val = format_converted(converted, "RON", orig_val_str)
        return f"{lead_prefix} EUR ({tilde}{formatted_val} RON)"

    def repl_eur_to_usd(match: re.Match) -> str:
        lead_prefix = match.group(1)
        base_val = clean_number(lead_prefix)
        tilde = match.group(2)
        orig_val_str = match.group(3)
        converted = base_val * get_rate("EUR", "USD")
        formatted_val = format_converted(converted, "USD", orig_val_str)
        return f"{lead_prefix} EUR ({tilde}${formatted_val})"

    def repl_usd_to_ron(match: re.Match) -> str:
        lead_prefix = match.group(1)
        base_val = clean_number(lead_prefix.replace("$", ""))
        tilde = match.group(2)
        orig_val_str = match.group(3)
        converted = base_val * get_rate("USD", "RON")
        formatted_val = format_converted(converted, "RON", orig_val_str)
        return f"{lead_prefix} ({tilde}{formatted_val} RON)"

    def repl_usd_to_eur(match: re.Match) -> str:
        lead_prefix = match.group(1)
        base_val = clean_number(lead_prefix.replace("$", ""))
        tilde = match.group(2)
        orig_val_str = match.group(3)
        target_curr = match.group(4) if match.lastindex >= 4 else "€"
        converted = base_val * get_rate("USD", "EUR")
        formatted_val = format_converted(converted, "EUR", orig_val_str)
        if target_curr == "€":
            return f"{lead_prefix} ({tilde}€{formatted_val})"
        else:
            return f"{lead_prefix} ({tilde}{formatted_val} EUR)"

    transforms = [
        # Pattern 1: X RON (~$Y)
        (
            re.compile(r"(\b\d+(?:[\.,]\d+)?)\s*RON\s*\(\s*(~?)\s*\$\s*([0-9\.,]+)\s*\)", re.IGNORECASE),
            lambda m: repl_ron_to_usd(re.match(r"(\b\d+(?:[\.,]\d+)?)\s*RON\s*\(\s*(~?)\s*\$\s*([0-9\.,]+)\s*\)", m.group(0))),
        ),
        # Pattern 2: X RON (~Y USD)
        (
            re.compile(r"(\b\d+(?:[\.,]\d+)?)\s*RON\s*\(\s*(~?)\s*([0-9\.,]+)\s*USD\s*\)", re.IGNORECASE),
            lambda m: repl_ron_to_usd(re.match(r"(\b\d+(?:[\.,]\d+)?)\s*RON\s*\(\s*(~?)\s*([0-9\.,]+)\s*(USD)\s*\)", m.group(0))),
        ),
        # Pattern 3: X RON (~€Y)
        (
            re.compile(r"(\b\d+(?:[\.,]\d+)?)\s*RON\s*\(\s*(~?)\s*€\s*([0-9\.,]+)\s*\)", re.IGNORECASE),
            lambda m: repl_ron_to_eur(re.match(r"(\b\d+(?:[\.,]\d+)?)\s*RON\s*\(\s*(~?)\s*€\s*([0-9\.,]+)\s*\)", m.group(0))),
        ),
        # Pattern 4: X RON (~Y EUR)
        (
            re.compile(r"(\b\d+(?:[\.,]\d+)?)\s*RON\s*\(\s*(~?)\s*([0-9\.,]+)\s*EUR\s*\)", re.IGNORECASE),
            lambda m: repl_ron_to_eur(re.match(r"(\b\d+(?:[\.,]\d+)?)\s*RON\s*\(\s*(~?)\s*([0-9\.,]+)\s*(EUR)\s*\)", m.group(0))),
        ),
        # Pattern 5: ~X EUR (~Y RON) or X EUR (~Y RON)
        (
            re.compile(r"((?:~\s*)?\b\d+(?:[\.,]\d+)?)\s*EUR\s*\(\s*(~?)\s*([0-9\.,]+)\s*RON\s*\)", re.IGNORECASE),
            lambda m: repl_eur_to_ron(re.match(r"((?:~\s*)?\b\d+(?:[\.,]\d+)?)\s*EUR\s*\(\s*(~?)\s*([0-9\.,]+)\s*RON\s*\)", m.group(0))),
        ),
        # Pattern 6: ~X EUR (~$Y) or X EUR (~$Y)
        (
            re.compile(r"((?:~\s*)?\b\d+(?:[\.,]\d+)?)\s*EUR\s*\(\s*(~?)\s*\$\s*([0-9\.,]+)\s*\)", re.IGNORECASE),
            lambda m: repl_eur_to_usd(re.match(r"((?:~\s*)?\b\d+(?:[\.,]\d+)?)\s*EUR\s*\(\s*(~?)\s*\$\s*([0-9\.,]+)\s*\)", m.group(0))),
        ),
        # Pattern 7: $X (~Y RON)
        (
            re.compile(r"((?:~\s*)?\$\s*\d+(?:[\.,]\d+)?)\s*\(\s*(~?)\s*([0-9\.,]+)\s*RON\s*\)", re.IGNORECASE),
            lambda m: repl_usd_to_ron(re.match(r"((?:~\s*)?\$\s*\d+(?:[\.,]\d+)?)\s*\(\s*(~?)\s*([0-9\.,]+)\s*RON\s*\)", m.group(0))),
        ),
        # Pattern 8: $X (~€Y)
        (
            re.compile(r"((?:~\s*)?\$\s*\d+(?:[\.,]\d+)?)\s*\(\s*(~?)\s*€\s*([0-9\.,]+)\s*\)", re.IGNORECASE),
            lambda m: repl_usd_to_eur(re.match(r"((?:~\s*)?\$\s*\d+(?:[\.,]\d+)?)\s*\(\s*(~?)\s*€\s*([0-9\.,]+)\s*\)", m.group(0))),
        ),
    ]

    return transforms


def process_prose(text: str, transforms) -> str:
    for pattern, repl_fn in transforms:
        text = pattern.sub(repl_fn, text)
    return text


def sync_file(file_path: Path, transforms, check_only: bool = False) -> bool:
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as exc:
        print(f"[WARN] Skipping {file_path} (read error: {exc})")
        return False

    # Split markdown into code blocks (odd indices) vs prose (even indices)
    parts = re.split(r"(```[\s\S]*?```)", content)
    for i in range(0, len(parts), 2):
        parts[i] = process_prose(parts[i], transforms)

    new_content = "".join(parts)

    if new_content != content:
        rel_path = file_path.relative_to(REPO_ROOT)
        print(f"[SYNC] Changes detected in: {rel_path}")
        if not check_only:
            file_path.write_text(new_content, encoding="utf-8")
            print(f"       -> Updated {rel_path} successfully.")
        return True
    return False


def main():
    parser = argparse.ArgumentParser(
        description="Synchronize currency conversions across repository markdown files."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check only without modifying files (exit 1 if updates needed).",
    )
    parser.add_argument(
        "--file",
        type=str,
        help="Target a specific markdown file.",
    )
    args = parser.parse_args()

    rates = fetch_exchange_rates()
    transforms = build_converters(rates)

    changed_files = 0

    if args.file:
        target_path = Path(args.file)
        if not target_path.is_absolute():
            target_path = REPO_ROOT / target_path
        if target_path.exists():
            if sync_file(target_path, transforms, check_only=args.check):
                changed_files += 1
        else:
            print(f"[ERROR] File not found: {target_path}")
            sys.exit(2)
    else:
        for md_path in REPO_ROOT.rglob("*.md"):
            if any(ex in md_path.parts for ex in EXCLUDE_DIRS):
                continue
            if sync_file(md_path, transforms, check_only=args.check):
                changed_files += 1

    if changed_files > 0:
        print(f"\n[SUMMARY] {changed_files} file(s) updated/identified with fresh currency conversions.")
        if args.check:
            print("[CHECK] Currency conversions differ from live rates. Run without --check to apply.")
            sys.exit(1)
    else:
        print("\n[SUMMARY] All currency conversions are fully synchronized with live exchange rates.")
        sys.exit(0)


if __name__ == "__main__":
    main()
