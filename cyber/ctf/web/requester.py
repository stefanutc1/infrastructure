#!/usr/bin/env python3
"""
Lightweight CTF HTTP Requester & Fuzzer
Suportă substituire de payload 'FUZZ', inspectare diferențială și spoofing de headere.
"""

import sys
import re
import argparse
from concurrent.futures import ThreadPoolExecutor
import requests

FLAG_REGEX = re.compile(r'(?:FLAG|ALGO|CTF|cyber)\{[^}]+\}', re.IGNORECASE)

SPOOF_HEADERS = {
    'X-Forwarded-For': '127.0.0.1',
    'X-Originating-IP': '127.0.0.1',
    'X-Remote-IP': '127.0.0.1',
    'X-Remote-Addr': '127.0.0.1',
    'X-Real-IP': '127.0.0.1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) CTF/1.0'
}

def send_request(session, method, url, data=None, headers=None, cookies=None, timeout=5):
    try:
        resp = session.request(
            method=method,
            url=url,
            data=data,
            headers=headers,
            cookies=cookies,
            timeout=timeout,
            allow_redirects=False
        )
        flags = FLAG_REGEX.findall(resp.text)
        return {
            'status': resp.status_code,
            'length': len(resp.content),
            'text': resp.text,
            'flags': flags
        }
    except Exception as e:
        return {'error': str(e)}

def run_fuzz(url, wordlist_file, method="GET", data_template=None, threads=10, cookie_str=""):
    session = requests.Session()
    
    cookies = {}
    if cookie_str:
        for item in cookie_str.split(';'):
            if '=' in item:
                k, v = item.strip().split('=', 1)
                cookies[k] = v

    with open(wordlist_file, 'r', encoding='utf-8', errors='ignore') as f:
        words = [line.strip() for line in f if line.strip()]

    print(f"[*] Pornire fuzzer pe {len(words)} intrări cu {threads} thread-uri...")

    def worker(word):
        target_url = url.replace("FUZZ", word)
        target_data = data_template.replace("FUZZ", word) if data_template else None
        res = send_request(session, method, target_url, data=target_data, cookies=cookies)
        
        if 'error' not in res:
            if res['flags']:
                print(f"\n[!] 🚩 FLAG DETECTAT cu payload '{word}': {res['flags']}")
            if res['status'] not in [404]:
                print(f"[+] [{res['status']}] Len: {res['length']:<6} | Payload: {word}")

    with ThreadPoolExecutor(max_workers=threads) as executor:
        executor.map(worker, words)

def main():
    parser = argparse.ArgumentParser(description="CTF HTTP Requester & Fuzzer")
    parser.add_argument("url", help="URL țintă (folosește 'FUZZ' ca placeholder)")
    parser.add_argument("-m", "--method", default="GET", choices=["GET", "POST", "PUT"], help="Metoda HTTP")
    parser.add_argument("-w", "--wordlist", help="Fișier wordlist pentru FUZZ")
    parser.add_argument("-d", "--data", help="Body de date POST (suportă FUZZ)")
    parser.add_argument("-c", "--cookies", default="", help="Cookie-uri (ex: 'session=123; role=admin')")
    parser.add_argument("-s", "--spoof-ip", action="store_true", help="Adaugă headere de spoofing local (X-Forwarded-For: 127.0.0.1 etc.)")
    parser.add_argument("-t", "--threads", type=int, default=8, help="Număr thread-uri concurente")

    args = parser.parse_args()

    if args.wordlist:
        run_fuzz(args.url, args.wordlist, method=args.method, data_template=args.data, threads=args.threads, cookie_str=args.cookies)
    else:
        # Request simplu
        session = requests.Session()
        req_headers = SPOOF_HEADERS if args.spoof_ip else {}
        cookies = dict(c.strip().split("=", 1) for c in args.cookies.split(";") if "=" in c)
        
        print(f"[*] Trimitere {args.method} către {args.url}...")
        res = send_request(session, args.method, args.url, data=args.data, headers=req_headers, cookies=cookies)
        
        if 'error' in res:
            print(f"[-] Eroare: {res['error']}")
        else:
            print(f"[+] Status: {res['status']} | Dimensiune: {res['length']} bytes")
            if res['flags']:
                print(f"[!] 🚩 FLAG: {res['flags']}")
            print("\n--- Primele 500 caractere răspuns ---")
            print(res['text'][:500])

if __name__ == "__main__":
    main()
