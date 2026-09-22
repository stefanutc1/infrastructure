/**
 * Authoritative Infrastructure Data Model & Single Source of Truth
 * Derived strictly from repository configuration files:
 * - terraform/ (proxmox, cloud, ad_lab.tf)
 * - services/x64/ (lxc/, qemu-server/)
 * - inventories/homelab/hosts.yml
 * - cyber/ investigations
 * - .github/workflows/
 */

export interface PhysicalNode {
  id: string;
  name: string;
  hostname: string;
  machineModel: string;
  machineModelRo: string;
  cpu: string;
  cpuCores: number;
  cpuThreads: number;
  cpuClock: string;
  gpu?: string;
  ramMb: number;
  ramFormatted: string;
  zramConfig?: string;
  storageFormatted: string;
  storageType: string;
  os: string;
  kernel: string;
  ip: string;
  status: 'OPERATIONAL' | 'STANDBY';
  role: string;
  roleRo: string;
  tags: string[];
}

export interface VirtualMachine {
  vmid: number;
  name: string;
  node: string;
  os: string;
  cores: number;
  allocatedMb: number;
  balloonMinMb?: number;
  storageGb: number;
  ip: string;
  vlan?: number;
  status: 'OPERATIONAL' | 'STANDBY';
  purpose: string;
  purposeRo: string;
  tags: string[];
  subsystem: 'core' | 'security' | 'ad' | 'banking' | 'cyber';
}

export interface LXCContainer {
  ctid: number;
  hostname: string;
  node: string;
  os: string;
  cores: number;
  ramMb: number;
  storageGb: number;
  ip: string;
  vlan?: number;
  status: 'OPERATIONAL' | 'STANDBY';
  purpose: string;
  purposeRo: string;
  tags: string[];
  subsystem: 'core' | 'storage' | 'monitoring' | 'security' | 'automation' | 'banking';
}

export interface NetworkVLAN {
  vlanId: number;
  name: string;
  subnet: string;
  gateway: string;
  bridge: string;
  purpose: string;
  purposeRo: string;
  firewallRules: string;
  isolated: boolean;
  color: string;
}

export interface ThesisComponent {
  id: string;
  vmidOrCtid: number;
  type: 'VM' | 'LXC';
  name: string;
  role: string;
  roleRo: string;
  ip: string;
  vlan: number;
  technology: string;
  securityControls: string[];
  status: 'IMPLEMENTED' | 'SIMULATED' | 'LABORATORY';
  description: string;
  descriptionRo: string;
}

export interface ThesisDataFlowStep {
  stepNumber: number;
  source: string;
  destination: string;
  protocol: string;
  action: string;
  actionRo: string;
  securityCheck: string;
  securityCheckRo: string;
}

export interface ActiveDirectoryMember {
  vmid: number;
  hostname: string;
  role: string;
  roleRo: string;
  os: string;
  ip: string;
  ramMb: number;
  status: 'ACTIVE_RUNTIME' | 'DECLARATIVE_BLUEPRINT';
  detectionEngine: string;
  auditPolicies: string[];
}

export interface CyberInvestigation {
  caseId: string;
  title: string;
  titleRo: string;
  category: string;
  date: string;
  status: string;
  author: string;
  summary: string;
  summaryRo: string;
  attackVector: string;
  attackVectorRo: string;
  threatActorTTPs: string[];
  keyIoCs: { type: string; value: string }[];
  disposition: string;
  dispositionRo: string;
  evidenceDir: string;
  mitreTechniques: string[];
}

export interface CiCdGate {
  id: string;
  name: string;
  stage: 'security' | 'lint' | 'validation' | 'deploy';
  tool: string;
  scope: string;
  blocking: boolean;
  description: string;
  command: string;
}

// ==========================================
// PHYSICAL COMPUTE FLEET (3 BARE-METAL NODES)
// ==========================================
export const PHYSICAL_NODES_DATA: PhysicalNode[] = [
  {
    id: 'node1-pve',
    name: 'Proxmox VE Primary Hypervisor',
    hostname: 'pve_primary_x64',
    machineModel: 'Custom Desktop Micro-Datacenter Chassis',
    machineModelRo: 'Șasiu Micro-Datacenter Custom x86_64',
    cpu: 'Intel Core i3-10100F',
    cpuCores: 4,
    cpuThreads: 8,
    cpuClock: '3.60 GHz base / 4.30 GHz turbo',
    gpu: 'NVIDIA GeForce GTX 1050 Ti (4GB GDDR5 · Dedicated PCIe Passthrough to Ollama CT 102)',
    ramMb: 12288,
    ramFormatted: '12 GB DDR4-2133',
    zramConfig: '6.0 GB /dev/zram0 (lz4 compression, swappiness 60, prio 100)',
    storageFormatted: '512 GB NVMe SSD (Local LVM Thin Pool)',
    storageType: 'NVMe LVM-Thin',
    os: 'Proxmox VE 9.2 (Debian Bookworm base)',
    kernel: 'Linux 7.0 pve-kernel',
    ip: '192.168.1.132',
    status: 'OPERATIONAL',
    role: 'Core bare-metal hypervisor orchestrating 8 production LXCs (100–106, 312), perimeter firewall OPNsense (VM 200), Active Directory lab (VMs 400–405), and Banking Thesis cluster (VMs 310, 311, 313).',
    roleRo: 'Hypervisor principal bare-metal ce orchestrează 8 containere LXC (100–106, 312), firewall-ul OPNsense (VM 200), laboratorul Active Directory (VMs 400–405) și clusterul bancar de licență (VMs 310, 311, 313).',
    tags: ['Primary Hypervisor', 'x86_64', 'GTX 1050 Ti', 'ZRAM lz4', 'LVM-Thin', 'Node 1']
  },
  {
    id: 'node2-omv',
    name: 'OpenMediaVault Centralized NAS',
    hostname: 'omv_nas',
    machineModel: 'ASUS X451MA Chassis',
    machineModelRo: 'Șasiu Laptop ASUS X451MA',
    cpu: 'Intel Celeron N2830',
    cpuCores: 2,
    cpuThreads: 2,
    cpuClock: '2.16 GHz base / 2.41 GHz burst',
    ramMb: 2048,
    ramFormatted: '2 GB DDR3L',
    storageFormatted: '500 GB Mechanical HDD (SATA II)',
    storageType: 'ZFS Pool / ext4',
    os: 'OpenMediaVault 7 (Debian 12 Bookworm)',
    kernel: 'Linux 6.1 amd64',
    ip: '192.168.1.135',
    status: 'OPERATIONAL',
    role: 'Centralized network storage offering NFS and SMB shares, secondary hypervisor backup pool (VZDump), and offline data storage.',
    roleRo: 'Stocare centralizată în rețea oferind partajări NFS și SMB, țintă de backup secundară VZDump pentru hypervisor și arhivă offline.',
    tags: ['NAS', 'OpenMediaVault', 'NFS', 'SMB', 'Backup Repository', 'Node 2']
  },
  {
    id: 'node4-k8s',
    name: 'Kubernetes Bare-Metal Worker',
    hostname: 'k8s_node_04',
    machineModel: 'Custom ATX Compute Chassis',
    machineModelRo: 'Șasiu ATX Compute Bare-Metal',
    cpu: 'AMD Athlon II X2 220',
    cpuCores: 2,
    cpuThreads: 2,
    cpuClock: '2.80 GHz Regor',
    gpu: 'NVIDIA GeForce GTS 250 (1GB GDDR3 / 256-bit bus)',
    ramMb: 4096,
    ramFormatted: '4 GB DDR3-1333',
    storageFormatted: '80 GB SATA HDD (Local cache + NFS mounts)',
    storageType: 'SATA Local Cache',
    os: 'Alpine Linux 3.20 (Hardened Minimal)',
    kernel: 'Linux 6.6 LTS',
    ip: '192.168.1.18',
    status: 'OPERATIONAL',
    role: 'Lightweight bare-metal Kubernetes (k3s) agent worker executing batch jobs, container runtime probes, and kernel security experiments.',
    roleRo: 'Nod worker Kubernetes (k3s) lightweight pe hardware fizic ce rulează sarcini batch containerizate, sonde de rețea și teste de securitate la nivel de kernel.',
    tags: ['Kubernetes', 'k3s-agent', 'Alpine Linux', 'Containerd', 'Bare-Metal', 'Node 4']
  }
];

