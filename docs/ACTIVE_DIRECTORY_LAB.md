# Active Directory Multi-Generation Enterprise Laboratory (VM 400 – 405)

## 1. Executive Summary & Lab Scope

The **Active Directory Multi-Generation Enterprise Laboratory** is a specialized, production-parity identity and domain infrastructure deployed on **Proxmox VE Node 1 (Intel Core i3-10100F · x86_64)**. Spanning three Windows Server releases (2022 down to 2012 R2), two Windows client operating systems (Windows 10 Enterprise & Windows 7 Ultimate SP1), and enterprise Linux domain integration (Red Hat Enterprise Linux 9.8), this testbed facilitates deep research into:

1. **Cross-Forest & Inter-Domain Trusts**: Transitive two-way trusts, forest federation, and selective authentication.
2. **Active Directory Domain Services (AD DS) Functional Levels**: Migration pathways from legacy schemas (Windows Server 2012 R2 level) through 2016, 2019, and 2022.
3. **Cryptographic & Protocol Deprecation**: Hardening against NTLMv1/NTLMv2 fallback, SMBv1 deprecation, Kerberos RC4-HMAC phasing out in favor of AES-128/256-CTS-HMAC-SHA1-96, and PAC signature validation (KB5020805).
4. **Group Policy & Security Baselines**: Centralized GPO distribution, AppLocker application control, BitLocker recovery, and Sysmon telemetry.
5. **Cross-Platform Domain Integration**: Linux domain membership via SSSD / Realmd, Kerberos keytab management, and privilege delegation on Red Hat Enterprise Linux 9.8.
6. **Detection Engineering & SIEM Ingestion**: Windows Event Forwarding (WEF), Sysmon telemetry generation, and Wazuh SIEM agent integration for detecting Kerberoasting, AS-REP roasting, DCSync, and Golden/Silver ticket attacks.

---

## 2. VM Roster & Hardware Topology

