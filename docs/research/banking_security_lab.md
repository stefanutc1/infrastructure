# Research Environment: Bachelor's Thesis Banking Security Lab

<div align="center">

[![Research](https://img.shields.io/badge/Research-Enterprise%20Banking%20Security%20Lab-0f172a.svg?style=flat&logo=academia)](#)
[![Candidate](https://img.shields.io/badge/Researcher-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)
[![University](https://img.shields.io/badge/University-Universitatea%20din%20Craiova%20%C2%B7%20FEAA-0284c7.svg?style=flat&logo=academia)](https://feaa.ucv.ro)
[![Program](https://img.shields.io/badge/Specialization-Informatic%C4%83%20Economic%C4%83%20(2024--2027)-10b981.svg?style=flat)](#)
[![Standards](https://img.shields.io/badge/Compliance-PCI--DSS%204.0%20%7C%20SWIFT%20CSP-ea580c.svg?style=flat)](#)

</div>

---

## 1. Context & Academic Thesis

This research laboratory hosts the practical implementation and empirical attack-defense testbed for the **Bachelor's Thesis (Lucrare de Licență)** focused on **Enterprise Banking Infrastructure Security, Resilient Core-Banking Architectures, and Automated Threat Detection**.

The research simulates a realistic, multi-tier banking architecture adhering to financial industry standards (**PCI-DSS 4.0**, **ISO 27001**, and **SWIFT Customer Security Programme - CSP**).

---

## 2. Architecture Topology

```text
               ┌────────────────────────────────────────────────────────┐
               │         VLAN 30: CyberLab & Pentest Workstation        │
               │         Kali Linux Research Node (VM 302)              │
               │         IP: 192.168.30.102 · RAM: 4,096 MB             │
               └───────────────────────────┬────────────────────────────┘
                                           │
                        (OPNsense Firewall & Suricata DPI)
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌─────────────────────────────────┐                         ┌─────────────────────────────────┐
│  VLAN 20: Core-Banking Tier     │                         │  VLAN 10: SWIFT & Bastion Tier  │
│  VM 310: Apache Fineract        │                         │  VM 313: SWIFT Jumpbox Bastion  │
│  IP: 192.168.20.50 · RAM: 4GB   │                         │  IP: 192.168.10.50 · RAM: 2GB   │
│  VM 311: PostgreSQL Ledger DB   │                         └─────────────────────────────────┘
│  IP: 192.168.20.51 · RAM: 4GB   │                                          │
│  CT 312: Payment Gateway API    │                         (Strict Bastion Jumps Only)
│  IP: 192.168.20.52 · RAM: 512MB │                                          │
└─────────────────────────────────┘                                          ▼
                                                            ┌─────────────────────────────────┐
                                                            │  VLAN 30: Vulnerable Targets    │
                                                            │  VM 301: Metasploitable 2       │
                                                            │  CT 303: OWASP Juice Shop       │
                                                            └─────────────────────────────────┘
```

---

## 3. Component Matrix

| VMID / CTID | Component Name | Operational Role | Technology Stack | Network & Static IP | Lifecycle State |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **VM 310** | `core-banking` | Core Financial Engine | Apache Fineract, Java 17, Spring Boot | VLAN 20 (`192.168.20.50`) | `DECLARED` (On-Demand) |
| **VM 311** | `banking-db` | Financial Database Ledger | PostgreSQL 16, pgAudit, TLS | VLAN 20 (`192.168.20.51`) | `DECLARED` (On-Demand) |
| **CT 312** | `payment-gateway` | Payment & Card Ingress | Node.js / Python API Gateway | VLAN 20 (`192.168.20.52`) | `DECLARED` (On-Demand) |
| **VM 313** | `swift-jumpbox` | Privileged SWIFT Bastion | Hardened Linux Bastion, MFA, SSH | VLAN 10 (`192.168.10.50`) | `DECLARED` (On-Demand) |
| **VM 302** | `kali-licenta` | Offensive Pentest Node | Kali Linux Rolling, Metasploit | VLAN 30 (`192.168.30.102`) | `DECLARED` (On-Demand) |
| **VM 301** | `metasploitable` | Detection Tuning Target | Metasploitable 2 Linux Target | VLAN 30 (`192.168.1.211`) | `DECLARED` (On-Demand) |
| **CT 303** | `owasp-licenta` | Vulnerable Web Banking API | OWASP Juice Shop, Docker Runtime | VLAN 30 (`192.168.30.103`) | `DECLARED` (On-Demand) |

---

## 4. Validated Attack & Defense Scenarios

1. **Scenario 1: SQL Injection & Financial Ledger Tampering**
   - *Attack*: Exploitation of vulnerable microservice input fields using `sqlmap` from VM 302 targeting the payment gateway.
   - *Defense*: PostgreSQL parameterized queries, WAF blocking via Caddy/Coraza, and Suricata alert rule generation upon detecting union-based payload signatures.
2. **Scenario 2: Privilege Escalation & SWIFT Bastion Compromise**
   - *Attack*: Lateral movement attempt from compromised web tier into the SWIFT Jumpbox (VM 313) using credential dumping.
   - *Defense*: Strict VLAN firewall rules blocking direct inter-VLAN transit; Wazuh HIDS triggers brute-force alert and activates automated iptables drop rules.
3. **Scenario 3: High-Frequency Transaction Velocity Abuse**
   - *Attack*: Automated carding/velocity script generating 500 fake payment authorizations per minute.
   - *Defense*: Suricata rate-limiting threshold rules, CrowdSec remediation bouncer, and transactional anomaly alerts routed to Prometheus.

---

## 5. Operational Lifecycle

Because the full thesis laboratory requires approximately 14 GB of RAM when all VMs execute simultaneously, the laboratory operates under the **On-Demand Spin-Up Lifecycle**:
- To begin a research drill: Execute `bash scripts/licenta-lab-start.sh`.
- Upon drill completion: Execute `bash scripts/licenta-lab-stop.sh` to reclaim memory for continuous 24/7 homelab operations.

---

<div align="center">

*Bachelor's Thesis Research Laboratory · **Moană Ștefănuț-Cornel** (`@stefanutc1`).*  
*Universitatea din Craiova · Facultatea de Economie și Administrarea Afacerilor (FEAA) · Informatică Economică (2024–2027).*

</div>
