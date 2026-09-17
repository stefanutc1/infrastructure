# [Challenge / Machine Name] — [Platform]

[![Category](https://img.shields.io/badge/Category-Binary%20Exploitation-red?style=flat)]()
[![Difficulty](https://img.shields.io/badge/Difficulty-Medium-orange?style=flat)]()
[![Video Walkthrough](https://img.shields.io/badge/YouTube-Watch%20Walkthrough-red?style=flat&logo=youtube)](https://youtube.com/...)

---

## 1. Executive & Technical Summary
* **Target**: `target.ctf.host:1337` / `10.10.11.X`
* **Vulnerability Class**: Stack Buffer Overflow via insecure `gets()` $\to$ Ret2libc (Bypass NX).
* **Final Objective / Flag**: Captured remote root/user flag via automated Python script.

---

## 2. Static & Dynamic Analysis
* **Binary Protections (`checksec`)**:
  * `Arch`: amd64-64-little
  * `RELRO`: Partial RELRO
  * `Stack`: No canary found
  * `NX`: NX enabled
  * `PIE`: No PIE (0x400000)
  * `ASLR`: Enabled on target host

---

## 3. Weaponized Exploit Code
The complete automated solver is maintained in [`exploit.py`](./exploit.py):

\`\`\`bash
# Run locally with GDB attached
python3 exploit.py --debug

# Run against remote competition target
python3 exploit.py --remote target.ctf.host 1337
\`\`\`

---

## 4. Remediation & Defensive Lessons (Blue Team View)
* Replace unsafe string ingestion (`gets`, `strcpy`) with bounded alternatives (`fgets`, `strncpy`).
* Compile with full hardening flags: `-fstack-protector-strong -D_FORTIFY_SOURCE=2 -Wl,-z,relro,-z,now -fPIE -pie`.