// ==========================================
// VIRTUAL MACHINES (15 QEMU/KVM INSTANCES)
// ==========================================
export const VIRTUAL_MACHINES_DATA: VirtualMachine[] = [
  {
    vmid: 200,
    name: 'opnsense',
    node: 'Node 1 (pve)',
    os: 'Hardened FreeBSD 14.1 (pf)',
    cores: 2,
    allocatedMb: 2048,
    balloonMinMb: 1024,
    storageGb: 16,
    ip: '192.168.1.134',
    vlan: 10,
    status: 'OPERATIONAL',
    purpose: 'Perimeter stateful firewall, Suricata IDS/IPS, WireGuard VPN mesh, and Unbound DNS sinkhole.',
    purposeRo: 'Firewall perimetral cu inspecție cu stare, IDS/IPS Suricata, WireGuard și sinkhole DNS Unbound.',
    tags: ['Firewall', 'FreeBSD', 'pf', 'Suricata', 'WireGuard', 'Unbound'],
    subsystem: 'security'
  },
  {
    vmid: 201,
    name: 'openstack',
    node: 'Node 1 (pve)',
    os: 'Ubuntu 22.04 LTS (Kolla-Ansible)',
    cores: 2,
    allocatedMb: 4096,
    balloonMinMb: 2048,
    storageGb: 32,
    ip: '192.168.1.136',
    status: 'STANDBY',
    purpose: 'Single-node OpenStack controller deployed via Kolla-Ansible for SDN Neutron testing.',
    purposeRo: 'Controller OpenStack single-node implementat prin Kolla-Ansible pentru testarea rețelelor SDN.',
    tags: ['OpenStack', 'Kolla-Ansible', 'SDN', 'Neutron', 'Private Cloud'],
    subsystem: 'core'
  },
  {
    vmid: 300,
    name: 'parrot',
    node: 'Node 1 (pve)',
    os: 'Parrot Security OS (Linux 6.5)',
    cores: 2,
    allocatedMb: 2048,
    balloonMinMb: 1536,
    storageGb: 30,
    ip: '192.168.1.30',
    status: 'OPERATIONAL',
    purpose: 'Dedicated offensive security and digital forensics analysis workstation.',
    purposeRo: 'Stație de lucru dedicată pentru teste de penetrare și analiză criminalistică.',
    tags: ['Parrot OS', 'Pentesting', 'DFIR', 'Offensive Security', 'Wireshark'],
    subsystem: 'cyber'
  },
  {
    vmid: 301,
    name: 'metasploitable2',
    node: 'Node 1 (pve)',
    os: 'Ubuntu Linux 8.04 (Kernel 2.6)',
    cores: 1,
    allocatedMb: 512,
    balloonMinMb: 256,
    storageGb: 8,
    ip: '192.168.30.10',
    vlan: 30,
    status: 'STANDBY',
    purpose: 'Deliberately vulnerable Linux environment for offensive drills and IDS signature calibration.',
    purposeRo: 'Mediu Linux deliberat vulnerabil pentru simulări de exploatare și calibrarea regulilor IDS.',
    tags: ['Metasploitable', 'Vulnerable', 'VLAN 30', 'Exploit Target'],
    subsystem: 'cyber'
  },
  {
    vmid: 303,
    name: 'malware',
    node: 'Node 1 (pve)',
    os: 'Windows 10 Enterprise (Flare-VM)',
    cores: 2,
    allocatedMb: 2560,
    balloonMinMb: 1536,
    storageGb: 50,
    ip: '192.168.30.20',
    vlan: 30,
    status: 'STANDBY',
    purpose: 'Dynamic malware analysis sandbox with Flare-VM, Procmon, x64dbg, and behavioral detonation.',
    purposeRo: 'Sandbox dinamic de analiză malware dotat cu Flare-VM, Procmon și depanatoare de memorie.',
    tags: ['Flare-VM', 'Malware Analysis', 'Sandbox', 'VLAN 30', 'Reverse Engineering'],
    subsystem: 'cyber'
  },
  {
    vmid: 304,
    name: 'remnux',
    node: 'Node 1 (pve)',
    os: 'REMnux Linux (Ubuntu based)',
    cores: 2,
    allocatedMb: 4096,
    balloonMinMb: 2048,
    storageGb: 40,
    ip: '192.168.30.30',
    vlan: 30,
    status: 'STANDBY',
    purpose: 'Static malware triage, executable deobfuscation, and memory dump forensics with Volatility.',
    purposeRo: 'Triaj static de malware, deobfuscare de fișiere și criminalistică de memorie cu Volatility.',
    tags: ['REMnux', 'Static Analysis', 'Volatility', 'VLAN 30', 'Disassembly'],
    subsystem: 'cyber'
  },
  {
    vmid: 310,
    name: 'core-banking-licenta',
    node: 'Node 1 (pve)',
    os: 'Debian 12 Bookworm (Apache Fineract)',
    cores: 2,
    allocatedMb: 4096,
    balloonMinMb: 2048,
    storageGb: 40,
    ip: '192.168.20.50',
    vlan: 20,
    status: 'STANDBY',
    purpose: 'Bachelor Thesis core banking engine: double-entry general ledger, account management, strict VLAN 20.',
    purposeRo: 'Motor central bancar de licență: contabilitate în partidă dublă, registre contabile, izolare VLAN 20.',
    tags: ['Core Banking', 'Apache Fineract', 'Double Entry', 'VLAN 20', 'Licenta'],
    subsystem: 'banking'
  },
  {
    vmid: 311,
    name: 'fin-db-licenta',
    node: 'Node 1 (pve)',
    os: 'Debian 12 Bookworm (PostgreSQL 16)',
    cores: 2,
    allocatedMb: 4096,
    balloonMinMb: 2048,
    storageGb: 50,
    ip: '192.168.20.51',
    vlan: 20,
    status: 'STANDBY',
    purpose: 'PostgreSQL 16 financial database with ACID transactions, pgAudit logging, and Wazuh HIDS tamper monitoring.',
    purposeRo: 'Bază de date financiară PostgreSQL 16 cu tranzacții ACID, jurnalizare pgAudit și monitorizare Wazuh.',
    tags: ['PostgreSQL 16', 'pgAudit', 'ACID', 'VLAN 20', 'Licenta'],
    subsystem: 'banking'
  },
  {
    vmid: 313,
    name: 'swift-jumpbox-licenta',
    node: 'Node 1 (pve)',
    os: 'Hardened Linux (Bastion Host)',
    cores: 2,
    allocatedMb: 2048,
    balloonMinMb: 1024,
    storageGb: 25,
    ip: '192.168.10.50',
    vlan: 10,
    status: 'STANDBY',
    purpose: 'Administrative jump-box requiring ed25519 SSH keys and TOTP MFA, shielding banking core from untrusted subnets.',
    purposeRo: 'Bastion administrativ securizat cu chei SSH ed25519 și MFA TOTP ce izolează nucleul bancar.',
    tags: ['Bastion', 'SSH ed25519', 'MFA TOTP', 'VLAN 10', 'Licenta'],
    subsystem: 'banking'
  },
  {
    vmid: 400,
    name: 'ad2022',
    node: 'Node 1 (pve)',
    os: 'Windows Server 2022 Datacenter',
    cores: 2,
    allocatedMb: 4096,
    balloonMinMb: 2048,
    storageGb: 60,
    ip: '192.168.1.222',
    status: 'OPERATIONAL',
    purpose: 'Active Directory Forest Root PDC holding FSMO roles, Kerberos KDC, and authoritative DNS.',
    purposeRo: 'Domain Controller principal (PDC) cu toate cele 5 roluri FSMO, Kerberos KDC și DNS autoritar.',
    tags: ['Active Directory', 'Windows Server 2022', 'FSMO', 'Kerberos', 'DNS', 'Tier 0'],
    subsystem: 'ad'
  },
  {
    vmid: 401,
    name: 'ad2016',
    node: 'Node 1 (pve)',
    os: 'Windows Server 2016 Standard',
    cores: 2,
    allocatedMb: 3072,
    balloonMinMb: 1536,
    storageGb: 50,
    ip: '192.168.1.223',
    status: 'OPERATIONAL',
    purpose: 'Secondary Domain Controller providing multi-master replication and Global Catalog (GC).',
    purposeRo: 'Domain Controller secundar oferind replicare multi-master și catalog global (GC).',
    tags: ['Active Directory', 'Windows Server 2016', 'Replication', 'Global Catalog', 'Tier 0'],
    subsystem: 'ad'
  },
  {
    vmid: 402,
    name: 'ad2012',
    node: 'Node 1 (pve)',
    os: 'Windows Server 2012 R2',
    cores: 2,
    allocatedMb: 1024,
    balloonMinMb: 512,
    storageGb: 50,
    ip: '192.168.1.224',
    status: 'OPERATIONAL',
    purpose: 'Child Domain Controller & Active Directory Certificate Services (AD CS Enterprise Root CA).',
    purposeRo: 'Domain Controller copil și Autoritate de Certificare Enterprise (AD CS Root CA).',
    tags: ['Active Directory', 'Windows Server 2012 R2', 'AD CS', 'PKI', 'Legacy Trust'],
    subsystem: 'ad'
  },
  {
    vmid: 403,
    name: 'adwin10',
    node: 'Node 1 (pve)',
    os: 'Windows 10 Enterprise (x64)',
    cores: 2,
    allocatedMb: 2560,
    balloonMinMb: 1024,
    storageGb: 50,
    ip: '192.168.1.226',
    status: 'OPERATIONAL',
    purpose: 'Domain-joined workstation enforcing GPOs, AppLocker, and Sysmon telemetry forwarding to Wazuh.',
    purposeRo: 'Stație de lucru înrolată în domeniu cu GPO, AppLocker și telemetrie Sysmon către Wazuh.',
    tags: ['Windows 10', 'Domain Member', 'GPO', 'Sysmon', 'Endpoint Telemetry'],
    subsystem: 'ad'
  },
  {
    vmid: 404,
    name: 'adwin7',
    node: 'Node 1 (pve)',
    os: 'Windows 7 SP1 (x64)',
    cores: 2,
    allocatedMb: 2048,
    balloonMinMb: 1024,
    storageGb: 50,
    ip: '192.168.1.227',
    status: 'OPERATIONAL',
    purpose: 'Legacy domain client for protocol testing (SMBv1, NTLM relaying, NetBIOS legacy drills).',
    purposeRo: 'Client legacy în domeniu pentru simulări de protocoale vechi (SMBv1, NTLM relaying).',
    tags: ['Windows 7', 'Legacy Client', 'SMBv1', 'NTLM', 'Drill Target'],
    subsystem: 'ad'
  },
  {
    vmid: 405,
    name: 'adrhel',
    node: 'Node 1 (pve)',
    os: 'Red Hat Enterprise Linux 9.4',
    cores: 2,
    allocatedMb: 1536,
    balloonMinMb: 1024,
    storageGb: 50,
    ip: '192.168.1.228',
    status: 'OPERATIONAL',
    purpose: 'Heterogeneous Linux client joined to Active Directory realm via SSSD and Kerberos for centralized auth.',
    purposeRo: 'Client Linux heterogen integrat în domeniul Active Directory prin SSSD și Kerberos.',
    tags: ['RHEL 9', 'SSSD', 'Kerberos', 'Linux Domain Join', 'PAM'],
    subsystem: 'ad'
  }
];

