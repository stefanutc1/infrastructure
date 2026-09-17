#!/usr/bin/env python3
"""
CTF Multi-Decoder & Fast Crypto Utility
Decodificări rapide pentru Base64, Hex, Binary, URL, Rot13/Caesar, XOR și Morse.
"""

import sys
import base64
import binascii
import urllib.parse
import html
import re
import argparse

FLAG_REGEX = re.compile(r'(?:FLAG|ALGO|CTF|cyber)\{[^}]+\}', re.IGNORECASE)

MORSE_DICT = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
    '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
    '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
    '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
    '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
    '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
    '---..': '8', '----.': '9', '.-.-.-': '.', '--..--': ',', '..--..': '?'
}

def try_base64(s: str):
    clean = s.strip()
    try:
        decoded = base64.b64decode(clean, validate=True).decode('utf-8', errors='ignore')
        if any(c.isprintable() for c in decoded):
            return decoded
    except Exception:
        pass
    return None

def try_hex(s: str):
    clean = re.sub(r'[\s:0x]', '', s.strip())
    try:
        decoded = bytes.fromhex(clean).decode('utf-8', errors='ignore')
        if any(c.isprintable() for c in decoded):
            return decoded
    except Exception:
        pass
    return None

def try_binary(s: str):
    tokens = re.findall(r'[01]{8}', s)
    if len(tokens) >= 2:
        try:
            return ''.join([chr(int(b, 2)) for b in tokens])
        except Exception:
            pass
    return None

def try_rot13(s: str):
    result = []
    for c in s:
        if 'a' <= c <= 'z':
            result.append(chr((ord(c) - ord('a') + 13) % 26 + ord('a')))
        elif 'A' <= c <= 'Z':
            result.append(chr((ord(c) - ord('A') + 13) % 26 + ord('A')))
        else:
            result.append(c)
    return ''.join(result)

def run_caesar(s: str):
    print("\n--- 🔄 Toate cele 25 de rotații Caesar ---")
    for shift in range(1, 26):
        res = []
        for c in s:
            if 'a' <= c <= 'z':
                res.append(chr((ord(c) - ord('a') + shift) % 26 + ord('a')))
            elif 'A' <= c <= 'Z':
                res.append(chr((ord(c) - ord('A') + shift) % 26 + ord('A')))
            else:
                res.append(c)
        out = ''.join(res)
        flag_match = FLAG_REGEX.findall(out)
        flag_str = f" ⭐ [FLAG DETECTAT: {flag_match[0]}]" if flag_match else ""
        print(f"Shift +{shift:02d}: {out}{flag_str}")
    print("------------------------------------------\n")

def xor_single_byte_search(data_bytes: bytes):
    print("\n--- ⚡ Căutare Single-byte XOR (0-255) ---")
    found = False
    for k in range(256):
        dec = bytes([b ^ k for b in data_bytes])
        try:
            text = dec.decode('utf-8')
            matches = FLAG_REGEX.findall(text)
            if matches:
                print(f"[!] 🚩 GĂSIT cu cheia {k} (0x{k:02x}): {matches[0]} -> Text complet: {text}")
                found = True
            elif "algo" in text.lower() or "flag" in text.lower() or "cyber" in text.lower():
                print(f"[+] Cheie probabilă {k} (0x{k:02x}): {text[:60]}")
                found = True
        except UnicodeDecodeError:
            continue
    if not found:
        print("[-] Niciun flag evident găsit prin XOR cu 1 byte.")
    print("------------------------------------------\n")

def decode_morse(s: str):
    words = s.strip().split('/')
    result = []
    for word in words:
        letters = word.strip().split()
        decoded_word = ''.join(MORSE_DICT.get(l, '?') for l in letters)
        result.append(decoded_word)
    return ' '.join(result)

def auto_detect_all(s: str):
    print(f"[*] Analiză automată pentru textul:\n'{s}'\n")

    # 1. URL & HTML
    url_dec = urllib.parse.unquote(s)
    if url_dec != s:
        print(f"[+] URL Decoded: {url_dec}")

    html_dec = html.unescape(s)
    if html_dec != s:
        print(f"[+] HTML Unescape: {html_dec}")

    # 2. Base64
    b64 = try_base64(s)
    if b64:
        print(f"[+] Base64 Decoded: {b64}")

    # 3. Hex
    hx = try_hex(s)
    if hx:
        print(f"[+] Hex Decoded: {hx}")

    # 4. Binary
    bin_res = try_binary(s)
    if bin_res:
        print(f"[+] Binary Decoded: {bin_res}")

    # 5. Rot13
    rot_res = try_rot13(s)
    print(f"[+] Rot13: {rot_res}")

    # 6. Verificare flag-uri directe
    for m in FLAG_REGEX.findall(s):
        print(f"[!] 🚩 FLAG direct în input: {m}")

def main():
    parser = argparse.ArgumentParser(description="CTF Multi-Decoder & Fast Crypto Utility")
    parser.add_argument("text", help="Șirul de text sau hex pentru decodare")
    parser.add_argument("--caesar", action="store_true", help="Rulează toate cele 25 de rotații Caesar")
    parser.add_argument("--xor-search", action="store_true", help="Caută cheia single-byte XOR (acceptă text sau hex)")
    parser.add_argument("--morse", action="store_true", help="Decodare cod Morse (folosește spațiu între litere și '/' între cuvinte)")

    args = parser.parse_args()

    if args.caesar:
        run_caesar(args.text)
    elif args.morse:
        print(f"[+] Morse Decoded: {decode_morse(args.text)}")
    elif args.xor_search:
        try:
            data = bytes.fromhex(re.sub(r'[\s:0x]', '', args.text))
        except Exception:
            data = args.text.encode('utf-8')
        xor_single_byte_search(data)
    else:
        auto_detect_all(args.text)

if __name__ == "__main__":
    main()
