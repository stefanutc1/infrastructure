# Research Environment: Active Directory Attack & Defense Range

## Context & Research Scope
Enterprise networks overwhelmingly rely on Microsoft Active Directory Domain Services (AD DS) and Azure AD/Entra ID for identity, authentication, and policy distribution. Consequently, Active Directory remains the primary target for advanced persistent threat (APT) actors seeking domain dominance.

This cyber range provides a multi-version, multi-forest research environment for:
1. Simulating modern and legacy Active Directory security attacks.
2. Developing and tuning Sigma / Wazuh detection rules for Kerberos abuse.
3. Mapping identity attack paths using BloodHound.
4. Analyzing domain migration vulnerabilities across Windows Server releases (2003 through 2025).

---

## Active Directory Fleet Inventory

| VMID | Hostname | Operating System | Domain Role | Assigned RAM | Disk | Network & IP |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **VM 400** | `ad2025` | Windows Server 2025 Datacenter | Forest Root DC (2025 Functional Level) | 8,192 MB (Balloon: 4,096) | 256 GB | VLAN 10 (`192.168.1.225`) |
| **VM 401** | `ad2022` | Windows Server 2022 Datacenter | Domain Controller (Production Baseline) | 4,096 MB (Balloon: 2,048) | 60 GB | VLAN 10 (`192.168.1.222`) |
| **VM 402** | `ad2019` | Windows Server 2019 Standard | Child Domain Controller | 2,048 MB (Balloon: 1,024) | 128 GB | VLAN 10 (`192.168.1.219`) |
| **VM 403** | `ad2016` | Windows Server 2016 Standard | Legacy Support DC | 3,072 MB (Balloon: 2,048) | 50 GB | VLAN 10 (`192.168.1.216`) |
| **VM 404** | `ad2012` | Windows Server 2012 R2 Standard | Legacy Migration DC | 2,048 MB (Balloon: 1,024) | 40 GB | VLAN 10 (`192.168.1.212`) |
| **VM 405** | `ad2008` | Windows Server 2008 R2 SP1 Standard | Legacy Vulnerable DC (No AES Kerberos) | 2,048 MB (Balloon: 1,024) | 40 GB | VLAN 10 (`192.168.1.208`) |
| **VM 406** | `adwin10` | Windows 10 Enterprise | Domain Workstation (Standard User) | 3,072 MB (Balloon: 2,048) | 50 GB | VLAN 10 (`192.168.1.217`) |
| **VM 407** | `adwin11` | Windows 11 Enterprise | Modern Workstation (Credential Guard) | 4,096 MB (Balloon: 2,048) | 60 GB | VLAN 10 (`192.168.1.218`) |
| **VM 408** | `adwin7` | Windows 7 Ultimate SP1 | Unpatched Legacy Workstation | 2,048 MB (Balloon: 1,024) | 50 GB | VLAN 10 (`192.168.1.207`) |
| **VM 409** | `adrhel` | RHEL 9.8 Enterprise | SSSD / Realm Domain-Joined Linux Node | 2,048 MB (Balloon: 1,024) | 50 GB | VLAN 10 (`192.168.1.228`) |
| **VM 410** | `ad2003` | Windows Server 2003 R2 Enterprise | Retro Archival DC (Historical Research) | 2,048 MB (Balloon: 1,024) | 40 GB | VLAN 10 (`192.168.1.209`) |

---

## Validated Cyber Drills & Detection Engineering

### 1. Kerberoasting & Service Principal Name (SPN) Abuse
- **Objective**: Request TGS service tickets for user accounts with registered SPNs and crack the RC4/AES hashes offline.
- **Attack Tooling**: Impacket `GetUserSPNs.py`, Rubeus.
- **Detection Baseline**:
  - Event ID 4769 (A Kerberos service ticket was requested) with Encryption Type `0x17` (RC4-HMAC) requested by non-machine accounts.
  - Sigma Rule: `win_security_kerberoasting_spn.yml` running in Wazuh / Security Onion.

### 2. AS-REP Roasting
- **Objective**: Target domain user accounts with the `DONT_REQ_PREAUTH` attribute enabled to extract encrypted TGT hashes without authentication.
- **Attack Tooling**: Impacket `GetNPUsers.py`.
- **Detection Baseline**:
  - Event ID 4768 (A Kerberos authentication ticket was requested) where Pre-Authentication Type is `0`.

### 3. Active Directory Attack Path Graphing (BloodHound)
- **Objective**: Collect domain object relationships, group memberships, and ACL misconfigurations using SharpHound.
- **Defense & Remediation**: Auditing GenericAll, WriteDacl, and ForceChangePassword permissions granted to unprivileged security principals.

---

## Operational Constraint & Spin-Up Protocol
The total declared RAM across the entire Active Directory fleet is **35GB**, which substantially exceeds the 12GB physical capacity of Node 1.

**Operational Mandate**:
1. All AD VMs are stored in an unpowered state (`qm status <vmid>` -> `stopped`).
2. Only paired research topologies (max 2–3 VMs simultaneously) may be booted for active exercises (e.g., VM 401 DC + VM 406 Client = ~5GB RAM combined).
3. The spin-up script enforces automated checks preventing starting additional AD VMs if host free memory drops below 2.5GB.
