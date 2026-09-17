#!/usr/bin/env python3
"""
Safari Social Feed & Sponsored Ad Crawler
==========================================
Automates Safari on macOS to inspect active social media feeds (Facebook, Instagram,
TikTok), progressively scrolling dynamic feeds and extracting rendered DOM trees
via native clipboard serialization (supporting headless or sandboxed automation
where AppleEvents JS execution is restricted).

Usage:
    python3 safari_feed_crawler.py --tab 1 --scrolls 15 --output fb_feed.html
    python3 safari_feed_crawler.py --all --scrolls 20 --outdir ./dumps
"""

import argparse
import os
import re
import subprocess
import time
from pathlib import Path


def focus_safari_tab(tab_index: int):
    """Activates Safari and sets the front window to the target tab index."""
    script = f'''
    tell application "Safari"
        activate
        set current tab of front window to tab {tab_index} of front window
    end tell
    delay 0.8
    tell application "System Events"
        set frontmost of process "Safari" to true
    end tell
    '''
    subprocess.run(["osascript", "-e", script], check=True)


def scroll_and_copy(scroll_times: int = 15, delay_per_scroll: float = 0.8) -> tuple:
    """
    Simulates keyboard page scrolling down the dynamic social media feed,
    selects rendered content (Cmd+A), and copies to clipboard (Cmd+C).
    Returns (raw_html, raw_text).
    """
    scroll_script = f'''
    tell application "System Events"
        repeat {scroll_times} times
            key code 121 -- Page Down
            delay {delay_per_scroll}
        end repeat
        delay 1.0
        keystroke "a" using command down
        delay 0.3
        keystroke "c" using command down
        delay 0.3
    end tell
    '''
    subprocess.run(["osascript", "-e", scroll_script], check=True)
    time.sleep(0.5)

    # Extract plain text
    txt_proc = subprocess.run(["pbpaste"], capture_output=True, text=True)
    text_content = txt_proc.stdout

    # Extract HTML data from clipboard
    html_content = ""
    html_proc = subprocess.run(["osascript", "-e", "get the clipboard as «class HTML»"],
                               capture_output=True, text=True)
    raw = html_proc.stdout.strip()
    if raw.startswith("«data HTML") and raw.endswith("»"):
        hex_data = raw[10:-1]
        html_content = bytes.fromhex(hex_data).decode("utf-8", errors="ignore")

    return html_content, text_content


def main():
    parser = argparse.ArgumentParser(description="Safari Social Feed Crawler & Ad Extractor")
    parser.add_argument("--tab", type=int, default=1, help="Safari tab index to target (1-based)")
    parser.add_argument("--all", action="store_true", help="Crawl tabs 1, 2, and 3 sequentially")
    parser.add_argument("--scrolls", type=int, default=15, help="Number of Page Down keystrokes")
    parser.add_argument("--delay", type=float, default=0.7, help="Delay in seconds between scrolls")
    parser.add_argument("--outdir", default="/tmp/feed_dumps", help="Directory to save extracted feeds")
    args = parser.parse_args()

    outpath = Path(args.outdir)
    outpath.mkdir(parents=True, exist_ok=True)

    tabs = [1, 2, 3] if args.all else [args.tab]

    for t in tabs:
        print(f"[*] Navigating to Safari Tab {t}...")
        focus_safari_tab(t)
        print(f"[*] Scrolling {args.scrolls} times with {args.delay}s delay...")
        html, text = scroll_and_copy(args.scrolls, args.delay)

        html_file = outpath / f"tab_{t}_rendered.html"
        text_file = outpath / f"tab_{t}_rendered.txt"

        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html)
        with open(text_file, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"[+] Tab {t} saved: {html_file} ({len(html)} bytes), {text_file} ({len(text)} chars)")


if __name__ == "__main__":
    main()
