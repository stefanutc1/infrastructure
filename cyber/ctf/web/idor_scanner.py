#!/usr/bin/env python3
"""
CTF IDOR (Insecure Direct Object Reference) Scanner
Iterează prin identificatori numerici sau liste de utilizatori și raportează discrepanțele de răspuns sau flag-urile găsite.
"""

import sys
import re
import argparse
import requests

FLAG_REGEX = re.compile(r'(?:FLAG|ALGO|CTF|cyber)\{[^}]+\}', re.IGNORECASE)

def scan_idor(url_pattern, start_id, end_id, cookies_str="", method="GET"):
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) CTF-IDOR/1.0'
    })

    cookies = {}
    if cookies_str:
        for c in cookies_str.split(';'):
            if '=' in c:
                k, v = c.strip().split('=', 1)
                cookies[k] = v

    print(f"[*] Scanare IDOR pe intervalul [{start_id} .. {end_id}]...")
    baseline_length = None
    baseline_count = 0

    for current_id in range(start_id, end_id + 1):
        target = url_pattern.replace("{ID}", str(current_id)).replace("FUZZ", str(current_id))
        try:
            if method.upper() == "GET":
                resp = session.get(target, cookies=cookies, timeout=5, allow_redirects=False)
            else:
                resp = session.post(target, cookies=cookies, timeout=5, allow_redirects=False)

            content_len = len(resp.content)
            flags = FLAG_REGEX.findall(resp.text)

            # Notificare imediată dacă găsim flag
            if flags:
                print(f"\n[!] 🚩 FLAG GĂSIT la ID {current_id} ({target}): {flags}\n")

            # Analiză diferențială
            if baseline_length is None and resp.status_code == 200:
                baseline_length = content_len

            if resp.status_code not in [404, 403]:
                is_anomaly = (baseline_length is not None and abs(content_len - baseline_length) > 15)
                marker = "⭐ [ANOMALIE]" if is_anomaly else "  "
                print(f"{marker} ID: {current_id:<4} | Status: {resp.status_code} | Len: {content_len:<6} | URL: {target}")

        except Exception as e:
            print(f"[!] Eroare la ID {current_id}: {e}")

def main():
    parser = argparse.ArgumentParser(description="CTF IDOR Enumerator & Scanner")
    parser.add_argument("url", help="URL țintă conținând '{ID}' sau 'FUZZ' (ex: http://target.local/profile?id={ID})")
    parser.add_argument("--start", type=int, default=1, help="ID de pornire (default: 1)")
    parser.add_argument("--end", type=int, default=50, help="ID final (default: 50)")
    parser.add_argument("-c", "--cookies", default="", help="Cookie de sesiune pentru autentificare")
    parser.add_argument("-m", "--method", default="GET", choices=["GET", "POST"], help="Metoda HTTP")

    args = parser.parse_args()
    scan_idor(args.url, args.start, args.end, cookies_str=args.cookies, method=args.method)

if __name__ == "__main__":
    main()