All installation media are sourced directly from genuine Microsoft distribution channels via [massgrave.dev](https://massgrave.dev) and official enterprise distributions, guaranteeing clean official hashes without third-party modifications.

| VMID | Name | Operating System | vCPU | RAM (Allocated / Balloon) | Boot Disk | Chipset & Firmware | Network Interface | ISO Installation Media |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **400** | `ad2022` | Windows Server 2022 Standard | 2 vCPU | 4,096 MB / 2,048 MB | 60 GB VirtIO SCSI (`local-lvm`) | `q35` · SeaBIOS | `virtio`, `vmbr0` (VLAN 1) | `windows_server_2022_x64.iso` |
| **401** | `ad2016` | Windows Server 2016 Standard | 2 vCPU | 3,072 MB / 2,048 MB | 50 GB VirtIO SCSI (`local-lvm`) | `q35` · SeaBIOS | `virtio`, `vmbr0` (VLAN 1) | `en_windows_server_2016_vl_x64_dvd_11636701.iso` |
| **402** | `ad2012` | Windows Server 2012 R2 Standard | 2 vCPU | 1,024 MB / 1,024 MB | 50 GB VirtIO SCSI (`local-lvm`) | `i440fx` · SeaBIOS | `virtio`, `vmbr0` (VLAN 1) | `windows_server_2012_r2_x64.iso` |
| **403** | `adwin10` | Windows 10 Enterprise | 2 vCPU | 2,560 MB / 2,048 MB | 50 GB VirtIO SCSI (`local-lvm`) | `q35` · SeaBIOS | `virtio`, `vmbr0` (VLAN 1) | `windows_10_x64.iso` |
| **404** | `adwin7` | Windows 7 Ultimate SP1 | 2 vCPU | 2,048 MB / 1,024 MB | 50 GB VirtIO SCSI (`local-lvm`) | `pc` (i440fx) · SeaBIOS | `virtio`, `vmbr0` (VLAN 1) | `windows_7_sp1_x64.iso` |
| **405** | `adrhel` | Red Hat Enterprise Linux 9.8 | 2 vCPU | 1,536 MB / 1,024 MB | 50 GB VirtIO SCSI (`local-lvm`) | `q35` · OVMF UEFI | `virtio`, `vmbr0` (VLAN 1) | `rhel-9.8-x86_64-boot.iso` |

---

## 3. Replication & Domain Architecture

```mermaid
flowchart TD
    subgraph FOREST_ROOT["Forest Root & Core Infrastructure"]
        VM400["VM 400: ad2022<br/><b>Forest Root Primary DC</b><br/>Schema Master · Domain Naming Master<br/>PDC Emulator · DNS · DHCP"]
        VM401["VM 401: ad2016<br/><b>Enterprise Replica DC</b><br/>Trust Partner DC · Cross-Forest Trust"]
        VM402["VM 402: ad2012<br/><b>Legacy DC (2012 R2)</b><br/>Functional Level Migration Sandbox"]
    end

    subgraph CLIENTS_AND_WORKLOADS["Enterprise Member Clients & Linux Workloads"]
        VM403["VM 403: adwin10<br/><b>Win 10 Enterprise Client</b><br/>GPO Application & AppLocker Target"]
        VM404["VM 404: adwin7<br/><b>Win 7 Ultimate SP1 Client</b><br/>Legacy NTLM / SMBv1 Testing"]
        VM405["VM 405: adrhel<br/><b>RHEL 9.8 Enterprise Domain Workload</b><br/>SSSD · Realmd · Kerberos Keytab Auth"]
    end

    VM400 <==>|"Active Directory Replication (DRS RPC)"| VM401
    VM401 <==>|"Legacy Schema Compatibility"| VM402

    VM403 -.->|"Domain Join / Group Policy"| VM400
    VM404 -.->|"Domain Join / NetBIOS"| VM400
    VM405 -.->|"SSSD Domain Join / PAM Kerberos"| VM400
```

---

## 4. Activation & Licensing (Massgrave Genuine Integration)

The laboratory leverages genuine Microsoft volume licensing mechanisms via **Microsoft Activation Scripts (MAS)** hosted on [massgrave.dev](https://massgrave.dev):

* **KMS / GVLK Activation**: Automated deployment of official Generic Volume License Keys (GVLK) connected to local KMS emulation (`irm https://get.activated.win | iex`).
* **HWID & Digital License (Windows 10/11 Clients)**: Seamless digital licensing for testing Windows Enterprise and Education SKUs.
* **TSforge & Evaluation Conversions**: Conversion of evaluation media to full production SKUs using officially documented Microsoft DISM workflows:
  ```powershell
  # Check current edition
  dism /online /Get-CurrentEdition
  
  # Set target edition to ServerStandard / ServerDatacenter
  dism /online /Set-Edition:ServerDatacenter /ProductKey:<GVLK-KEY> /AcceptEula
  ```

---

## 5. Storage & VirtIO Ballooning Optimizations

1. **Local LVM Thin Provisioning**:
   * All disks reside on `local-lvm:data` with TRIM/discard support enabled (`discard=on,ssd=1`), ensuring zero unallocated block usage on the host NVMe SSD.
2. **Dynamic VirtIO Memory Ballooning**:
   * Virtual machines dynamically release unallocated RAM back to Proxmox VE when idle, allowing the entire 8-node Windows Active Directory lab to exist concurrently within the host's 12 GB RAM boundary.
3. **On-Demand Lifecycle Management (`onboot: 0`)**:
   * All lab VMs are configured with `onboot: 0` to prevent memory contention on host restart, booted selectively per active experimentation scenario.

---

## 6. Infrastructure as Code Declarations

* **Bash Creation Script**: [`scripts/create/x64/create_vms.sh`](../scripts/create/x64/create_vms.sh) (VMs 400 through 407)
* **Terraform Module**: [`terraform/proxmox/ad_lab.tf`](../terraform/proxmox/ad_lab.tf) & [`terraform/ad_lab.tf`](../terraform/ad_lab.tf)
* **Ansible Inventories**:
  * Root Inventory: [`inventory/hosts.yml`](../inventory/hosts.yml)
  * Homelab Inventory: [`ansible/inventories/homelab/hosts.yml`](../ansible/inventories/homelab/hosts.yml)
* **Web UI Dashboard**: [`web/src/app/data/services.data.ts`](../web/src/app/data/services.data.ts) and [`web/src/app/data/hardware.data.ts`](../web/src/app/data/hardware.data.ts)
