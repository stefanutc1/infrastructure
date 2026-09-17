#!/usr/bin/env python3
"""
CTF Flag & Raffle Ticket Tracker
Urmărește flag-urile găsite, punctajul, șansele la tombolă (1 flag = 1 bilet) și viteza de rezolvare.
"""

import os
import sys
import json
import argparse
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(__file__), "progress.json")

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"start_time": datetime.now().isoformat(), "challenges": []}

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def add_challenge(args):
    data = load_data()
    item = {
        "name": args.name,
        "category": args.category.capitalize(),
        "points": args.points,
        "flag": args.flag,
        "notes": args.notes or "",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    data["challenges"].append(item)
    save_data(data)
    print(f"[+] Înregistrat: '{args.name}' [{item['category']}] -> {args.points} pct.")
    print(f"[🎟️] Bilete tombolă acumulate: {len(data['challenges'])} (1 flag = 1 șansă)")

def list_challenges(args):
    data = load_data()
    challenges = data.get("challenges", [])
    if not challenges:
        print("[-] Niciun challenge înregistrat încă. Folosește 'add' pentru a adăuga primul flag!")
        return

    print("\n" + "="*80)
    print(f"{'#':<3} {'CATEGORIE':<12} {'CHALLENGE':<24} {'PUNCTE':<8} {'FLAG'}")
    print("="*80)

    total_points = 0
    categories = {}

    for idx, c in enumerate(challenges, 1):
        total_points += c["points"]
        cat = c["category"]
        categories[cat] = categories.get(cat, 0) + 1
        flag_disp = c['flag'] if len(c['flag']) <= 28 else c['flag'][:25] + "..."
        print(f"{idx:<3} {cat:<12} {c['name'][:22]:<24} {c['points']:<8} {flag_disp}")

    print("="*80)
    print(f"📊 TOTAL CHALLENGE-URI REZOLVATE: {len(challenges)}")
    print(f"💰 PUNCTAJ ESTIMAT: {total_points} puncte")
    print(f"🎟️ BILETE TOMBOLĂ (HTB 25$): {len(challenges)} șanse")
    print("\nDefalcare pe categorii:")
    for cat, count in categories.items():
        print(f"  - {cat}: {count} rezolvate")
    print("="*80 + "\n")

def reset_tracker(args):
    if os.path.exists(DATA_FILE):
        os.remove(DATA_FILE)
    print("[+] Tracker-ul a fost resetat.")

def main():
    parser = argparse.ArgumentParser(description="CTF Flag & Raffle Ticket Tracker")
    subparsers = parser.add_subparsers(dest="command")

    # Add
    p_add = subparsers.add_parser("add", help="Adaugă un challenge rezolvat")
    p_add.add_argument("name", help="Numele provocării")
    p_add.add_argument("category", help="Categoria (Web, Crypto, Stego, Forensics, Misc)")
    p_add.add_argument("points", type=int, help="Punctajul obținut")
    p_add.add_argument("flag", help="Textul flag-ului (ex: ALGO{...})")
    p_add.add_argument("notes", nargs="?", default="", help="Notițe scurte / metoda de exploatare")

    # List
    subparsers.add_parser("list", help="Afișează toate challenge-urile și totalul")

    # Reset
    subparsers.add_parser("reset", help="Resetează tracker-ul")

    args = parser.parse_args()
    if args.command == "add":
        add_challenge(args)
    elif args.command == "list":
        list_challenges(args)
    elif args.command == "reset":
        reset_tracker(args)
    else:
        list_challenges(args)

if __name__ == "__main__":
    main()
