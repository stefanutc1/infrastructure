#!/usr/bin/env python3
"""
Web Challenge Exploit / Solver Template
Configurat cu requests.Session, detecție automată a flag-urilor, suport Burp Proxy și opțiuni CLI.
"""

import sys
import re
import argparse
import requests

FLAG_REGEX = re.compile(r'(?:FLAG|ALGO|CTF|cyber)\{[^}]+\}', re.IGNORECASE)

class WebSolver:
    def __init__(self, target_url: str, proxy: str = None, headers: dict = None):
        self.target_url = target_url.rstrip('/')
        self.session = requests.Session()
        
        default_headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        }
        if headers:
            default_headers.update(headers)
        self.session.headers.update(default_headers)
        
        if proxy:
            self.session.proxies = {'http': proxy, 'https': proxy}
            self.session.verify = False

    def check_flags(self, content: str) -> list:
        matches = FLAG_REGEX.findall(content)
        if matches:
            for match in matches:
                print(f"[!] 🚩 FLAG GĂSIT: {match}")
        return matches

    def get(self, endpoint: str = "", **kwargs) -> requests.Response:
        url = f"{self.target_url}/{endpoint.lstrip('/')}"
        resp = self.session.get(url, **kwargs)
        self.check_flags(resp.text)
        return resp

    def post(self, endpoint: str = "", data=None, json=None, **kwargs) -> requests.Response:
        url = f"{self.target_url}/{endpoint.lstrip('/')}"
        resp = self.session.post(url, data=data, json=json, **kwargs)
        self.check_flags(resp.text)
        return resp

    def solve(self):
        print(f"[*] Conectare la {self.target_url}...")
        resp = self.get("/")
        print(f"[+] Status răsuns inițial: {resp.status_code}, lungime: {len(resp.text)}")
        
        # TODO: Implementează pașii specifici ai provocării aici
        # Exemplu:
        # res = self.post("/login", data={"username": "' OR 1=1--", "password": "x"})
        # self.check_flags(res.text)

def main():
    parser = argparse.ArgumentParser(description="Web Challenge Solver Template")
    parser.add_argument("url", help="URL-ul țintă (ex: http://target.challenge.algocyber.ro:8000)")
    parser.add_argument("-p", "--proxy", help="Proxy HTTP (ex: http://127.0.0.1:8080 pentru Burp Suite)", default=None)
    args = parser.parse_args()

    solver = WebSolver(target_url=args.url, proxy=args.proxy)
    solver.solve()

if __name__ == "__main__":
    main()
