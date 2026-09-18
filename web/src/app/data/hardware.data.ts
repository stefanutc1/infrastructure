export interface HardwareNode {
  id: string;
  name: string;
  machine: string;
  machineRo?: string;
  role: string;
  roleRo?: string;
  cpu: string;
  gpu?: string;
  ram: string;
  zram?: string;
  storage: string;
  psu?: string;
  os: string;
  ip: string;
  status: 'OPERATIONAL' | 'STANDBY';
  tags: string[];
  tagsRo?: string[];
  workloads: string[];
  ballooningTable?: {
    vmid: number;
    name: string;
    os: string;
    allocatedMb: number;
    balloonMinMb: number;
    purpose: string;
    purposeRo?: string;
  }[];
}

export const HARDWARE_NODES: HardwareNode[] = [
  {
    id: 'node1-pve',
    name: 'Proxmox Primary (pve)',
    machine: 'Custom Desktop Compute Chassis',
    machineRo: 'Șasiu Desktop Compute Custom',
    role: 'Primary x86_64 virtualization hypervisor running the perimeter OPNsense firewall, production LXCs (100–106), security VMs (300, 301, 303, 304), and the multi-tier Active Directory lab (VMs 400–405).',
    roleRo: 'Hypervisor primar de virtualizare x86_64 ce rulează firewall-ul perimetral OPNsense, containerele LXC de producție (100–106), VM-urile de securitate (300, 301, 303, 304) și laboratorul Active Directory (VM-uri 400–405).',
    cpu: 'Intel Core i3-10100F (4 Cores / 8 Threads @ 4.30 GHz Turbo)',
    gpu: 'NVIDIA GeForce GTX 1050 Ti (4GB VRAM · PCIe Passthrough to Ollama CT 102)',
    ram: '12,288 MB DDR4 (12 GB DDR4-2133)',
    zram: '6.0 GB /dev/zram0 (lz4 compression, swappiness 60, priority 100 · Protects NVMe disk endurance)',
    storage: '512 GB SSD (Local LVM Thin Pool · 310 GB Available)',
    psu: 'Coldex 350W Pure Sine Wave Power Supply',
    os: 'Proxmox VE 9.2 (Linux 7.0 pve kernel · zram-tools enabled)',
    ip: '192.168.1.132 (OPNsense: 192.168.1.134:8443)',
    status: 'OPERATIONAL',
    tags: ['Primary Hypervisor', 'x86_64 Bare-Metal', 'ZRAM lz4 (6.0GB)', 'PCIe GPU Passthrough', 'VirtIO Ballooning', 'LXC Fleet', 'Active Directory Lab'],
    tagsRo: ['Hypervisor Primar', 'x86_64 Bare-Metal', 'ZRAM lz4 (6.0GB)', 'GPU PCIe Passthrough', 'Balonare VirtIO', 'Flotă LXC', 'Laborator Active Directory'],
    ballooningTable: [
      { 
        vmid: 200, 
        name: 'opnsense', 
        os: 'Hardened FreeBSD 14', 
        allocatedMb: 1024, 
        balloonMinMb: 512, 
        purpose: 'Core Perimeter Firewall, Suricata IDS/IPS & WireGuard Gateway',
        purposeRo: 'Firewall Central Perimetral, IDS/IPS Suricata & Gateway WireGuard'
      },
      { 
        vmid: 201, 
        name: 'openstack', 
        os: 'Linux (Kolla-Ansible Dev)', 
        allocatedMb: 4096, 
        balloonMinMb: 2048, 
        purpose: 'Single-node OpenStack Cloud Controller and SDN Lab',
        purposeRo: 'Controller OpenStack Cloud single-node și laborator SDN'
      },
      { 
        vmid: 300, 
        name: 'parrot', 
        os: 'Parrot Security OS', 
        allocatedMb: 1536, 
        balloonMinMb: 1024, 
        purpose: 'Dedicated Security Analysis & Red Team Workstation',
        purposeRo: 'Stație de Lucru Dedicată pentru Analiză de Securitate și Red Team'
      },
      { 
        vmid: 301, 
        name: 'metasploitable2', 
        os: 'Linux 2.6 (Vulnerable Target)', 
        allocatedMb: 512, 
        balloonMinMb: 256, 
        purpose: 'Intentionally Vulnerable Target for Offensive Security Drills',
        purposeRo: 'Țintă vulnerabilă deliberat pentru simulări de securitate ofensivă'
      },
      { 
        vmid: 303, 
        name: 'malware', 
        os: 'Windows 10 (Flare-VM)', 
        allocatedMb: 2560, 
        balloonMinMb: 1536, 
        purpose: 'Dynamic Malware Analysis & Detonation Sandbox',
        purposeRo: 'Sandbox izolat pentru analiză dinamică de malware și detonare'
      },
      { 
        vmid: 304, 
        name: 'remnux', 
        os: 'REMnux Linux', 
        allocatedMb: 4096, 
        balloonMinMb: 2048, 
        purpose: 'Reverse Engineering and Malware Triage Toolkit',
        purposeRo: 'Distribuție pentru inginerie inversă și triaj malware'
      },
      { 
        vmid: 400, 
        name: 'ad2022', 
        os: 'Windows Server 2022', 
        allocatedMb: 4096, 
        balloonMinMb: 2048, 
        purpose: 'Active Directory Forest Root PDC, FSMO, Authoritative DNS',
        purposeRo: 'PDC rădăcină pădure Active Directory, FSMO, DNS autoritar'
      },
      { 
        vmid: 401, 
        name: 'ad2016', 
        os: 'Windows Server 2016', 
        allocatedMb: 3072, 
        balloonMinMb: 1536, 
        purpose: 'Active Directory SDC, Multi-Master Replication, Global Catalog',
        purposeRo: 'SDC Active Directory, replicare multi-master, Global Catalog'
      },
      { 
        vmid: 402, 
        name: 'ad2012', 
        os: 'Windows Server 2012 R2', 
        allocatedMb: 1024, 
        balloonMinMb: 512, 
        purpose: 'Child Domain Controller & Enterprise Root CA (AD CS)',
        purposeRo: 'Domain Controller copil și autoritate de certificare Enterprise (AD CS)'
      },
      { 
        vmid: 403, 
        name: 'adwin10', 
        os: 'Windows 10 Enterprise', 
        allocatedMb: 2560, 
        balloonMinMb: 1024, 
        purpose: 'Domain Workstation, Group Policy Target, Sysmon Telemetry',
        purposeRo: 'Stație de lucru înrolată în domeniu, țintă GPO, telemetrie Sysmon'
      },
      { 
        vmid: 404, 
        name: 'adwin7', 
        os: 'Windows 7 SP1', 
        allocatedMb: 2048, 
        balloonMinMb: 1024, 
        purpose: 'Legacy Domain Client for SMBv1 & NTLM Testing',
        purposeRo: 'Client legacy în domeniu pentru teste SMBv1 și protocoale NTLM'
      },
      { 
        vmid: 405, 
        name: 'adrhel', 
        os: 'Red Hat Enterprise Linux 9', 
        allocatedMb: 1536, 
        balloonMinMb: 1024, 
        purpose: 'Enterprise Linux AD Realm Member via SSSD & Kerberos',
        purposeRo: 'Client Linux Enterprise integrat în AD via SSSD și Kerberos'
      }
    ],
    workloads: [
      'VM 200: OPNsense Core Firewall (1024 MB · Suricata IDS/IPS, WireGuard, Unbound DNS)',
      'VM 201: OpenStack Dev Sandbox (4096 MB · Kolla-Ansible Cloud Controller)',
      'VM 300: Parrot Security OS (1536 MB · Dedicated Offensive Security & Threat Analysis Workstation)',
      'VM 301: Metasploitable 2 Target (512 MB · Vulnerable Exploit Target)',
      'VM 303: Windows Malware Sandbox (2560 MB · Flare-VM Dynamic Analysis Sandbox)',
      'VM 304: REMnux Forensic Toolkit (4096 MB · Reverse Engineering & Static Analysis)',
      'VM 400: Active Directory PDC ad2022 (4096 MB · Windows Server 2022 FSMO & DNS)',
      'VM 401: Active Directory SDC ad2016 (3072 MB · Windows Server 2016 Replica & GC)',
      'VM 402: Active Directory Child DC & CA ad2012 (1024 MB · Windows Server 2012 R2 & AD CS)',
      'VM 403: Domain Workstation adwin10 (2560 MB · Windows 10 Enterprise GPO & Sysmon)',
      'VM 404: Legacy Client adwin7 (2048 MB · Windows 7 SP1 SMBv1/NTLM Drill Target)',
      'VM 405: Linux Realm Member adrhel (1536 MB · RHEL 9 SSSD & Kerberos Auth)',
      'CT 100: Home Assistant Hub (128 MB · Smart Home, Zigbee & IoT Telemetry Gateway)',
      'CT 101: Scrutiny S.M.A.R.T. Monitor (96 MB · Storage Health & Drive Telemetry)',
      'CT 102: Ollama GPU LLM Runtime (2048 MB · PCIe Passthrough NVIDIA GTX 1050 Ti)',
      'CT 103: Uptime Kuma Health Monitor (128 MB · High-Frequency Endpoint Status)',
      'CT 104: Monitoring Stack (256 MB · Prometheus TSDB & Grafana Dashboards)',
      'CT 105: OWASP Pentest Target Lab (512 MB · Juice Shop Web Security Environment)',
      'CT 106: Wazuh SIEM / XDR Manager (6144 MB · OpenSearch 4GB Heap, Manager, Dashboard)'
    ]
  },
  {
    id: 'node2-omv',
    name: 'OpenMediaVault NAS (openmediavault)',
    machine: 'ASUS X451MA Laptop Chassis',
    machineRo: 'Șasiu Laptop ASUS X451MA',
    role: 'Provides centralized network-attached storage using resilient ZFS pools. It hosts high-capacity SMB and NFS file shares and stores daily hypervisor snapshot backups.',
    roleRo: 'Furnizează stocare centralizată atașată în rețea (NAS) folosind pool-uri redundante ZFS. Găzduiește partajări SMB și NFS de mare capacitate și stochează backup-urile zilnice ale hypervisorilor.',
    cpu: 'Intel Celeron N2830 (2 Cores / 2 Threads @ 2.16 GHz, 2.41 GHz Burst)',
    gpu: 'Intel HD Graphics (Bay Trail Integrated)',
    ram: '2,048 MB DDR3 Low-Voltage',
    storage: '500 GB HDD (SATA II Mechanical Pool)',
    os: 'OpenMediaVault (OMV) / Debian Linux 12',
    ip: '192.168.1.135',
    status: 'OPERATIONAL',
    tags: ['ZFS Storage Pool', 'Centralized NAS', 'NFS / SMB Shares', 'Proxmox VZDump Target'],
    tagsRo: ['Pool Stocare ZFS', 'NAS Centralizat', 'Partajări NFS / SMB', 'Țintă Backup VZDump'],
    workloads: [
      'OpenMediaVault Core Storage Engine (ZFS / ext4)',
      'NFS & SMB Centralized Storage Shares',
      'Proxmox VE Daily Backup Repository (VZDump)'
    ]
  },
  {
    id: 'kubernetes-node',
    name: 'Kubernetes Worker (kubernetes)',
    machine: 'Custom ATX Compute Chassis',
    machineRo: 'Șasiu ATX Compute Custom',
    role: 'Operates as a dedicated bare-metal Kubernetes worker node for batch jobs and container execution, running kernel-level telemetry agents.',
    roleRo: 'Funcționează ca un nod worker Kubernetes bare-metal dedicat pentru sarcini batch și execuție de containere, rulând agenți de telemetrie la nivel de kernel.',
    cpu: 'AMD Athlon II X2 220 (2 Cores / 2 Threads @ 2.80 GHz Regor / AM3)',
    gpu: 'NVIDIA GeForce GTS 250 (1GB GDDR3 / 256-bit Bus)',
    ram: '4,096 MB DDR3',
    storage: '80 GB HDD (SATA II / 7200 RPM local cache; persistență pe NFS)',
    psu: 'Standard ATX Power Supply Unit',
    os: 'Alpine Linux with containerd CRI & k3s-agent',
    ip: '192.168.1.18',
    status: 'OPERATIONAL',
    tags: ['Kubernetes Fleet', 'k3s-agent', 'Containerd', 'Alpine Linux', 'Bare-Metal Worker'],
    tagsRo: ['Flotă Kubernetes', 'k3s-agent', 'Containerd', 'Alpine Linux', 'Nod Worker Bare-Metal'],
    workloads: [
      'k3s Lightweight Kubernetes Worker Agent',
      'Stateless Compute & Microservice Container Offloading',
      'Kernel eBPF Telemetry & Cluster Resilience Probing'
    ]
  }
];