// ==========================================
// LXC CONTAINERS (8 CONTAINERS)
// ==========================================
export const LXC_CONTAINERS_DATA: LXCContainer[] = [
  {
    ctid: 100,
    hostname: 'homeassistant',
    node: 'Node 1 (pve)',
    os: 'Alpine Linux 3.19',
    cores: 1,
    ramMb: 128,
    storageGb: 16,
    ip: '192.168.1.10',
    status: 'OPERATIONAL',
    purpose: 'Central smart home controller, Zigbee gateway, and IoT telemetry aggregator.',
    purposeRo: 'Hub central de automatizare locuință, gateway Zigbee și telemetrie IoT.',
    tags: ['Smart Home', 'IoT', 'Zigbee', 'Automation', 'CT 100'],
    subsystem: 'automation'
  },
  {
    ctid: 101,
    hostname: 'scrutiny',
    node: 'Node 1 (pve)',
    os: 'Ubuntu 22.04 LTS',
    cores: 1,
    ramMb: 96,
    storageGb: 3,
    ip: '192.168.1.108',
    status: 'OPERATIONAL',
    purpose: 'S.M.A.R.T. drive telemetry collector, bad sector tracking, and disk wear prediction.',
    purposeRo: 'Colector de telemetrie SMART discuri, monitorizare sectoare și predicție fiabilitate.',
    tags: ['Storage Health', 'SMART', 'Telemetry', 'Disk Monitor', 'CT 101'],
    subsystem: 'storage'
  },
  {
    ctid: 102,
    hostname: 'ollama',
    node: 'Node 1 (pve)',
    os: 'Ubuntu 24.04 LTS (NVIDIA CUDA 12)',
    cores: 4,
    ramMb: 2048,
    storageGb: 16,
    ip: '192.168.1.110',
    status: 'OPERATIONAL',
    purpose: 'Local LLM inference runtime with NVIDIA GTX 1050 Ti PCIe passthrough for AI workloads.',
    purposeRo: 'Runtime local de modele lingvistice cu accelerare hardware NVIDIA GTX 1050 Ti.',
    tags: ['AI', 'LLM', 'CUDA', 'GTX 1050 Ti', 'Inference', 'CT 102'],
    subsystem: 'core'
  },
  {
    ctid: 103,
    hostname: 'uptimekuma',
    node: 'Node 1 (pve)',
    os: 'Debian 12 Bookworm',
    cores: 1,
    ramMb: 128,
    storageGb: 2,
    ip: '192.168.1.119',
    status: 'OPERATIONAL',
    purpose: 'High-frequency service availability monitor probing HTTP, TCP, and DNS endpoints.',
    purposeRo: 'Monitorizare de înaltă frecvență a disponibilității serviciilor HTTP, TCP și DNS.',
    tags: ['Uptime', 'Monitoring', 'Status Page', 'Healthcheck', 'CT 103'],
    subsystem: 'monitoring'
  },
  {
    ctid: 104,
    hostname: 'monitoring',
    node: 'Node 1 (pve)',
    os: 'Debian 12 Bookworm',
    cores: 1,
    ramMb: 256,
    storageGb: 4,
    ip: '192.168.1.121',
    status: 'OPERATIONAL',
    purpose: 'Centralized observability engine pairing Prometheus TSDB scraping with Grafana dashboards.',
    purposeRo: 'Motor centralizat de observabilitate ce combină Prometheus TSDB cu tablouri Grafana.',
    tags: ['Prometheus', 'Grafana', 'Metrics', 'TSDB', 'Dashboards', 'CT 104'],
    subsystem: 'monitoring'
  },
  {
    ctid: 105,
    hostname: 'owasp',
    node: 'Node 1 (pve)',
    os: 'Debian 12 Bookworm (Node.js)',
    cores: 2,
    ramMb: 512,
    storageGb: 8,
    ip: '192.168.1.175',
    status: 'OPERATIONAL',
    purpose: 'Intentionally vulnerable web application (OWASP Juice Shop) for offensive security drills.',
    purposeRo: 'Aplicație web vulnerabilă controlată (OWASP Juice Shop) pentru simulări ofensive.',
    tags: ['OWASP', 'Juice Shop', 'Pentest Target', 'CyberLab', 'CT 105'],
    subsystem: 'security'
  },
  {
    ctid: 106,
    hostname: 'wazuh',
    node: 'Node 1 (pve)',
    os: 'Debian 12 Bookworm',
    cores: 4,
    ramMb: 6144,
    storageGb: 35,
    ip: '192.168.1.240',
    status: 'OPERATIONAL',
    purpose: 'Enterprise SIEM / XDR manager with OpenSearch 2.19 (4GB JVM Heap), FIM, and log ingestion.',
    purposeRo: 'Platformă enterprise SIEM / XDR cu OpenSearch 2.19 (Heap JVM 4GB) și analiză de securitate.',
    tags: ['SIEM', 'XDR', 'Wazuh', 'OpenSearch', 'Compliance', 'FIM', 'CT 106'],
    subsystem: 'security'
  },
  {
    ctid: 312,
    hostname: 'payment-gateway-licenta',
    node: 'Node 1 (pve)',
    os: 'Debian 12 Bookworm (FastAPI)',
    cores: 1,
    ramMb: 1024,
    storageGb: 10,
    ip: '192.168.20.52',
    vlan: 20,
    status: 'STANDBY',
    purpose: 'FastAPI payment processor simulating Visa/Mastercard Luhn validation and SWIFT MT103 messaging.',
    purposeRo: 'Gateway de plăți FastAPI cu validare carduri Luhn și simulare de mesaje SWIFT MT103.',
    tags: ['Payment Gateway', 'FastAPI', 'SWIFT', 'ISO 20022', 'Luhn', 'Licenta', 'CT 312'],
    subsystem: 'banking'
  }
];

