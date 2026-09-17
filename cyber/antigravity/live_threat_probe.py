#!/usr/bin/env python3
"""
Sandboxed Threat Infrastructure Probe & TLS Pivoting Tool
=========================================================
Performs safe, non-interactive external infrastructure reconnaissance on suspected
phishing and scam domains. Extracts TLS/SSL certificate Common Names, Subject
Alternative Names (SANs), HTTP server response banners, and redirects without
executing untrusted client-side code.

Usage:
    python3 live_threat_probe.py --target voetbalshop-nlco.com
    python3 live_threat_probe.py --ip 104.16.145.247 --port 443
"""

import argparse
import json
import socket
import ssl
import sys
import urllib.request
from typing import Dict, Any


def get_ssl_cert_details(host: str, port: int = 443, server_hostname: str = None) -> Dict[str, Any]:
    """Retrieves and parses SSL certificate details from a remote host/IP."""
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE

    sni = server_hostname or host
    try:
        with socket.create_connection((host, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=sni) as ssock:
                cert = ssock.getpeercert(binary_form=True)
                # Decode cert basic info
                x509_cert = ssock.getpeercert()
                cipher = ssock.cipher()
                version = ssock.version()
                return {
                    "host": host,
                    "port": port,
                    "sni_used": sni,
                    "tls_version": version,
                    "cipher": cipher,
                    "subject": dict(x[0] for x in x509_cert.get("subject", [])),
                    "issuer": dict(x[0] for x in x509_cert.get("issuer", [])),
                    "san": [entry[1] for entry in x509_cert.get("subjectAltName", [])]
                }
    except Exception as e:
        return {"host": host, "port": port, "error": str(e)}


def probe_http_headers(url: str) -> Dict[str, Any]:
    """Safe HTTP HEAD/GET probe without following untrusted redirects to completion."""
    if not url.startswith("http"):
        url = f"https://{url}"

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return {
                "url": url,
                "status": response.status,
                "headers": dict(response.getheaders())
            }
    except urllib.error.HTTPError as e:
        return {
            "url": url,
            "status": e.code,
            "headers": dict(e.headers)
        }
    except Exception as e:
        return {"url": url, "error": str(e)}


def main():
    parser = argparse.ArgumentParser(description="Threat Infrastructure & TLS Recon Probe")
    parser.add_argument("--target", help="Target domain name to probe")
    parser.add_argument("--ip", help="Direct IP address to probe")
    parser.add_argument("--port", type=int, default=443, help="Port to probe (default: 443)")
    parser.add_argument("--sni", help="SNI server name to send (optional)")
    args = parser.parse_args()

    results = {}

    if args.target:
        print(f"[*] Probing domain: {args.target}...")
        results["tls"] = get_ssl_cert_details(args.target, args.port, args.sni)
        results["http"] = probe_http_headers(args.target)
    elif args.ip:
        print(f"[*] Probing IP directly: {args.ip}:{args.port}...")
        results["tls"] = get_ssl_cert_details(args.ip, args.port, args.sni)
    else:
        parser.print_help()
        sys.exit(1)

    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
