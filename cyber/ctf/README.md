# 🚩 CTF Speedrun Toolkit & Workspace (InvataCyber / AlgoCyber)

Repository privat conceput special pentru pregătirea și rularea speedrun-ului (țintă: **10 ore**) la **Mini CTF-ul Jeopardy** găzduit de **InvataCyber.ro** pe platforma **AlgoCyber / Algolymp** (creat cu implicarea lui *coxterman*).

---

## 🎯 Despre Eveniment

- **Tip:** Jeopardy CTF (Entry-level / Medium-Easy), focus pe învățare și colaborare.
- **Dată & Durată:** 19 Septembrie 2026, ora 09:00 – 20 Septembrie 2026, ora 21:00 (36 ore în total).
- **Discord:** Canale de voce și text active pentru schimb de idei și indicii (regula de aur: *nu se distribuie flag-ul direct*).
- **Scoring:** Dynamic Scoring (valoarea provocării scade odată cu numărul de rezolvări) + Bonusuri de **First Blood**.
- **Tombolă:** 1 Flag validat = 1 Bilet de tombolă la tragerea la sorți pentru **2x vouchere Hack The Box Labs de 25$** (oferite de InvataCyber.ro & CybrOps).

---

## 📁 Structura Repository-ului

```text
ctf/
├── README.md                      # Ghidul complet, strategii și comenzi rapide
├── requirements.txt               # Dependențe Python (requests, scapy, pycryptodome, bs4 etc.)
├── setup.sh                       # Script bash pentru instalare automată venv
├── .gitignore                     # Filtre pentru PCAP-uri mari, zip-uri, venv, cache
│
├── tracker/                       # Monitorizare progres & tombolă
│   └── flag_tracker.py            # CLI tracker: flag-uri, scor, șanse tombolă, timp speedrun
│
├── templates/                     # Schelete de cod gata de adaptat în timpul CTF-ului
│   ├── web_template.py            # Template requests.Session cu regex flag, proxy & headers
│   ├── socket_template.py         # Template interacțiune TCP/netcat pentru provocări de viteză
│   └── writeup_template.md        # Șablon standardizat pentru notat rezolvările și flag-urile
│
├── web/                           # Automatizări și testări pentru categoria Web (Grosul CTF-ului)
│   ├── requester.py               # Fuzzer HTTP custom, header spoofing & detectare automată flag
│   ├── path_discovery.py          # Scanare rapidă de directoare și fișiere tipice (.git, .env, robots)
│   ├── sqli_helper.py             # Verificator auth-bypass & extractor binar blind SQLi
│   ├── jwt_cookie_tool.py         # Decodor/tamper JWT, brute-force HMAC secret, decodor cookie Flask
│   └── idor_scanner.py            # Enumerator IDOR cu analiză diferențială (lungime/status)
│
├── crypto_stego/                  # Decodificări rapide și inspecție fișiere/metadate
│   ├── quick_decoder.py           # Decodor universal (Base64, Hex, URL, Binary, Rot13/Caesar, XOR)
│   └── stego_inspector.py         # Verificare Magic Bytes, căutare regex flag-uri, metadate EXIF
│
└── forensics_misc/                # Analiză pachete, log-uri și puzzle-uri automate
    ├── pcap_analyzer.py           # Extractor trafic HTTP, DNS și flag-uri din fișiere .pcap/.pcapng
    ├── log_analyzer.py            # Parser access.log (IP-uri, status codes, query-uri suspecte)
    └── rapid_solver.py            # Rezolvator automat pentru ecuații/matematică prin socket în timp limită
```

---

## ⚡ Strategia de Speedrun (Planul de 10 Ore)

