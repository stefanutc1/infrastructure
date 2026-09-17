#!/usr/bin/env python3
"""
CTF PCAP / Network Packet Analyzer
Extrage cereri HTTP (GET/POST), query-uri DNS, credențiale în clar și flag-uri din capturi de rețea.
"""

import sys
import os
import re
import argparse

FLAG_REGEX = re.compile(r'(?:FLAG|ALGO|CTF|cyber)\{[^}]+\}', re.IGNORECASE)

def raw_pcap_scan(filepath: str):
    """Scanare binară brută rapidă pentru PCAP fără dependențe externe."""
    print(f"[*] Scanare directă stream binar pentru: {os.path.basename(filepath)}...")
    with open(filepath, 'rb') as f:
        data = f.read()

    # Căutare flag-uri
    text = data.decode('latin-1', errors='ignore')
    flags = set(FLAG_REGEX.findall(text))
    if flags:
        print(f"\n[!] 🚩 FLAG(URI) DETECTATE ÎN PCAP:")
        for fl in flags:
            print(f"    -> {fl}")
    else:
        print("[-] Niciun flag evident găsit în stream-ul brut.")

    # Căutare cereri HTTP
    http_requests = re.findall(r'(?:GET|POST|PUT|HEAD)\s+[^\s\r\n]+\s+HTTP/1\.[01]', text)
    if http_requests:
        print(f"\n🌐 Cereri HTTP identificate ({len(http_requests)}):")
        for req in http_requests[:15]:
            print(f"  • {req}")
        if len(http_requests) > 15:
            print(f"  ... și încă {len(http_requests)-15} cereri.")

    # Căutare parole / autentificări
    creds = re.findall(r'(?:password|passwd|user|username|auth|token)=([^\s&]+)', text, re.IGNORECASE)
    if creds:
        print(f"\n🔑 Posibile credențiale/token-uri transmise:")
        for c in set(creds)[:10]:
            print(f"  • {c}")

def scapy_deep_analysis(filepath: str):
    """Analiză detaliată folosind biblioteca Scapy (dacă este instalată)."""
    try:
        from scapy.all import rdpcap, IP, TCP, UDP, DNS, Raw
    except ImportError:
        print("[*] Scapy nu este instalat în mediu. Se folosește modul de scanare binară rapidă.")
        raw_pcap_scan(filepath)
        return

    print(f"[*] Analiză Scapy avansată pentru: {filepath}...")
    try:
        packets = rdpcap(filepath)
    except Exception as e:
        print(f"[-] Eroare la deschiderea cu Scapy: {e}")
        raw_pcap_scan(filepath)
        return

    print(f"[+] Total pachete încărcate: {len(packets)}")
    dns_queries = set()
    http_payloads = []

    for pkt in packets:
        # DNS
        if pkt.haslayer(DNS) and pkt.getlayer(DNS).qd:
            qname = pkt.getlayer(DNS).qd.qname.decode('utf-8', errors='ignore')
            dns_queries.add(qname)

        # Raw Payload / HTTP
        if pkt.haslayer(Raw):
            payload = pkt.getlayer(Raw).load
            text = payload.decode('latin-1', errors='ignore')
            
            # Căutare flag
            m = FLAG_REGEX.findall(text)
            if m:
                print(f"[!] 🚩 FLAG GĂSIT în pachetul #{packets.index(pkt)}: {m}")

            if any(text.startswith(m) for m in ["GET ", "POST ", "HTTP/1."]):
                http_payloads.append(text[:200])

    if dns_queries:
        print(f"\n📡 Query-uri DNS ({len(dns_queries)}):")
        for d in list(dns_queries)[:10]:
            print(f"  • {d}")

    if http_payloads:
        print(f"\n🌐 Fluxuri HTTP detectate ({len(http_payloads)}):")
        for h in http_payloads[:8]:
            first_line = h.split('\r\n')[0]
            print(f"  • {first_line}")

def main():
    parser = argparse.ArgumentParser(description="CTF PCAP / Network Packet Analyzer")
    parser.add_argument("pcap", help="Fișier .pcap sau .pcapng")
    parser.add_argument("--raw", action="store_true", help="Forțează scanarea binară brută fără Scapy")

    args = parser.parse_args()

    if not os.path.exists(args.pcap):
        print(f"[-] Fișierul nu există: {args.pcap}")
        sys.exit(1)

    if args.raw:
        raw_pcap_scan(args.pcap)
    else:
        scapy_deep_analysis(args.pcap)

if __name__ == "__main__":
    main()
