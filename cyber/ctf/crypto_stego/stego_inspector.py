#!/usr/bin/env python3
"""
CTF File & Steganography Quick Inspector
Verifică Magic Bytes (semnătura fișierului), extrage șiruri ASCII/Unicode căutând flag-uri și detectează date ascunse la final de fișier.
"""

import sys
import os
import re
import argparse

FLAG_REGEX = re.compile(r'(?:FLAG|ALGO|CTF|cyber)\{[^}]+\}', re.IGNORECASE)

MAGIC_SIGNATURES = {
    b'\x89PNG\r\n\x1a\n': 'Imagine PNG',
    b'\xff\xd8\xff': 'Imagine JPEG',
    b'GIF87a': 'Imagine GIF87a',
    b'GIF89a': 'Imagine GIF89a',
    b'PK\x03\x04': 'Arhivă ZIP (posibil docx/xlsx/jar)',
    b'7z\xbc\xaf\x27\x1c': 'Arhivă 7-Zip',
    b'Rar!\x1a\x07': 'Arhivă RAR',
    b'\x7fELF': 'Executabil Linux ELF',
    b'MZ': 'Executabil Windows PE (EXE/DLL)',
    b'%PDF-': 'Document PDF',
    b'BM': 'Imagine BMP',
    b'\x1f\x8b\x08': 'Arhivă GZIP',
    b'BZh': 'Arhivă BZIP2'
}

def inspect_magic_bytes(data: bytes):
    for sig, desc in MAGIC_SIGNATURES.items():
        if data.startswith(sig):
            return desc
    return "Format necunoscut / Text brut"

def extract_strings(data: bytes, min_len=4):
    """Extrage șiruri ASCII și Unicode (UTF-16LE)."""
    ascii_strings = re.findall(rb'[\x20-\x7e]{' + str(min_len).encode() + rb',}', data)
    unicode_strings = re.findall(rb'(?:[\x20-\x7e]\x00){' + str(min_len).encode() + rb',}', data)

    results = [s.decode('latin-1') for s in ascii_strings]
    for s in unicode_strings:
        try:
            results.append(s.decode('utf-16le'))
        except Exception:
            pass
    return results

def check_trailing_data(filepath: str, data: bytes):
    """Verifică dacă există fișiere sau date adăugate după sfârșitul standard al imaginii."""
    # PNG: IEND chunk
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        iend = b'IEND\xaeB`\x82'
        idx = data.find(iend)
        if idx != -1:
            trailing_len = len(data) - (idx + len(iend))
            if trailing_len > 0:
                print(f"[!] ⚠️ ALERTĂ STEGANO: Detectate {trailing_len} bytes adiționali după chunk-ul PNG IEND!")
                extra_data = data[idx + len(iend):]
                print(f"    Tip date ascunse: {inspect_magic_bytes(extra_data)}")
                matches = FLAG_REGEX.findall(extra_data.decode('latin-1', errors='ignore'))
                if matches:
                    print(f"    🚩 FLAG în datele ascunse: {matches}")

    # JPEG: EOI marker (\xff\xd9)
    elif data.startswith(b'\xff\xd8\xff'):
        eoi = b'\xff\xd9'
        idx = data.rfind(eoi)
        if idx != -1 and idx + 2 < len(data):
            trailing_len = len(data) - (idx + 2)
            print(f"[!] ⚠️ ALERTĂ STEGANO: Detectate {trailing_len} bytes adiționali după marker-ul JPEG EOI!")
            extra_data = data[idx + 2:]
            print(f"    Tip date ascunse: {inspect_magic_bytes(extra_data)}")
            matches = FLAG_REGEX.findall(extra_data.decode('latin-1', errors='ignore'))
            if matches:
                print(f"    🚩 FLAG în datele ascunse: {matches}")

def inspect_file(filepath: str):
    if not os.path.exists(filepath):
        print(f"[-] Fișierul {filepath} nu există.")
        return

    with open(filepath, 'rb') as f:
        data = f.read()

    file_size = len(data)
    magic_type = inspect_magic_bytes(data)

    print("\n" + "="*60)
    print(f"🔍 ANALIZĂ FIȘIER: {os.path.basename(filepath)}")
    print(f"📏 Dimensiune: {file_size} bytes")
    print(f"🏷️  Tip identificat: {magic_type}")
    print("="*60)

    # 1. Date agățate la final (Trailing data)
    check_trailing_data(filepath, data)

    # 2. Căutare directă de flag-uri
    text_content = data.decode('latin-1', errors='ignore')
    flags = FLAG_REGEX.findall(text_content)
    if flags:
        print(f"\n[!] 🚩 FLAG(URI) GĂSITE DIRECT:")
        for fl in set(flags):
            print(f"    -> {fl}")
    else:
        print("\n[-] Niciun flag direct detectat în textul brut.")

    # 3. Căutare cuvinte cheie în șiruri
    strings_list = extract_strings(data)
    print(f"[*] Total șiruri extrase (lungime >= 4): {len(strings_list)}")
    interesting = [s for s in strings_list if any(k in s.lower() for k in ["pass", "user", "admin", "secret", "key", "hidden", "flag", "algo", "cyber"])]
    if interesting:
        print("\n💡 Șiruri interesante identificate:")
        for s in interesting[:15]:
            print(f"  • {s}")
        if len(interesting) > 15:
            print(f"  ... și încă {len(interesting)-15} șiruri.")

    print("\n" + "="*60 + "\n")

def main():
    parser = argparse.ArgumentParser(description="CTF File & Steganography Quick Inspector")
    parser.add_argument("file", help="Calea către fișierul de analizat")
    args = parser.parse_args()

    inspect_file(args.file)

if __name__ == "__main__":
    main()