// ==========================================
// NETWORK SEGMENTATION & VLANS
// ==========================================
export const NETWORK_VLANS_DATA: NetworkVLAN[] = [
  {
    vlanId: 10,
    name: 'Management & Ingress',
    subnet: '192.168.10.0/24',
    gateway: '192.168.10.1 (OPNsense)',
    bridge: 'vmbr1',
    purpose: 'Hypervisor management, hardened administrative bastion hosts, and out-of-band telemetry.',
    purposeRo: 'Managementul hypervisorilor, bastioane administrative securizate și telemetrie securizată.',
    firewallRules: 'Strict ingress: SSH ed25519 & MFA only; no direct access from general LAN or internet.',
    isolated: true,
    color: '#f59e0b'
  },
  {
    vlanId: 20,
    name: 'Services & Banking Core',
    subnet: '192.168.20.0/24',
    gateway: '192.168.20.1 (OPNsense)',
    bridge: 'vmbr1',
    purpose: 'Production workloads, Apache Fineract core-banking, PostgreSQL financial ledger, and payment gateway.',
    purposeRo: 'Servicii de producție, nucleul bancar Apache Fineract, ledger financiar PostgreSQL și gateway de plăți.',
    firewallRules: 'Inter-VLAN traffic blocked except routed via OPNsense with stateful pf inspection.',
    isolated: true,
    color: '#0ea5e9'
  },
  {
    vlanId: 30,
    name: 'Cyber & DFIR Isolation Lab',
    subnet: '192.168.30.0/24',
    gateway: '192.168.30.1 (OPNsense)',
    bridge: 'vmbr2',
    purpose: 'Isolated offensive testing, dynamic malware detonation (Flare-VM), REMnux forensics, and Metasploitable.',
    purposeRo: 'Laborator izolat de analiză ofensivă, detonare malware dinamică și inginerie inversă.',
    firewallRules: 'Total default-deny egress: zero WAN outbound, DNS sinkholed to 0.0.0.0, strict air-gap.',
    isolated: true,
    color: '#dc2626'
  },
  {
    vlanId: 40,
    name: 'Active Directory Enterprise Domain',
    subnet: '192.168.40.0/24',
    gateway: '192.168.40.1 (OPNsense)',
    bridge: 'vmbr1',
    purpose: 'Windows Domain Controllers (PDC 2022, SDC 2016, CA 2012), member workstations, and Kerberos KDC.',
    purposeRo: 'Controllere de domeniu Windows, autorități de certificare PKI și stații înrolate în domeniu.',
    firewallRules: 'RPC, Kerberos (88), LDAP (389), SMB (445) strictly contained; Sysmon logged to Wazuh.',
    isolated: false,
    color: '#0284c7'
  },
  {
    vlanId: 50,
    name: 'DMZ / Public Edge',
    subnet: '192.168.50.0/24',
    gateway: '192.168.50.1 (OPNsense)',
    bridge: 'vmbr0',
    purpose: 'Reverse proxies, public SSL offloading, and external VPN ingress termination.',
    purposeRo: 'Reverse proxy, terminare certificate SSL și conexiuni de intrare securizate.',
    firewallRules: 'Only 80/443 and WireGuard 51820 allowed; strict isolation from internal VLANs 10, 20, 40.',
    isolated: false,
    color: '#10b981'
  }
];

