# Security Benchmark: Linux CIS Hardening Baseline

## Objective
Establish a formal, auditable security baseline for all bare-metal hypervisors (Proxmox VE), container hosts, and Linux virtual machines across the infrastructure platform. This specification implements controls derived from the **CIS Linux Benchmark (Distribution Independent, Level 1 Server)**.

---

## 1. Operating System & Kernel Hardening (`/etc/sysctl.d/99-cis-hardening.conf`)

All Linux hosts enforce the following kernel-level parameters:

```ini
# IP Spoofing protection & Reverse Path Filtering
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP broadcast requests (Smurf attack mitigation)
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignore bogus ICMP error responses
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Disable ICMP redirect acceptance (Mitigate MITM route alterations)
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Disable Source Routing (Prevent packet path hijacking)
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# TCP SYN Cookies (SYN Flood DDoS mitigation)
net.ipv4.tcp_syncookies = 1

# Disable IPv6 Router Solicitations and Redirects
net.ipv6.conf.all.accept_ra = 0
net.ipv6.conf.default.accept_ra = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Enable ASLR (Address Space Layout Randomization)
kernel.randomize_va_space = 2

# Restrict dmesg kernel log access to root only
kernel.dmesg_restrict = 1

# Restrict ptrace execution (Prevent memory snooping between processes)
kernel.yama.ptrace_scope = 1
```

---

## 2. SSH Daemon Hardening (`/etc/ssh/sshd_config.d/99-cis-sshd.conf`)

Remote administrative access is strictly constrained:

```text
# Port and Protocol
Port 22
Protocol 2

# Authentication & Keys
PermitRootLogin prohibit-password
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no
AuthenticationMethods publickey

# Cryptography & Ciphers (Modern Algorithms Only)
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group16-sha512
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

# Session Controls
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
MaxSessions 5
X11Forwarding no
AllowAgentForwarding no
```

---

## 3. Account & Access Governance
1. **Root Password Prohibition**: Direct root password login is disabled. Administrative operations require standard unprivileged user authentication into the `wheel` or `sudo` group.
2. **Sudoers Hardening**:
   - `Defaults env_reset, timestamp_timeout=15`
   - Explicit logging of all sudo executions to `/var/log/sudo.log`.
3. **Password Hashing**: System passwords must use SHA-512 (`yescrypt` on modern Debian/Ubuntu) with high round iterations.

---

## 4. Filesystem Permissions & Partition Security
1. **Critical Filesystem Permissions**:
   - `/etc/shadow`: `0600 root:root`
   - `/etc/passwd`: `0644 root:root`
   - `/etc/group`: `0644 root:root`
   - `/etc/sudoers`: `0440 root:root`
2. **Mount Hardening Options**:
   - `/tmp`: `nodev,nosuid,noexec`
   - `/var/tmp`: `nodev,nosuid,noexec`
   - `/dev/shm`: `nodev,nosuid,noexec`

---

## 5. Audit & Telemetry Integration
All Linux hosts run the **Wazuh HIDS agent** (`wazuh-agent`), actively monitoring:
- File Integrity Monitoring (FIM) across `/etc`, `/usr/bin`, and `/usr/sbin`.
- Sudo invocation logs and failed authentication attempts.
- Rootkit detection (`rootcheck`) and CIS benchmark score audits.
