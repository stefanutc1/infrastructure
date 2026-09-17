#!/usr/bin/env python3
"""
TCP Socket Challenge Solver Template
Ideal pentru provocări de tip netcat (nc host port) care cer răspunsuri rapide sau automatizări.
"""

import socket
import re
import sys
import argparse

FLAG_REGEX = re.compile(r'(?:FLAG|ALGO|CTF|cyber)\{[^}]+\}', re.IGNORECASE)

class SocketClient:
    def __init__(self, host: str, port: int, timeout: float = 5.0):
        self.host = host
        self.port = port
        self.timeout = timeout
        self.sock = None

    def connect(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.settimeout(self.timeout)
        self.sock.connect((self.host, self.port))
        print(f"[+] Conectat la {self.host}:{self.port}")

    def recv_until(self, delimiter: bytes = b'\n') -> bytes:
        buf = bytearray()
        while True:
            chunk = self.sock.recv(1)
            if not chunk:
                break
            buf.extend(chunk)
            if buf.endswith(delimiter):
                break
        text = buf.decode('utf-8', errors='ignore')
        for match in FLAG_REGEX.findall(text):
            print(f"\n[!] 🚩 FLAG GĂSIT: {match}\n")
        return bytes(buf)

    def recv_all(self, buffer_size: int = 4096) -> bytes:
        try:
            data = self.sock.recv(buffer_size)
            text = data.decode('utf-8', errors='ignore')
            for match in FLAG_REGEX.findall(text):
                print(f"\n[!] 🚩 FLAG GĂSIT: {match}\n")
            return data
        except socket.timeout:
            return b""

    def send_line(self, line: str):
        if not line.endswith('\n'):
            line += '\n'
        self.sock.sendall(line.encode('utf-8'))

    def close(self):
        if self.sock:
            self.sock.close()

def solve(host: str, port: int):
    client = SocketClient(host, port)
    client.connect()

    try:
        banner = client.recv_all()
        print(f"[*] Banner primit:\n{banner.decode('utf-8', errors='ignore')}")

        # TODO: Implementează logica de interacțiune
        # Exemplu buclă automată:
        # while True:
        #     prompt = client.recv_until(b': ').decode('utf-8', errors='ignore')
        #     if not prompt:
        #         break
        #     # Rezolvă ecuație sau trimite payload
        #     client.send_line("raspuns")

    except KeyboardInterrupt:
        print("\n[*] Oprit de utilizator.")
    finally:
        client.close()

def main():
    parser = argparse.ArgumentParser(description="TCP Socket Challenge Solver Template")
    parser.add_argument("host", help="Adresa IP sau hostname")
    parser.add_argument("port", type=int, help="Portul serverului")
    args = parser.parse_args()

    solve(args.host, args.port)

if __name__ == "__main__":
    main()