// ==========================================
// BACHELOR'S THESIS: BANKING SECURITY LAB
// ==========================================
export const THESIS_COMPONENTS_DATA: ThesisComponent[] = [
  {
    id: 'thesis-fineract',
    vmidOrCtid: 310,
    type: 'VM',
    name: 'Apache Fineract Core-Banking',
    role: 'Central Transaction Engine & Ledger',
    roleRo: 'Motor Central de Tranzacții & Registru Contabil',
    ip: '192.168.20.50',
    vlan: 20,
    technology: 'Java 17, Apache Fineract / Mifos X, Spring Boot',
    securityControls: [
      'Double-entry chart of accounts verification',
      'Atomic balance commits under ACID semantics',
      'Role-based access control (Maker-Checker)',
      'Isolated inside VLAN 20 behind OPNsense'
    ],
    status: 'IMPLEMENTED',
    description: 'Centralized core banking system responsible for account balances, multi-currency ledgers, and transaction validation with strict double-entry integrity.',
    descriptionRo: 'Sistem central bancar responsabil pentru soldurile conturilor, registrele în valută multiplă și validarea tranzacțiilor în partidă dublă.'
  },
  {
    id: 'thesis-postgres',
    vmidOrCtid: 311,
    type: 'VM',
    name: 'Financial Ledger Database',
    role: 'Immutable Relational Data Store',
    roleRo: 'Bază de Date Relațională Imutabilă',
    ip: '192.168.20.51',
    vlan: 20,
    technology: 'PostgreSQL 16, pgAudit extension, Debian 12',
    securityControls: [
      'pgAudit extension capturing all DDL and DML operations',
      'Wazuh agent monitoring database file integrity (FIM)',
      'Row-level locking preventing concurrent double-spend',
      'Encrypted connections over TLS 1.3 only'
    ],
    status: 'IMPLEMENTED',
    description: 'Hardened PostgreSQL 16 database server storing ledger transactions, account audits, and balance histories under full tamper detection.',
    descriptionRo: 'Server securizat de baze de date PostgreSQL 16 ce stochează registrele de tranzacții și istoricul soldurilor cu detecție completă a modificărilor.'
  },
  {
    id: 'thesis-gateway',
    vmidOrCtid: 312,
    type: 'LXC',
    name: 'Payment Processing Gateway & SWIFT API',
    role: 'Card Authorization & Interbank Settlement Simulator',
    roleRo: 'Gateway de Autorizare Carduri & Simulator Decontare Interbancară',
    ip: '192.168.20.52',
    vlan: 20,
    technology: 'Python 3.12, FastAPI, Pydantic v2, Uvicorn',
    securityControls: [
      'Luhn algorithm client-side and server-side checksum validation',
      'Rate-limiting and card-stuffing velocity throttling',
      'ISO 20022 (pacs.008) and SWIFT MT103 message schema validation',
      'Input sanitization preventing SQLi / payload injection'
    ],
    status: 'IMPLEMENTED',
    description: 'FastAPI microservice executing payment card authorization checks, anti-fraud velocity limits, and simulating SWIFT MT103 and ISO 20022 message flows.',
    descriptionRo: 'Microserviciu FastAPI ce validează cardurile bancare (algoritmul Luhn), impune limite de viteză anti-fraudă și simulează mesageria SWIFT MT103 / ISO 20022.'
  },
  {
    id: 'thesis-bastion',
    vmidOrCtid: 313,
    type: 'VM',
    name: 'Hardened Bastion Jump-Box',
    role: 'Administrative Access Gateway',
    roleRo: 'Gateway Administrativ Securizat',
    ip: '192.168.10.50',
    vlan: 10,
    technology: 'Hardened Linux, OpenSSH 9, Google Authenticator PAM',
    securityControls: [
      'ed25519 elliptic-curve SSH key authentication only (passwords disabled)',
      'MFA TOTP required at every interactive login',
      'Session recording and audit trail via script/auditd',
      'Direct bastion-to-banking connection strictly controlled by OPNsense'
    ],
    status: 'IMPLEMENTED',
    description: 'Single fortified administrative bridge shielding financial database and core servers from infostealers, compromised workstations, and direct LAN traffic.',
    descriptionRo: 'Punct unic de acces administrativ ce protejează baza de date și serverul central bancar împotriva troienilor infostealer și a accesului neautorizat.'
  },
  {
    id: 'thesis-swift-sim',
    vmidOrCtid: 901,
    type: 'VM',
    name: 'SWIFT Alliance Lite2 Simulator',
    role: 'Interbank Network Demarcation',
    roleRo: 'Demarcație Rețea Interbancară',
    ip: '192.168.20.90',
    vlan: 20,
    technology: 'Mock SWIFT Network Daemon / MT103 & pacs.008 Parser',
    securityControls: [
      'Cryptographic message digest verification (HMAC-SHA256)',
      'BIC / IBAN formatting and bank routing validation',
      'Strict simulation of interbank correspondent settlement'
    ],
    status: 'SIMULATED',
    description: 'Simulated interbank messaging node accepting generated SWIFT MT103 telegraphic transfers and ISO 20022 pacs.008 messages for settlement verification.',
    descriptionRo: 'Nod simulat de mesagerie interbancară ce recepționează transferuri telegrafice SWIFT MT103 și mesaje ISO 20022 pacs.008 pentru decontare.'
  },
  {
    id: 'thesis-interchange-sim',
    vmidOrCtid: 902,
    type: 'LXC',
    name: 'Card Scheme Interchange Simulator',
    role: 'Visa/Mastercard Authorization Network',
    roleRo: 'Rețea de Autorizare Visa/Mastercard',
    ip: '192.168.20.95',
    vlan: 20,
    technology: 'ISO 8583 Financial Transaction Protocol Mock Engine',
    securityControls: [
      'Card BIN routing table simulation',
      'CVV2 / 3DSecure authentication challenge simulation',
      'Velocity limit enforcement and hot-list card rejection'
    ],
    status: 'SIMULATED',
    description: 'Card network simulator mocking acquiring and issuing bank authorization flows (ISO 8583) with simulated fraud challenge responses.',
    descriptionRo: 'Simulator de rețea bancară de carduri ce reproduce fluxurile ISO 8583 între banca acceptatoare și banca emitentă.'
  }
];

export const THESIS_DATA_FLOWS: ThesisDataFlowStep[] = [
  {
    stepNumber: 1,
    source: 'Merchant / POS Client',
    destination: 'Payment Gateway (CT 312)',
    protocol: 'HTTPS / TLS 1.3',
    action: 'Submits payment authorization payload with PAN, amount, currency, and CVV2.',
    actionRo: 'Trimite cererea de autorizare cu numărul cardului (PAN), suma, valuta și codul CVV2.',
    securityCheck: 'Luhn mod 10 check, velocity limiter (max 5 attempts/min), WAF sanitization.',
    securityCheckRo: 'Validare algoritm Luhn, limitare viteză (maxim 5 încercări/minut), filtrare WAF.'
  },
  {
    stepNumber: 2,
    source: 'Payment Gateway (CT 312)',
    destination: 'Core-Banking (VM 310)',
    protocol: 'Internal REST / Mutual TLS',
    action: 'Translates validated payment into double-entry accounting debit/credit requests.',
    actionRo: 'Traduce plata validată în cereri de debitare/creditare în partidă dublă.',
    securityCheck: 'VLAN 20 firewall policy enforced by OPNsense pf filter; Maker-Checker validation.',
    securityCheckRo: 'Politică firewall VLAN 20 verificată de OPNsense; validare Maker-Checker.'
  },
  {
    stepNumber: 3,
    source: 'Core-Banking (VM 310)',
    destination: 'Financial Database (VM 311)',
    protocol: 'PostgreSQL TCP 5432 / TLS',
    action: 'Executes atomic ACID transaction: DEBIT sender, CREDIT receiver, log ledger entry.',
    actionRo: 'Execută tranzacție atomică ACID: DEBITARE expeditor, CREDITARE destinatar, intrare ledger.',
    securityCheck: 'pgAudit logging of SQL statement, row-level locks prevent balance race conditions.',
    securityCheckRo: 'Jurnalizare pgAudit a instrucțiunii SQL; blocaje la nivel de rând anti-race condition.'
  },
  {
    stepNumber: 4,
    source: 'Financial Database (VM 311)',
    destination: 'Wazuh SIEM (CT 106)',
    protocol: 'Wazuh Agent / TCP 1514',
    action: 'Ships audit log events, FIM telemetry, and unauthorized balance change alerts.',
    actionRo: 'Transmite logurile de audit, telemetria FIM și alertele de modificare neautorizată de sold.',
    securityCheck: 'Rule matching against SQL injection patterns, balance anomalies, and privilege escalation.',
    securityCheckRo: 'Corelare reguli împotriva SQL injection, anomalii de sold și escaladare privilegii.'
  },
  {
    stepNumber: 5,
    source: 'Administrator Workstation',
    destination: 'Bastion Jump-Box (VM 313)',
    protocol: 'SSH / Port 22',
    action: 'Privileged operations must traverse the hardened jump-box; direct DB/Core SSH is blocked.',
    actionRo: 'Operațiunile privilegiate se fac exclusiv prin bastion; accesul SSH direct este blocat.',
    securityCheck: 'ed25519 public key verification + Google Authenticator TOTP token; session recorded.',
    securityCheckRo: 'Verificare cheie publică ed25519 + token TOTP Google Authenticator; sesiune înregistrată.'
  }
];

