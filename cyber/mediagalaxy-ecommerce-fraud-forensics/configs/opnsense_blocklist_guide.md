<div align="center">

# OPNsense & Unbound DNS Blocklist Integration Guide

</div>
**Gateway:** `192.168.1.1` (OPNsense Business / Community Edition)  
**Target:** Homelab & Enterprise Defense-in-Depth  
**Incident Reference:** `SEC-2026-ECOM-005` (Media Galaxy Phishing & E-Commerce Fraud)

---

<div align="center">

## 1. Executive Summary

</div>

This technical runbook details the end-to-end procedure for ingesting the extracted Indicators of Compromise (IoCs) into the perimeter gateway at `192.168.1.1`. By implementing protective measures across **Unbound DNS (Sinkholing)**, **Firewall Aliases (L3/L4 Egress Filtering)**, and **Suricata IDS/IPS (Deep Packet Inspection)**, the local network and downstream endpoints are immunized against credential theft, command-and-control callback, and data exfiltration.

---

<div align="center">

## 2. DNS Sinkholing via Unbound DNS

</div>

<div align="center">

### Option A: Local Overrides (Immediate Quarantine)

</div>
1. Log in to the OPNsense WebGUI at `https://192.168.1.1`.
2. Navigate to **Services -> Unbound DNS -> Overrides**.
3. Under **Host Overrides**, click **+ Add** for each extracted domain:
   - **Host:** `mediagalaxy`
   - **Domain:** `voetbalshop-nlco.com`
   - **Type:** `A`
   - **IP:** `0.0.0.0` (or local sinkhole web server `192.168.1.175`)
   - **Description:** `Sinkhole: Media Galaxy Phishing Lure (SEC-2026-ECOM-005)`
4. Repeat for root domains:
   - `voetbalshop-nlco.com` -> `0.0.0.0`
   - `yiyangsaas.com` -> `0.0.0.0`
   - `worvixglobal.com` -> `0.0.0.0`
   - `mailapp-fly.com` -> `0.0.0.0`
5. Click **Save** and **Apply Changes**.

<div align="center">

### Option B: Custom Blocklist Feed (Automated Fetch)

</div>
1. Store `domains.txt` on a local web server (e.g. Nginx on `192.168.1.175` / Proxmox VM):
   `http://192.168.1.175/blocklists/sec-2026-ecom-005.txt`
2. In OPNsense, navigate to **Services -> Unbound DNS -> Blocklist**.
3. Under **Type of DNSBL**, ensure **Blocklist** is selected.
4. Under **Custom URLs**, add `http://192.168.1.175/blocklists/sec-2026-ecom-005.txt`.
5. Check **Wildcard matching** to sinkhole all subdomains.
6. Click **Save** and click **Download & Apply**.

---

<div align="center">

## 3. Firewall Alias & Egress Blocking (L3/L4)

</div>

Even if an attacker bypasses local DNS (e.g., using DNS-over-HTTPS / DoH), L3/L4 firewall blocks on target proxy IPs guarantee zero communication.

<div align="center">

### Step 1: Create Firewall Alias

</div>
1. Navigate to **Firewall -> Aliases**.
2. Click **+ Add**.
   - **Name:** `PHISHING_SAAS_IPS`
   - **Type:** `Hosts`
   - **Content:**
     - `104.16.145.247`
     - `104.21.14.99`
   - **Description:** `Known Phishing C2 and Reverse Proxy IPs (SEC-2026-ECOM-005)`
3. Save and Apply Changes.

<div align="center">

### Step 2: Create Floating Egress Reject Rule

</div>
1. Navigate to **Firewall -> Rules -> Floating**.
2. Click **+ Add** (top rule):
   - **Action:** `Reject`
   - **Quick:** Checked
   - **Interface:** `LAN`, `DMZ`, `MANAGEMENT`
   - **Direction:** `Out`
   - **Protocol:** `any`
   - **Source:** `any`
   - **Destination:** `PHISHING_SAAS_IPS`
   - **Log:** Checked (`Log packets handled by this rule`)
   - **Description:** `DROP_AND_LOG: Outbound traffic to Phishing C2 IPs`
3. Save and Apply Changes.

---

<div align="center">

## 4. Suricata IDS/IPS Rules Deployment

</div>

1. SSH into the OPNsense gateway:
   ```bash
   ssh root@192.168.1.1
   ```
2. Navigate to the custom Suricata rules directory:
   ```bash
   mkdir -p /usr/local/etc/suricata/rules
   cat << 'EOF' > /usr/local/etc/suricata/rules/custom_phishing.rules
   # SEC-2026-ECOM-005 Custom Signatures
   alert http any any -> any any (msg:"SEC-ALERT [Phishing] Fraudulent Media Galaxy Subdomain HTTP Request"; http.host; content:"mediagalaxy.voetbalshop-nlco.com"; startswith; endswith; nocase; classtype:trojan-activity; sid:1000951; rev:1;)
   alert tls any any -> any any (msg:"SEC-ALERT [Phishing] TLS SNI Connection to Suspicious voetbalshop-nlco.com"; tls.sni; content:"voetbalshop-nlco.com"; nocase; classtype:trojan-activity; sid:1000952; rev:1;)
   alert tls any any -> any any (msg:"SEC-ALERT [C2] TLS Handshake to Known Phishing SaaS Backend yiyangsaas.com"; tls.sni; content:"yiyangsaas.com"; nocase; classtype:trojan-activity; sid:1000953; rev:1;)
   alert tls any any -> any any (msg:"SEC-ALERT [Fraud] TLS SNI Connection to worvixglobal.com E-commerce Shell"; tls.sni; content:"worvixglobal.com"; nocase; classtype:bad-unknown; sid:1000954; rev:1;)
   EOF
   ```
3. Restart the Suricata IDS service:
   ```bash
   configctl ids restart
   ```
4. Confirm rules compilation in `/var/log/suricata/suricata.log`.

---

<div align="center">

## 5. Verification & Testing

</div>

From a workstation on the LAN:
```bash
# 1. Test DNS Sinkhole (Expect 0.0.0.0 or NXDOMAIN)
dig @192.168.1.1 mediagalaxy.voetbalshop-nlco.com
dig @192.168.1.1 yiyangsaas.com

# 2. Test Firewall Egress Drop
curl -v -m 3 https://104.16.145.247
# Result: Connection refused or timed out by firewall reject
```
