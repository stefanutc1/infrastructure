#!/usr/bin/env python3
"""
CTF Rapid Math & Logic Socket Solver
Automatizează răspunsurile pentru provocări interactive rapide (100 de runde de calcule/puzzle-uri contra-cronometru).
"""

import sys
import socket
import re
import ast
import operator
import base64
import argparse

FLAG_REGEX = re.compile(r'(?:FLAG|ALGO|CTF|cyber)\{[^}]+\}', re.IGNORECASE)

SAFE_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow
}

def safe_eval(node):
    if isinstance(node, ast.Constant):
        return node.value
    elif isinstance(node, ast.BinOp):
        left = safe_eval(node.left)
        right = safe_eval(node.right)
        op_type = type(node.op)
        if op_type in SAFE_OPS:
            return SAFE_OPS[op_type](left, right)
    raise ValueError("Expresie nesuportată")

def solve_math_expression(text: str):
    """Găsește și calculează expresii matematice precum '45 * 12 + 3'."""
    match = re.search(r'(\d+\s*[\+\-\*\/\%]\s*\d+(?:\s*[\+\-\*\/\%]\s*\d+)*)', text)
    if match:
        expr_str = match.group(1).replace('/', '//')
        try:
            tree = ast.parse(expr_str, mode='eval')
            result = safe_eval(tree.body)
            return str(result)
        except Exception:
            pass
    return None

def solve_challenge(host: str, port: int, mode="math"):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(10.0)
    print(f"[*] Conectare la {host}:{port} în modul '{mode}'...")
    sock.connect((host, port))

    buffer = ""
    round_count = 0

    try:
        while True:
            data = sock.recv(2048)
            if not data:
                print("[-] Conexiunea a fost închisă de server.")
                break

            text = data.decode('utf-8', errors='ignore')
            buffer += text
            sys.stdout.write(text)
            sys.stdout.flush()

            # Verificare flag
            flags = FLAG_REGEX.findall(text)
            if flags:
                print(f"\n\n[!] 🚩 FLAG GĂSIT: {flags}\n")
                break

            answer = None
            if mode == "math":
                answer = solve_math_expression(buffer)
            elif mode == "reverse":
                m = re.search(r'Reverse this:\s*([^\r\n]+)', buffer)
                if m:
                    answer = m.group(1).strip()[::-1]
            elif mode == "base64":
                m = re.search(r'Decode this:\s*([A-Za-z0-9+/=]+)', buffer)
                if m:
                    try:
                        answer = base64.b64decode(m.group(1)).decode('utf-8')
                    except Exception:
                        pass

            if answer is not None:
                round_count += 1
                sys.stdout.write(f"\n[+] Runda #{round_count} -> Răspuns: {answer}\n")
                sock.sendall((str(answer) + "\n").encode('utf-8'))
                buffer = ""

    except socket.timeout:
        print("\n[-] Timeout la așteptarea datelor de la server.")
    except KeyboardInterrupt:
        print("\n[*] Oprit manual.")
    finally:
        sock.close()

def main():
    parser = argparse.ArgumentParser(description="CTF Rapid Math & Logic Socket Solver")
    parser.add_argument("host", help="IP sau Hostname al challenge-ului")
    parser.add_argument("port", type=int, help="Portul serverului")
    parser.add_argument("--mode", default="math", choices=["math", "reverse", "base64"], help="Tipul de puzzle (default: math)")

    args = parser.parse_args()
    solve_challenge(args.host, args.port, mode=args.mode)

if __name__ == "__main__":
    main()