// ==========================================
// ACTIVE DIRECTORY SECURITY LAB
// ==========================================
export const AD_MEMBERS_DATA: ActiveDirectoryMember[] = [
  {
    vmid: 400,
    hostname: 'ad2022',
    role: 'Forest Root PDC (Primary Domain Controller)',
    roleRo: 'PDC Rădăcină Pădure (Domain Controller Principal)',
    os: 'Windows Server 2022 Datacenter',
    ip: '192.168.1.222',
    ramMb: 4096,
    status: 'ACTIVE_RUNTIME',
    detectionEngine: 'Wazuh Agent + Windows Security Event Log (Audit Pol)',
    auditPolicies: [
      'Account Logon: Success/Failure (Audit Kerberos Authentication Service)',
      'Account Management: User / Group creation and privilege modification',
      'Directory Service Access: Changes to sensitive OU objects and AdminSDHolder'
    ]
  },
  {
    vmid: 401,
    hostname: 'ad2016',
    role: 'Secondary Domain Controller (Replica DC & Global Catalog)',
    roleRo: 'Domain Controller Secundar (Replică & Catalog Global)',
    os: 'Windows Server 2016 Standard',
    ip: '192.168.1.223',
    ramMb: 3072,
    status: 'ACTIVE_RUNTIME',
    detectionEngine: 'Wazuh Agent + DRS Replication Monitor',
    auditPolicies: [
      'Directory Service Replication: Inbound/Outbound AD DS replication sync',
      'Logon Events: Global Catalog lookup and inter-DC authentication'
    ]
  },
  {
    vmid: 402,
    hostname: 'ad2012',
    role: 'Child DC & Enterprise Root Certificate Authority (AD CS)',
    roleRo: 'DC Copil & Autoritate de Certificare Enterprise (AD CS)',
    os: 'Windows Server 2012 R2 Standard',
    ip: '192.168.1.224',
    ramMb: 1024,
    status: 'ACTIVE_RUNTIME',
    detectionEngine: 'Wazuh Agent + AD CS Audit Logging',
    auditPolicies: [
      'Certificate Services: Certificate issuance, revocation, and template modifications (ESC1–ESC8 detection)',
      'Legacy Trust: SMBv1 fallback detection'
    ]
  },
  {
    vmid: 403,
    hostname: 'adwin10',
    role: 'Domain Workstation (Modern Enterprise Client)',
    roleRo: 'Stație de Lucru în Domeniu (Client Modern Enterprise)',
    os: 'Windows 10 Enterprise (x64)',
    ip: '192.168.1.226',
    ramMb: 2560,
    status: 'ACTIVE_RUNTIME',
    detectionEngine: 'Sysmon (SwiftOnSecurity config) + Wazuh Agent',
    auditPolicies: [
      'Sysmon Event ID 1: Process Creation with full command line and parent process',
      'Sysmon Event ID 3: Network connections (detecting C2 beaconing and lateral movement)',
      'Sysmon Event ID 7: Image / DLL loads for injection detection'
    ]
  },
  {
    vmid: 404,
    hostname: 'adwin7',
    role: 'Legacy Client Workstation (SMBv1 & NTLM Drill Target)',
    roleRo: 'Stație Client Legacy (Țintă pentru Teste SMBv1 & NTLM)',
    os: 'Windows 7 SP1 Enterprise (x64)',
    ip: '192.168.1.227',
    ramMb: 2048,
    status: 'ACTIVE_RUNTIME',
    detectionEngine: 'Windows Event Log + Suricata NTLM Inspection',
    auditPolicies: [
      'Logon Events: NTLMv1 vs NTLMv2 authentication negotiation auditing',
      'Network Shares: SMBv1 protocol activation and exploit monitoring'
    ]
  },
  {
    vmid: 405,
    hostname: 'adrhel',
    role: 'SSSD Linux Domain Realm Member',
    roleRo: 'Membru Linux de Domeniu via SSSD',
    os: 'Red Hat Enterprise Linux 9.4',
    ip: '192.168.1.228',
    ramMb: 1536,
    status: 'ACTIVE_RUNTIME',
    detectionEngine: 'Auditd + SSSD Debug Logs + Wazuh Agent',
    auditPolicies: [
      'PAM Authentication: Kerberos ticket granting and verification',
      'Auditd: Sudo execution and domain user privilege escalation attempts'
    ]
  },
  {
    vmid: 406,
    hostname: 'adwin11',
    role: 'Windows 11 Modern Workstation (Declarative Blueprint)',
    roleRo: 'Stație de Lucru Windows 11 (Blueprint Declarativ)',
    os: 'Windows 11 Enterprise (x64)',
    ip: '192.168.1.229',
    ramMb: 4096,
    status: 'DECLARATIVE_BLUEPRINT',
    detectionEngine: 'Sysmon + Wazuh Agent (Declared in terraform/ad_lab.tf)',
    auditPolicies: ['Credential Guard monitoring', 'AppLocker enforcement']
  },
  {
    vmid: 407,
    hostname: 'adkali',
    role: 'Offensive Security Red Team Assessor',
    roleRo: 'Stație Ofensivă Red Team',
    os: 'Kali Linux Rolling',
    ip: '192.168.1.230',
    ramMb: 2048,
    status: 'DECLARATIVE_BLUEPRINT',
    detectionEngine: 'Network telemetry & Suricata EVE logs',
    auditPolicies: ['BloodHound collection tracking', 'Impacket tool detection']
  }
];

