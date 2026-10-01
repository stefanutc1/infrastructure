# Capture The Flag (CTF) Write-Ups & Automated Exploit Arsenal

<div align="center">

[![CTF Event](https://img.shields.io/badge/Event-InvataCyber.ro%20CTF-blue.svg?style=flat&logo=target)](#)
[![Solved](https://img.shields.io/badge/Score-3%2F3%20Solved%20(100%25)-brightgreen.svg?style=flat&logo=checkmarx)](#)
[![Domain](https://img.shields.io/badge/Domain-Web%20Application%20Security-orange.svg?style=flat&logo=owasp)](#)
[![Author](https://img.shields.io/badge/Author-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)
[![University](https://img.shields.io/badge/University-Universitatea%20din%20Craiova%20%C2%B7%20FEAA-0284c7.svg?style=flat&logo=academia)](https://feaa.ucv.ro)

</div>

---

## Executive Summary

This directory archives technical writeups, custom exploit scripts, database dumpers, and proof-of-concept tooling developed during the **InvataCyber.ro Capture The Flag (CTF)** competition on 19 September 2026. All three challenges across client-side XSS, blind boolean database inference, and server-side template injection were solved with a 100% completion rate.

- **Master Centralized Report**: [`WRITEUP.md`](WRITEUP.md)

---

## 1. Challenge Master Matrix

| Challenge | Category | Vulnerability Class | Attack Mechanism & Impact | Technical Writeup |
| :--- | :--- | :--- | :--- | :--- |
| **The Blog** | Web / Client-Side | Stored XSS ([CWE-79](https://cwe.mitre.org/data/definitions/79.html)) | Unsanitized contact form $\rightarrow$ Privileged editor context theft via `/admin` | [`writeup_01_the_blog_xss.md`](writeup_01_the_blog_xss.md) |
| **Portal InvataCyber.ro** | Web / Database | Blind Boolean SQLi ([CWE-89](https://cwe.mitre.org/data/definitions/89.html)) | `Cookie: TrackingId` oracle $\rightarrow$ SQLite binary search inference $\rightarrow$ `/console` takeover | [`writeup_02_portal_lockdown_sqli.md`](writeup_02_portal_lockdown_sqli.md) |
| **CMS Newsroom** | Web / Server-Side | Broken Access Control ([CWE-306](https://cwe.mitre.org/data/definitions/306.html)) & SSTI ([CWE-1336](https://cwe.mitre.org/data/definitions/1336.html)) | Unauthenticated `/edit/5` panel $\rightarrow$ Jinja2 SSTI escape $\rightarrow$ Remote Code Execution (`/flag.txt`) | [`writeup_03_cms_editor_ssti.md`](writeup_03_cms_editor_ssti.md) |

---

## 2. Exploit Tooling Architecture

### Challenge 1: The Blog (Stored XSS)
* [`payload.js`](payload.js): Asynchronous JavaScript payload querying the privileged `/admin` route and exfiltrating HTML contents to an external webhook.
* [`solver.py`](solver.py): Automated HTTP POST script injecting the minified XSS payload into the target contact form.

### Challenge 2: Portal InvataCyber.ro (Blind Boolean SQLi)
* [`sql_solve.py`](sql_solve.py): High-speed True/False condition oracle validator across `TrackingId` cookies.
* [`extract_creds.py`](extract_creds.py): Proof-of-concept expression evaluator for boolean SQL statements.
* [`flag.py`](flag.py): Probing script determining existence of system tables (`sqlite_master`).
* [`dump_sqlite.py`](dump_sqlite.py): High-speed character-by-character table enumerator.
* [`dump_schema.py`](dump_schema.py): DDL schema extractor for the tracking database.
* [`dump_all_schema.py`](dump_all_schema.py): Recursive database-wide schema dumper.
* [`dump_users.py`](dump_users.py): Automated binary-search credentials dumper (`username`, `password`) from table `users`.
* [`solver_portal.py`](solver_portal.py): Multi-threaded discovery scanner locating hidden administrative endpoints (`/console`, `/login-admin`).

### Challenge 3: CMS Newsroom (SSTI to RCE)
* [`blog_flag.py`](blog_flag.py): Automated exploit script targeting the unauthenticated editor panel and executing system commands via Jinja2 SSTI (`cat /flag.txt`).

---

## 3. Quickstart & Execution

Install dependencies:
```bash
pip install -r requirements.txt
```

Run solvers:
```bash
python3 solver.py
python3 dump_users.py
python3 blog_flag.py
```
