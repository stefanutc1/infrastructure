# Cyber Threat Intelligence, Forensics & Network Defense Tools (`antigravity`)

This suite comprises automated forensic analysis, social media ad feed inspection, threat intelligence parsing, and network-level policy synchronization tools developed during active investigations (such as `SEC-2026-ECOM-005 Media Galaxy Counterfeit Phishing Cluster`).

All scripts are sanitized: they contain zero sensitive credentials, hardcoded victim identities, or personal session data, and use environment variables and CLI parameters for operational flexibility.

---

## Tool Overview

| Tool | Purpose | Key Capabilities |
| :--- | :--- | :--- |
| **`dfir_image_redactor.py`** | Evidence Sanitization & PII Redaction | Native Apple Vision OCR text recognition, accurate bounding box computation, and solid black pixel-overwriting to sanitize forensic screenshots with zero leaks. |
| **`safari_feed_crawler.py`** | Social Media Feed & Ad Crawler | Automates macOS Safari across Facebook, Instagram, and TikTok feeds, handling dynamic lazy-loading scroll, DOM copying, and sponsored post extraction. |
| **`clipboard_html_decoder.py`** | macOS Pasteboard HTML Extractor | Extracts raw `«class HTML»` hex data from macOS clipboard selections, reconstructing full DOM markup and resolving tracking redirects (`l.facebook.com`, `ig_redirect`). |
| **`ad_threat_intel_analyzer.py`** | Ad Scam Pattern & Threat Intelligence Engine | Detects Romanian retail impersonation (e.g. Media Galaxy, Altex, eMAG clones), Chinese fraud SaaS fingerprints (`yiyangsaas.com`, OEMCart), and disposable relay domains. |
| **`opnsense_dns_sinkhole.py`** | OPNsense DNS Sinkhole Synchronizer | Manages automated null-routing (`0.0.0.0` / `::`) via Dnsmasq and Unbound on OPNsense, updating local blocklists and pf packet filter tables without manual UI intervention. |
| **`live_threat_probe.py`** | Safe Sandboxed Reconnaissance & TLS Pivoting | Safe external SSL/TLS certificate inspection and HTTP header probing to unmask backend C2 origins and shared infrastructure without executing browser scripts. |

---

## Detailed Usage

### 1. DFIR Evidence Image Redactor
```bash
# Redact all instances of a sensitive string in an image:
python3 dfir_image_redactor.py --file /path/to/evidence.png --target "Sensitive Name"

# Batch redact an entire directory:
python3 dfir_image_redactor.py --dir ./evidence/ --target "Target PII"

# Apply explicit bounding box coordinates (X0 Y0 X1 Y1):
python3 dfir_image_redactor.py --file screenshot.png --box 1150 780 1450 840
```

### 2. Safari Feed & Ad Crawler
```bash
# Crawl current Safari tab with 15 scroll steps:
python3 safari_feed_crawler.py --tab 1 --scrolls 15 --outdir /tmp/feed_dumps

# Sequentially crawl Tabs 1, 2, and 3 (FB, TT, IG):
python3 safari_feed_crawler.py --all --scrolls 20 --outdir /tmp/feed_dumps
```

### 3. Clipboard HTML Decoder
```bash
# Decode current macOS clipboard selection to an HTML file:
python3 clipboard_html_decoder.py --save /tmp/page_dom.html

# Extract all outbound hyperlinks and redirects directly to stdout:
python3 clipboard_html_decoder.py --extract-links
```

### 4. Ad Threat Intelligence Analyzer
```bash
# Analyze a list of URLs or domains against threat signatures:
python3 ad_threat_intel_analyzer.py --file /tmp/extracted_links.txt

# Run a threat check on a specific domain:
python3 ad_threat_intel_analyzer.py --url "https://mediagalaxy.voetbalshop-nlco.com"
```

### 5. OPNsense DNS Sinkhole Deployer
```bash
# Sync malicious domain list to OPNsense (VM 200 on Proxmox VE):
PROXMOX_HOST="192.168.1.132" OPNSENSE_VMID="200" python3 opnsense_dns_sinkhole.py --domains-file iocs.txt

# Check live resolution status:
python3 opnsense_dns_sinkhole.py --status
```

### 6. Sandboxed Threat Recon Probe
```bash
# Inspect TLS certificate SANs and headers for a target domain:
python3 live_threat_probe.py --target "voetbalshop-nlco.com"

# Pivot directly to an origin IP:
python3 live_threat_probe.py --ip "104.16.145.247" --port 443
```
