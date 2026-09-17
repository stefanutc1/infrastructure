#!/bin/bash
set -e

echo "=== Setup Mediu CTF (InvataCyber / AlgoCyber) ==="

if [ ! -d "venv" ]; then
    echo "[*] Creare mediu virtual Python (venv)..."
    python3 -m venv venv
fi

echo "[*] Activare venv..."
source venv/bin/activate

echo "[*] Actualizare pip si instalare cerinte..."
pip install --upgrade pip
pip install -r requirements.txt

echo "[+] Setup finalizat cu succes!"
echo "[*] Activeaza mediul ruland: source venv/bin/activate"
