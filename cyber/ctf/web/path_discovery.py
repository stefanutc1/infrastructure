#!/usr/bin/env python3
"""
CTF Quick Path & Secret File Discovery
Scaner rapid concentrat pe fișiere și endpoint-uri ascunse tipice pentru competițiile Jeopardy.
"""

import sys
import re
import argparse
from concurrent.futures import ThreadPoolExecutor
import requests

DEFAULT_CTF_PATHS = [
    # Git & VCS leaks
    ".git/HEAD",
    ".git/config",
    ".git/index",
    ".svn/entries",
    ".hg/",
    # Configs & Secrete
    ".env",
    ".env.example",
    ".env.local",
    ".env.backup",
    "config.json",
    "config.php",
    "configuration.php",
    # Directoare & Reguli server
    "robots.txt",
    "sitemap.xml",
    ".htaccess",
    ".htpasswd",
    # Backups & Arhive
    "backup.zip",
    "backup.tar.gz",
    "backup.sql",
    "dump.sql",
    "db.sqlite",
    "database.sqlite",
    "backup.bak",
    "index.php.bak",
    "index.php~",
    "app.py.bak",
    # Debug & Console
    "console",
    "debug",
    "admin",
    "admin/",
    "administrator",
    "phpinfo.php",
    "info.php",
    # API Documentation & Schema
    "api/",
    "api/v1/",
    "swagger.json",
    "openapi.json",
    "docs",
    # Obvious CTF files
    "flag",
    "flag.txt",
    "secret",
    "secret.txt",
    "notes.txt"
]

FLAG_REGEX = re.compile(r'(?:FLAG|ALGO|CTF|cyber)\{[^}]+\}', re.IGNORECASE)

def check_path(session, base_url, path, timeout=4):
    url = f"{base_url}/{path.lstrip('/')}"
    try:
        resp = session.get(url, timeout=timeout, allow_redirects=False)
        flags = FLAG_REGEX.findall(resp.text)
        return {
            'path': path,
            'status': resp.status_code,
            'length': len(resp.content),
            'flags': flags,
            'location': resp.headers.get('Location', '')
        }
    except Exception:
        return None

def scan_target(target_url, custom_paths=None, threads=10):
    base_url = target_url.rstrip('/')
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) CTF-Discovery/1.0'
    })

    paths = custom_paths if custom_paths else DEFAULT_CTF_PATHS
    print(f"[*] Scanare căi CTF pentru: {base_url}")
    print(f"[*] Total verificări: {len(paths)} căi | Conexiuni concurente: {threads}\n")

    found_count = 0
    with ThreadPoolExecutor(max_workers=threads) as executor:
        futures = [executor.submit(check_path, session, base_url, p) for p in paths]
        for f in futures:
            res = f.result()
            if res and res['status'] not in [404, 400]:
                found_count += 1
                flag_str = f" 🚩 FLAG GĂSIT: {res['flags']}" if res['flags'] else ""
                redir_str = f" -> {res['location']}" if res['location'] else ""
                print(f"[+] [{res['status']}] (Len: {res['length']:<6}) /{res['path']}{redir_str}{flag_str}")

    print(f"\n[+] Scanare completă. {found_count} resurse identificate.")

def main():
    parser = argparse.ArgumentParser(description="CTF Quick Path & Secret File Discovery")
    parser.add_argument("url", help="URL-ul de bază al aplicației țintă")
    parser.add_argument("-t", "--threads", type=int, default=10, help="Număr thread-uri concurente (default: 10)")
    parser.add_argument("-w", "--wordlist", help="Wordlist custom suplimentar")

    args = parser.parse_args()
    
    paths = DEFAULT_CTF_PATHS
    if args.wordlist:
        with open(args.wordlist, 'r', encoding='utf-8', errors='ignore') as f:
            extra = [line.strip() for line in f if line.strip()]
            paths = list(dict.fromkeys(DEFAULT_CTF_PATHS + extra))

    scan_target(args.url, paths, threads=args.threads)

if __name__ == "__main__":
    main()
