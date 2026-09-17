#!/usr/bin/env python3
"""
macOS Clipboard HTML Decoder & Link Extractor
============================================
Extracts and parses raw rich HTML (`«data HTML...»`) from the macOS pasteboard,
reconstructing full DOM trees and isolating outbound redirect links, tracking URLs,
and destination targets without triggering web event restrictions.

Usage:
    python3 clipboard_html_decoder.py --save /tmp/dump.html
    python3 clipboard_html_decoder.py --extract-links
"""

import argparse
import re
import subprocess
import sys
import urllib.parse
from html import unescape


def get_clipboard_html() -> str:
    """Reads raw AppleScript hex-encoded HTML data from macOS clipboard and decodes to UTF-8."""
    proc = subprocess.run(["osascript", "-e", "get the clipboard as «class HTML»"],
                          capture_output=True, text=True)
    raw = proc.stdout.strip()
    if raw.startswith("«data HTML") and raw.endswith("»"):
        hex_data = raw[10:-1]
        try:
            return bytes.fromhex(hex_data).decode("utf-8", errors="ignore")
        except ValueError as e:
            print(f"[-] Error decoding hex data: {e}", file=sys.stderr)
            return ""
    return ""


def extract_links(html_content: str) -> list:
    """Extracts all href targets, unescapes entities, and resolves outbound tracking redirects."""
    raw_hrefs = re.findall(r'href=[\"\']([^\s\"\'\>]+)', html_content)
    cleaned_links = []

    for link in raw_hrefs:
        link = unescape(link)
        # Check for Facebook outbound link redirect
        if "l.facebook.com/l.php?u=" in link:
            match = re.search(r'u=([^&]+)', link)
            if match:
                link = urllib.parse.unquote(match.group(1))
        # Check for Instagram redirect
        elif "facebook.com/ads/ig_redirect/" in link:
            match = re.search(r'u=([^&]+)', link)
            if match:
                link = urllib.parse.unquote(match.group(1))

        if link not in cleaned_links and not link.startswith("#"):
            cleaned_links.append(link)

    return cleaned_links


def main():
    parser = argparse.ArgumentParser(description="macOS Clipboard HTML Decoder")
    parser.add_argument("--save", help="Path to write decoded HTML output")
    parser.add_argument("--extract-links", action="store_true", help="Print extracted hyperlinks")
    args = parser.parse_args()

    html = get_clipboard_html()
    if not html:
        print("[-] No HTML data found on macOS clipboard.", file=sys.stderr)
        sys.exit(1)

    print(f"[+] Successfully extracted {len(html)} bytes of HTML from clipboard.")

    if args.save:
        with open(args.save, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"[+] Saved HTML to {args.save}")

    if args.extract_links:
        links = extract_links(html)
        print(f"\n[+] Extracted {len(links)} unique link targets:")
        for l in links:
            print(f"  {l}")


if __name__ == "__main__":
    main()