// ==========================================
// CYBERSECURITY CASES (CYBER/ INVESTIGATIONS)
// ==========================================
export const CYBER_CASES_DATA: CyberInvestigation[] = [
  {
    caseId: 'SEC-2026-ECOM-005',
    title: 'Media Galaxy Brand Impersonation & Chinese SaaS Fraud Campaign',
    titleRo: 'Clonare Frauduloasă a Brandului Media Galaxy prin SaaS Chinezesc',
    category: 'E-Commerce Brand Impersonation & Phishing',
    date: '2026-09-21',
    status: 'REPORTED & REMEDIATED',
    author: 'Ștefan-Ionuț Dumitru',
    summary: 'Deconstruction of an aggressive social media phishing campaign cloning Media Galaxy Romania. Criminals lured victims using a fake espresso machine sale ("la 49 lei"), routing them through disposable domains hosted on Chinese multi-tenant SaaS infrastructure to harvest full credit card details.',
    summaryRo: 'Deconstrucția unei campanii de phishing pe rețelele sociale ce clona brandul Media Galaxy. Victimele erau atrase cu reclame false la espressoare de cafea („la 49 lei”), redirecționate prin domenii de unică folosință pe o platformă SaaS chinezească pentru furt de date de card.',
    attackVector: 'Sponsored Facebook advertisements -> Geo-targeted redirectors -> Disposable cloned stores -> Card data exfiltration.',
    attackVectorRo: 'Reclame sponsorizate pe Facebook -> Redirecționări geo-targetate -> Magazine clonate -> Exfiltrare date de card.',
    threatActorTTPs: [
      'Domain squatting & lookalike registration on day of ad launch',
      'Disposable domains (e.g. voetbalshop-nlco[.]com)',
      'Chinese SaaS multi-tenant fraud scaffolding',
      'Direct card data exfiltration over encrypted C2 channels'
    ],
    keyIoCs: [
      { type: 'DOMAIN', value: 'voetbalshop-nlco[.]com' },
      { type: 'DOMAIN', value: 'mediagalaxy-promo[.]online' },
      { type: 'IP', value: '104.21.65.182' },
      { type: 'ASN', value: 'AS13335 (Cloudflare transit)' },
      { type: 'TICKET', value: 'DNSC PNRISC #178465' }
    ],
    disposition: 'Formal incident reported via DNSC PNRISC (#178465). The primary fraudulent domain was confirmed neutralized and taken down by Romanian authorities.',
    dispositionRo: 'Incident raportat oficial către DNSC prin formularul PNRISC (#178465). Domeniul fraudulos a fost confirmat ca nefuncțional și neutralizat.',
    evidenceDir: 'cyber/mediagalaxy',
    mitreTechniques: ['T1566.002 - Spearphishing Link', 'T1583.001 - Domains', 'T1056.001 - Keylogging / Web Form Snatching']
  },
  {
    caseId: 'SEC-2026-VISH-002',
    title: 'Revolut FinTech Vishing & Real-Time Credential Relay',
    titleRo: 'Inginerie Socială Vishing Revolut & Preluare de Cont în Timp Real',
    category: 'FinTech Impersonation & Vishing',
    date: '2026-02-14',
    status: 'ANALYZED & DOCUMENTED',
    author: 'Ștefan-Ionuț Dumitru',
    summary: 'Investigation of a voice phishing (vishing) campaign impersonating Revolut Anti-Fraud officers. Threat actors leveraged SIP caller-ID spoofing and live social engineering to induce victims into approving device changes and out-of-band push authorizations.',
    summaryRo: 'Investigarea unei campanii de vishing în care atacatorii s-au dat drept ofițeri antifraudă Revolut, folosind falsificarea numărului de apelant (SIP spoofing) pentru a determina victimele să autorizeze schimbări de dispozitiv.',
    attackVector: 'VoIP SIP Caller-ID spoofing -> Social engineering call -> Parallel credential relay -> Push authorization capture.',
    attackVectorRo: 'Spoofing identificator apelant VoIP SIP -> Apel de inginerie socială -> Releu de credențiale în timp real -> Captură notificare push.',
    threatActorTTPs: [
      'VoIP SIP trunk caller-ID spoofing (+40 37x / banking numbers)',
      'Psychological urgency claiming imminent unauthorized transfers',
      'Real-time session hijacking during the active voice call'
    ],
    keyIoCs: [
      { type: 'PHONE', value: '+40 371 500 000 (Spoofed Bank Caller ID)' },
      { type: 'SIP_GATEWAY', value: '185.107.56.24' },
      { type: 'METHOD', value: 'Vishing / Out-of-Band Auth Bypass' }
    ],
    disposition: 'Forensic dossier compiled with call recordings, SIP header captures, and user awareness guidance for Romanian banking customers.',
    dispositionRo: 'Dossier criminalistic completat cu capturi de antete SIP, înregistrări de apel și ghid de conștientizare pentru utilizatori.',
    evidenceDir: 'cyber/revolut',
    mitreTechniques: ['T1566.003 - Spearphishing Voice', 'T1556 - Modify Authentication Process', 'T1539 - Steal Web Session Cookie']
  },
  {
    caseId: 'SEC-2026-TASK-003',
    title: '"Hotel Reviewer" Task Scam & Ponzi Smart Contract Deconstruction',
    titleRo: 'Analiză Criminalistică a Platformelor Frauduloase Task Scam (Hotel Reviewer)',
    category: 'Cryptocurrency Fraud & Task Scams',
    date: '2026-01-20',
    status: 'DECONSTRUCTED & DOCUMENTED',
    author: 'Ștefan-Ionuț Dumitru',
    summary: 'Technical deconstruction of an international task scam network pretending to pay users for submitting hotel/app ratings. The web application was reverse engineered, exposing fake WebSocket balance ticks, rigged withdrawal logic, and USDT TRC-20 cash-out addresses.',
    summaryRo: 'Deconstrucție tehnică a unei rețele de tip task scam ce pretindea remunerarea utilizatorilor pentru evaluări de hoteluri. Aplicația web a fost dezasamblată, evidențiind solduri false pe WebSocket și adrese USDT TRC-20.',
    attackVector: 'Telegram / WhatsApp recruitment -> Web application task completion -> Fabricated withdrawal requirement -> Crypto drain.',
    attackVectorRo: 'Recrutare pe Telegram / WhatsApp -> Completare de sarcini pe platformă web -> Solicitare de depozit pentru retragere -> Furt cripto.',
    threatActorTTPs: [
      'Synthetic task gamification with escalating capital lock-in',
      'WebSockets broadcasting fake peer withdrawals to build trust',
      'TRON (TRC-20) wallet rotation for illicit fund layering'
    ],
    keyIoCs: [
      { type: 'DOMAIN', value: 'booking-review-vip[.]com' },
      { type: 'TRC20_WALLET', value: 'TYDzsxdCz9kLqTNsUB27UkPxG7x1D4kLpm' },
      { type: 'IP', value: '172.67.142.90' }
    ],
    disposition: 'Complete API mapping, payload decoding, and threat intelligence distribution for defensive blocking.',
    dispositionRo: 'Mapare completă a API-urilor frauduloase, decodare payload-uri și partajare de indicatori de compromitere (IoC).',
    evidenceDir: 'cyber/taskscam',
    mitreTechniques: ['T1584.004 - Serverless / Web App Fraud', 'T1659 - Content Spoofing']
  },
  {
    caseId: 'SEC-2025-MRR-001',
    title: 'TikTok Affiliate Ponzi & MRR Funnel Network Analysis',
    titleRo: 'Investigarea Rețelelor de Tip Schemă Piramidală / MRR pe TikTok',
    category: 'Social Media Fraud & Affiliate Scams',
    date: '2025-11-10',
    status: 'ANALYZED & CATALOGED',
    author: 'Ștefan-Ionuț Dumitru',
    summary: 'Investigation into Master Resell Rights (MRR) pyramid operations propagated across TikTok algorithms. Scraped automated video funnels, analyzed bot farms generating synthetic engagement, and traced multi-tier payment processing links.',
    summaryRo: 'Analiză a rețelelor piramidale de tip Master Resell Rights (MRR) propagate prin algoritmii TikTok. Au fost analizate fermele de boți pentru engagement sintetic și legăturile de procesare plăți.',
    attackVector: 'Algorithmic social manipulation -> Synthetic engagement botnets -> Sales funnel redirects -> Multi-tier digital product pyramid.',
    attackVectorRo: 'Manipulare algoritmică pe rețele sociale -> Boți de engagement sintetic -> Redirecționări către pâlnii de vânzări -> Schemă piramidală.',
    threatActorTTPs: [
      'Automated video generation with synthetic AI voices and luxury imagery',
      'Comment section bot swarms providing false social proof',
      'Stripe/LemonSqueezy checkout exploitation'
    ],
    keyIoCs: [
      { type: 'FUNNEL_URL', value: 'passive-income-mastery[.]co' },
      { type: 'BOT_NET_ID', value: 'BOTNET-TIK-ROM-04' }
    ],
    disposition: 'Extensive technical report on algorithm exploitation and behavioral patterns of pyramid scheme syndicates.',
    dispositionRo: 'Raport tehnic detaliat despre exploatarea algoritmilor și comportamentul rețelelor de tip schemă piramidală.',
    evidenceDir: 'cyber/mrr',
    mitreTechniques: ['T1585.002 - Social Media Accounts', 'T1584 - Compromise Infrastructure']
  },
  {
    caseId: 'SEC-2025-AITM-004',
    title: 'Steam OpenID Browser-in-the-Middle (BitM) Reverse-Proxy Phishing',
    titleRo: 'Atac Phishing Avansat BitM / Reverse-Proxy pe Sistemul Steam OpenID',
    category: 'Adversary-in-the-Middle (AiTM) Phishing',
    date: '2025-08-15',
    status: 'REVERSED & REPORTED',
    author: 'Ștefan-Ionuț Dumitru',
    summary: 'Reverse engineering of an advanced Browser-in-the-Middle (BitM) phishing framework targeting Steam gaming inventories. The kit created a simulated browser popup in DOM to intercept Steam Guard 2FA codes and session cookies in real time.',
    summaryRo: 'Inginerie inversă a unui framework avansat de phishing Browser-in-the-Middle (BitM) ce viza inventarele Steam. Trusa genera o fereastră falsă de browser în DOM pentru interceptarea în timp real a codurilor Steam Guard și cookie-urilor de sesiune.',
    attackVector: 'Esports tournament lure -> Fake Steam login modal (HTML/CSS simulated browser window) -> WebSocket reverse proxy -> Real-time Steam Guard bypass.',
    attackVectorRo: 'Momeală legată de turnee esports -> Fereastră falsă de autentificare Steam -> Reverse proxy prin WebSocket -> Ocolire Steam Guard în timp real.',
    threatActorTTPs: [
      'DOM-simulated Chromium window with draggable header and fake address bar',
      'Real-time WebSocket streaming of 2FA Steam Guard requests to victim',
      'Instant session cookie exfiltration and inventory transfer automation'
    ],
    keyIoCs: [
      { type: 'DOMAIN', value: 'steamcommunity-login-auth[.]link' },
      { type: 'SCRIPT_HASH', value: 'SHA256: 4a2b8e89f92...c89e' },
      { type: 'WEBSOCKET_C2', value: 'wss://auth-gateway[.]net/relay' }
    ],
    disposition: 'Detection signatures published for Suricata and Wazuh HIDS; upstream C2 domains submitted to threat intel feeds.',
    dispositionRo: 'Semnături de detecție publicate pentru Suricata și Wazuh HIDS; domenii C2 raportate către feed-urile globale de securitate.',
    evidenceDir: 'cyber/steam',
    mitreTechniques: ['T1557 - Adversary-in-the-Middle', 'T1185 - Browser Session Hijacking', 'T1110.001 - Password Guessing / 2FA Capture']
  }
];