| Interval | Etapă | Focus & Obiective | Unelte Recomandate |
|---|---|---|---|
| **00:00 - 02:00** | **Recon & Low-Hanging Fruits** | Rezolvarea provocărilor triviale: flag-uri în HTML source, `robots.txt`, `.git` expus, decodări rapide Crypto (Base64, Hex, Caesar). Asigurarea primelor bilete de tombolă. | `web/path_discovery.py`, `crypto_stego/quick_decoder.py`, `tracker/flag_tracker.py` |
| **02:00 - 06:00** | **Web Core Exploitation** | Grosul punctelor: SQL Injection (auth bypass sau union), IDOR (manipulare ID utilizator), manipulare sesiuni/cookie-uri (JWT, Flask). | `web/sqli_helper.py`, `web/idor_scanner.py`, `web/jwt_cookie_tool.py`, Cookie-Editor |
| **06:00 - 08:00** | **Stego & Forensics** | Analiză imagini suspecte (strings, EXIF, date appendate), inspecție fișiere PCAP (căutare request-uri POST, parole, flag-uri în clar). | `crypto_stego/stego_inspector.py`, `forensics_misc/pcap_analyzer.py` |
| **08:00 - 10:00** | **Misc Scripting & Finish** | Rezolvare puzzle-uri automate prin socket (math/logica contra-cronometru), verificare challenge-uri rămase, centralizare writeup-uri. | `forensics_misc/rapid_solver.py`, `templates/socket_template.py` |

---

## 🛠️ Instalare și Pornire Rapidă

```bash
# 1. Clonează/accesează directorul
cd /Users/s3nnnzzzatyeeee/.gemini/antigravity/scratch/ctf

# 2. Rulează scriptul de inițializare (creează venv și instalează pachetele)
./setup.sh

# 3. Activează mediul virtual
source venv/bin/activate
```

---

## 🧰 Ghid Rapid de Utilizare a Scripturilor

### 1. Urmărirea Progresului (`tracker/flag_tracker.py`)
```bash
# Adaugă un flag găsit:
python3 tracker/flag_tracker.py add "Web Login Bypass" "Web" 150 "ALGO{easy_bypass_123}" "Bypassed admin login with ' OR 1=1--"

# Vezi sumarul progresului și numărul de bilete la tombolă:
python3 tracker/flag_tracker.py list
```

### 2. Scanare Fișiere/Căi Ascunse (`web/path_discovery.py`)
```bash
python3 web/path_discovery.py http://target.challenge.algocyber.ro:8000
```

### 3. Decodare Universală (`crypto_stego/quick_decoder.py`)
```bash
# Decodare automată a unui șir:
python3 crypto_stego/quick_decoder.py "QUxHT3t0aGlzX2lzX2Ffc2VjcmV0fQ=="

# Brute-force Caesar / Rot (0-25):
python3 crypto_stego/quick_decoder.py "NUBB{f0xq1t0_f0xq}" --caesar

# Căutare cheie single-byte XOR:
python3 crypto_stego/quick_decoder.py "1b37373331363f78151b7f2b783431333d" --xor-search
```

### 4. Inspecție Fișiere & Stegano (`crypto_stego/stego_inspector.py`)
```bash
python3 crypto_stego/stego_inspector.py challenge_image.png
```

### 5. Analiză PCAP Traffic (`forensics_misc/pcap_analyzer.py`)
```bash
python3 forensics_misc/pcap_analyzer.py capture.pcap
```

### 6. Rezolvare Challenge Socket / Matematică Rapidă (`forensics_misc/rapid_solver.py`)
```bash
python3 forensics_misc/rapid_solver.py challenge.algocyber.ro 1337
```

---

## 🌐 Extensii de Browser Recomandate pentru Speedrun

- **Cookie-Editor:** Modificare și injectare rapidă de cookie-uri (admin=1, role=superadmin).
- **Hack-Tools:** Cheat sheets, SQLi payloads, reverse shells și encoders direct în tab-ul DevTools.
- **Wappalyzer:** Identificarea instantanee a tehnologiilor folosite (Flask, PHP, Express, Apache, Nginx).
- **FoxyProxy:** Rutarea rapidă a traficului către Burp Suite sau Caido (`127.0.0.1:8080`).
- **CyberChef (offline sau web):** Pentru rețete complexe de transformare a datelor.