// ==========================================
// CI/CD PIPELINE SECURITY GATES
// ==========================================
export const CI_CD_GATES_DATA: CiCdGate[] = [
  {
    id: 'gate-gitleaks',
    name: 'Gitleaks Secret Scan',
    stage: 'security',
    tool: 'Gitleaks v8',
    scope: 'Full repository git history commit inspection',
    blocking: true,
    description: 'Detects hardcoded API keys, private SSH keys, and cleartext credentials in all commits and branches.',
    command: 'gitleaks detect --verbose --redact'
  },
  {
    id: 'gate-trufflehog',
    name: 'TruffleHog Deep Entropy Scanner',
    stage: 'security',
    tool: 'TruffleHog v3',
    scope: 'High-entropy secret detection with live verification',
    blocking: true,
    description: 'Identifies high-entropy secrets and actively verifies if credentials have live API validity.',
    command: 'trufflehog git file://. --only-verified'
  },
  {
    id: 'gate-checkov',
    name: 'Checkov IaC Security Policy',
    stage: 'security',
    tool: 'Bridgecrew Checkov',
    scope: 'Terraform, Dockerfiles, and Kubernetes manifests',
    blocking: true,
    description: 'Scans infrastructure-as-code files against CIS benchmarks, unencrypted storage, and permissive security groups.',
    command: 'checkov -d . --framework terraform,kubernetes,dockerfile'
  },
  {
    id: 'gate-trivy',
    name: 'Trivy Vulnerability & SBOM Scanner',
    stage: 'security',
    tool: 'Aqua Security Trivy',
    scope: 'Filesystem dependencies, lockfiles, and container images',
    blocking: true,
    description: 'Identifies CVEs in Node.js, Python, and base container image dependencies.',
    command: 'trivy fs --severity CRITICAL,HIGH .'
  },
  {
    id: 'gate-shellcheck',
    name: 'ShellCheck POSIX Static Analysis',
    stage: 'lint',
    tool: 'ShellCheck',
    scope: 'All repository bash and POSIX shell scripts in scripts/',
    blocking: true,
    description: 'Ensures shell scripts avoid unsafe variable expansions, quote omissions, and non-portable subshells.',
    command: 'shellcheck scripts/*.sh'
  },
  {
    id: 'gate-custom-hygiene',
    name: 'Suricata Syntax & IoC Defanging Validator',
    stage: 'validation',
    tool: 'Custom Python Quality Test Suite',
    scope: 'cyber/ investigations, rules, and scripts',
    blocking: true,
    description: 'Validates Suricata rules syntax, asserts that all published malicious URLs/IPs are safely defanged, and verifies PDF generation.',
    command: 'python3 scripts/verify_suricata_rules.py && python3 scripts/verify_ioc_hygiene.py'
  }
];

// ==========================================
// DYNAMIC METRIC AGGREGATES
// ==========================================
export const INFRASTRUCTURE_METRICS = {
  physicalNodesCount: PHYSICAL_NODES_DATA.length,
  virtualMachinesCount: VIRTUAL_MACHINES_DATA.length,
  lxcContainersCount: LXC_CONTAINERS_DATA.length,
  activeServicesCount: 26, // Exactly 26 services in services.data.ts
  networkVlansCount: NETWORK_VLANS_DATA.length,
  thesisComponentsCount: THESIS_COMPONENTS_DATA.length,
  adMembersCount: AD_MEMBERS_DATA.length,
  cyberCasesCount: CYBER_CASES_DATA.length,
  ciGatesCount: CI_CD_GATES_DATA.length,
  totalRamCapacityFormatted: '18.4 GB Physical (+6.0 GB ZRAM)',
  totalStorageCapacityFormatted: '1.09 TB Bare-Metal Storage'
};
