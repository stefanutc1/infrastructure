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
    role: 'Serves as the primary x86_64 virtualization hypervisor for the entire homelab. It runs the perimeter OPNsense firewall, core enterprise virtual machines with active VirtIO ballooning, and dedicated GPU-accelerated local AI inference workloads.',
    roleRo: 'Servește drept hypervisor primar de virtualizare x86_64 pentru întregul homelab. Rulează firewall-ul perimetral OPNsense, mașinile virtuale enterprise cu balonare activă VirtIO și sarcinile de inferență AI locală accelerate pe GPU.',
    cpu: 'Intel Core i3-10100F (4 Cores / 8 Threads @ 4.30 GHz Turbo)',
    gpu: 'NVIDIA GeForce GTX 1050 Ti (4GB VRAM · PCIe Passthrough to Ollama / ML Workbench & Faster-Whisper)',
    ram: '12,288 MB DDR4 (12 GB DDR4-2133)',
    zram: '6.0 GB /dev/zram0 (lz4 compression, swappiness 60, priority 100 · Protects NVMe disk endurance)',
    storage: '512 GB SSD (Local LVM Thin Pool · 310 GB Available)',
    psu: 'Coldex 350W Pure Sine Wave Power Supply',
    os: 'Proxmox VE 9.2 (Linux 7.0 pve kernel · zram-tools enabled)',
    ip: '192.168.1.132 (OPNsense: 192.168.1.134:8443)',
    status: 'OPERATIONAL',
    tags: ['Primary Hypervisor', 'x86_64 Bare-Metal', 'ZRAM lz4 (6.0GB)', 'PCIe GPU Passthrough', 'VirtIO Ballooning', 'Enterprise VMs'],
    tagsRo: ['Hypervisor Primar', 'x86_64 Bare-Metal', 'ZRAM lz4 (6.0GB)', 'GPU PCIe Passthrough', 'Balonare VirtIO', 'VM-uri Enterprise'],
    ballooningTable: [
      { 
        vmid: 200, 
        name: 'opnsense', 
        os: 'Hardened FreeBSD 14', 
        allocatedMb: 4096, 
        balloonMinMb: 2048, 
        purpose: 'Core Perimeter Firewall & Suricata IDS/IPS',
        purposeRo: 'Firewall Central Perimetral & IDS/IPS Suricata'
      },
      { 
        vmid: 201, 
        name: 'openstack', 
        os: 'Ubuntu 24.04 LTS / Kolla OpenStack 2024.1', 
        allocatedMb: 4096, 
        balloonMinMb: 2048, 
        purpose: 'OpenStack Enterprise Private Cloud Controller (Nova, Neutron, Keystone, Glance, Horizon Dashboard)',
        purposeRo: 'Controller Cloud Privat OpenStack Enterprise (Calcul Nova, Rețele Neutron, Keystone IAM, Panou Horizon)'
      },
      { 
        vmid: 202, 
        name: 'metasploitable2', 
        os: 'Metasploitable 2 (Ubuntu 8.04)', 
        allocatedMb: 512, 
        balloonMinMb: 512, 
        purpose: 'Intentionally Vulnerable Linux Target, Penetration Testing & Suricata/Wazuh IDS Tuning',
        purposeRo: 'Țintă Linux Vulnerabilă Intenționat, Teste de Penetrare & Calibrare IDS/IPS Suricata/Wazuh'
      },
      { 
        vmid: 203, 
        name: 'tpot-honeypot', 
        os: 'Debian 12 / T-Pot 24.04 Multi-Honeypot Decoy Platform', 
        allocatedMb: 8192, 
        balloonMinMb: 4096, 
        purpose: 'Telekom Security Multi-Honeypot Decoy Platform (Cowrie, Dionaea, Elastic, Kibana, Suricata)',
        purposeRo: 'Platformă Multi-Honeypot Decoy Telekom Security (Cowrie, Dionaea, Elastic, Kibana, Suricata)'
      },
      { 
        vmid: 204, 
        name: 'securityonion', 
        os: 'Security Onion 3.2 / Wazuh SIEM Platform', 
        allocatedMb: 8192, 
        balloonMinMb: 4096, 
        purpose: 'Enterprise SIEM, HIDS, Log Analysis, Network Security Monitoring (Zeek, Suricata, Elastic, Kibana)',
        purposeRo: 'Platformă Enterprise SIEM, HIDS, Analiză Loguri, Monitorizare Securitate Rețea (Zeek, Suricata, Elastic, Kibana)'
      },
      { 
        vmid: 205, 
        name: 'remnux', 
        os: 'REMnux v7 / Noble', 
        allocatedMb: 4096, 
        balloonMinMb: 2048, 
        purpose: 'Dedicated Linux Toolkit for Reverse Engineering, Malware Analysis & Digital Forensics (DFIR)',
        purposeRo: 'Toolkit Linux Dedicat pentru Reverse Engineering, Analiză Malware și Investigare Digitală (DFIR)'
      },
      { 
        vmid: 301, 
        name: 'metasploitable-licenta', 
        os: 'Metasploitable Linux Target', 
        allocatedMb: 2048, 
        balloonMinMb: 1024, 
        purpose: 'Bachelor Thesis Lab (Lucrare de Licență) - Vulnerable Linux Target Proving Ground for Automated Exploitation & Wazuh SIEM Detection Rule Validation',
        purposeRo: 'Laborator Lucrare de Licență (Bachelor Thesis) - Poligon cu Ținte Linux Vulnerabile pentru Exploatare Automată și Validarea Regulilor de Detecție Wazuh SIEM'
      },
      { 
        vmid: 302, 
        name: 'kali-licenta', 
        os: 'Kali Linux Rolling', 
        allocatedMb: 4096, 
        balloonMinMb: 2048, 
        purpose: 'Bachelor Thesis Lab (Lucrare de Licență) - Kali Linux Offensive Security & Red Team Pentest Workstation (Isolated vmbr1 / VLAN 30)',
        purposeRo: 'Laborator Lucrare de Licență (Bachelor Thesis) - Stație de Lucru Kali Linux pentru Securitate Ofensivă și Teste de Penetrare (Izolat vmbr1 / VLAN 30)'
      },
      { 
        vmid: 400, 
        name: 'ad2025', 
        os: 'Windows Server 2025 Datacenter', 
        allocatedMb: 8192, 
        balloonMinMb: 4096, 
        purpose: 'Active Directory Enterprise Lab - Windows Server 2025 Primary Domain Controller (PDC) & Forest Root with GTX 1050 Ti PCIe Passthrough (256 GB NVMe)',
        purposeRo: 'Laborator Enterprise Active Directory - Controller Principal de Domeniu (PDC) și Rădăcină Forest Windows Server 2025 cu Passthrough PCIe GTX 1050 Ti (256 GB NVMe)'
      },
      { 
        vmid: 401, 
        name: 'ad2022', 
        os: 'Windows Server 2022 Standard / Datacenter', 
        allocatedMb: 4096, 
        balloonMinMb: 2048, 
        purpose: 'Active Directory Enterprise Lab - Windows Server 2022 Domain Controller & DNS / DHCP Infrastructure',
        purposeRo: 'Laborator Enterprise Active Directory - Controller de Domeniu Windows Server 2022 și Infrastructură DNS / DHCP'
      },
      { 
        vmid: 402, 
        name: 'ad2019', 
        os: 'Windows Server 2019 Standard', 
        allocatedMb: 2048, 
        balloonMinMb: 2048, 
        purpose: 'Active Directory Enterprise Lab - Windows Server 2019 Domain Controller & Kerberos Authentication Delegation (128 GB NVMe, Q35 OVMF UEFI)',
        purposeRo: 'Laborator Enterprise Active Directory - Controller de Domeniu Windows Server 2019 și Delegare Autentificare Kerberos (128 GB NVMe, Q35 OVMF UEFI)'
      },
      { 
        vmid: 403, 
        name: 'ad2016', 
        os: 'Windows Server 2016 Standard', 
        allocatedMb: 3072, 
        balloonMinMb: 2048, 
        purpose: 'Active Directory Enterprise Lab - Windows Server 2016 Domain Controller & Cross-Forest Trust Testing',
        purposeRo: 'Laborator Enterprise Active Directory - Controller de Domeniu Windows Server 2016 și Testare Cross-Forest Trust'
      },
      { 
        vmid: 404, 
        name: 'ad2012', 
        os: 'Windows Server 2012 R2 Standard', 
        allocatedMb: 2048, 
        balloonMinMb: 1024, 
        purpose: 'Active Directory Enterprise Lab - Windows Server 2012 R2 Domain Controller (Legacy Functional Level Compatibility)',
        purposeRo: 'Laborator Enterprise Active Directory - Controller de Domeniu Windows Server 2012 R2 (Compatibilitate Nivel Funcțional Moștenit)'
      },
      { 
        vmid: 405, 
        name: 'ad2008', 
        os: 'Windows Server 2008 R2 SP1 Standard', 
        allocatedMb: 2048, 
        balloonMinMb: 1024, 
        purpose: 'Active Directory Enterprise Lab - Windows Server 2008 R2 SP1 Domain Controller (Legacy Forest Testing & Kerberos Migration)',
        purposeRo: 'Laborator Enterprise Active Directory - Controller de Domeniu Windows Server 2008 R2 SP1 (Testare Forest Moștenit și Migrare Kerberos)'
      },
      { 
        vmid: 406, 
        name: 'adwin10', 
        os: 'Windows 10 Enterprise / Pro', 
        allocatedMb: 3072, 
        balloonMinMb: 2048, 
        purpose: 'Active Directory Enterprise Lab - Windows 10 Enterprise Domain-Joined Workstation Client & GPO Policy Target',
        purposeRo: 'Laborator Enterprise Active Directory - Stație Client Windows 10 Enterprise Integrată în Domeniu și Țintă Politici GPO'
      },
      { 
        vmid: 407, 
        name: 'adwin11', 
        os: 'Windows 11 Enterprise / Pro', 
        allocatedMb: 4096, 
        balloonMinMb: 2048, 
        purpose: 'Active Directory Enterprise Lab - Windows 11 Enterprise Modern Domain-Joined Client & TPM 2.0 Security Target',
        purposeRo: 'Laborator Enterprise Active Directory - Stație Modernă Client Windows 11 Enterprise Integrată în Domeniu și Securitate TPM 2.0'
      },
      { 
        vmid: 408, 
        name: 'adwin7', 
        os: 'Windows 7 Ultimate SP1', 
        allocatedMb: 2048, 
        balloonMinMb: 1024, 
        purpose: 'Active Directory Enterprise Lab - Windows 7 Ultimate SP1 Legacy Client (NTLMv2 & SMBv1 Testing)',
        purposeRo: 'Laborator Enterprise Active Directory - Stație Client Windows 7 Ultimate SP1 Moștenită (Testare NTLMv2 & SMBv1)'
      },
      { 
        vmid: 409, 
        name: 'adrhel', 
        os: 'RHEL 9.8 Enterprise', 
        allocatedMb: 2048, 
        balloonMinMb: 1024, 
        purpose: 'Active Directory Enterprise Lab - Red Hat Enterprise Linux 9.8 Domain Integration (realmd / SSSD / Kerberos, SELinux Enforcing)',
        purposeRo: 'Laborator Enterprise Active Directory - Integrare în Domeniu Red Hat Enterprise Linux 9.8 (realmd / SSSD / Kerberos, SELinux Enforcing)'
      },
      { 
        vmid: 410, 
        name: 'ad2003', 
        os: 'Windows Server 2003 R2 SP2 Enterprise x64', 
        allocatedMb: 2048, 
        balloonMinMb: 1024, 
        purpose: 'Active Directory Enterprise Lab - Windows Server 2003 R2 SP2 Ultra-Legacy Domain Controller (SMBv1, LanMan, NTLMv1)',
        purposeRo: 'Laborator Enterprise Active Directory - Controller de Domeniu Ultra-Legacy Windows Server 2003 R2 SP2 (SMBv1, LanMan, NTLMv1)'
      }
    ],
    workloads: [
      'VM 200: OPNsense Core Firewall (4096 MB / Balloon: 2048 MB · Suricata IDS/IPS, CrowdSec Bouncer, GeoIP Drop, DoT Quad9, Telegraf, Monit, GitOps, FRR BGP, Tailscale, NetFlow)',
      'VM 201: OpenStack 2024.1 Caracal (4096 MB / Balloon: 2048 MB · 32 GB NVMe · Enterprise Cloud Controller & Horizon)',
      'VM 202: Metasploitable 2 (512 MB · 8 GB NVMe · Penetration Testing, Red Teaming & Exploit Vulnerability Lab)',
      'VM 203: T-Pot 24.04 Multi-Honeypot Platform (8192 MB / Balloon: 4096 MB · 60 GB NVMe · Cowrie, Dionaea, Elastic, Kibana, Suricata)',
      'VM 204: Security Onion 3.2 / Wazuh SIEM Platform (8192 MB / Balloon: 4096 MB · 50 GB NVMe · Zeek, Suricata, Elastic, Kibana, HIDS)',
      'VM 205: REMnux v7 / Noble (4096 MB / Balloon: 2048 MB · 40 GB NVMe · Reverse Engineering, Malware Analysis & DFIR)',
      'VM 301: Metasploitable Licență (Bachelor Thesis / Lucrare de Licență · 2048 MB / Balloon: 1024 MB · 20 GB NVMe · Pentest & Wazuh Rules Lab)',
      'VM 302: Kali Licență (Bachelor Thesis / Lucrare de Licență · 4096 MB / Balloon: 2048 MB · 30 GB NVMe · Isolated vmbr1 Pentest)',
      'CT 303: OWASP Licență (Bachelor Thesis / Lucrare de Licență · 512 MB · 8 GB NVMe · Alpine LXC Docker Container on vmbr1)',
      'VM 400-410: Active Directory Lab Fleet: ad2025 (VM 400, GTX 1050 Ti Passthrough, 256 GB), ad2022 (VM 401), ad2019 (VM 402, 128 GB), ad2016 (VM 403), ad2012 (VM 404), ad2008 (VM 405), ad2003 (VM 410), adwin7 (VM 408), adwin10 (VM 406), adwin11 (VM 407), adrhel (VM 409) · Multi-Generation Windows & Linux Active Directory Enterprise Lab',
      'CT 100-105: Core Infrastructure & Media: Immich AI (CT 100), Nextcloud Hub (CT 101), Home Assistant (CT 102), n8n Workflows (CT 103), Scrutiny SMART (CT 104), Jellyfin Media Server (CT 105)',
      'CT 106-107: Ollama GPU LLM Server (CT 106) & Open-WebUI Assistant (CT 107) (CUDA GTX 1050 Ti Passthrough)',
      'CT 108: Faster-Whisper GPU Speech-to-Text Transcriber (CT 108 · CUDA Accelerated)',
      'CT 109: Paperless-AI Automated Document Analysis & DeepSeek Vision Tagging (CT 109)',
      'CT 110: Code-Server Web IDE (VS Code Cloud Workspace · CT 110)',
      'CT 111: Proxmox Backup Server (PBS Enterprise Deduplication & Verification · CT 111)',
      'CT 112: Proxmox Datacenter Manager (PDM Multi-Cluster Fleet UI · CT 112)',
      'CT 113: Woodpecker CI Server & Runner on Alpine Linux backed by k0s Kubernetes Engine (CT 113)',
      'CT 114-120: Consolidated Utilities & Self-Hosted Microservices (onboot: 0 · IT-Tools (CT 114), Uptime Kuma (CT 115), Vaultwarden (CT 116), Monitoring (CT 117), Authelia (CT 118), Gitea (CT 119), OWASP Juice Shop (CT 120))'
    ]
  },
  {
    id: 'node2-omv',
    name: 'OpenMediaVault NAS (openmediavault)',
    machine: 'ASUS X451MA Laptop Chassis',
    machineRo: 'Șasiu Laptop ASUS X451MA',
    role: 'Provides centralized network-attached storage using resilient ZFS mirror pools. It hosts high-capacity SMB and NFS file shares, stores daily hypervisor snapshot backups, and serves offline knowledge archives.',
    roleRo: 'Furnizează stocare centralizată atașată în rețea (NAS) folosind pool-uri redundante ZFS mirror. Găzduiește partajări SMB și NFS de mare capacitate, stochează backup-urile zilnice ale hypervisorilor și servește arhive offline de cunoștințe.',
    cpu: 'Intel Celeron N2830 (2 Cores / 2 Threads @ 2.16 GHz, 2.41 GHz Burst)',
    gpu: 'Intel HD Graphics (Bay Trail Integrated)',
    ram: '2,048 MB DDR3 Low-Voltage',
    storage: '500 GB HDD (SATA II Mechanical Pool)',
    os: 'OpenMediaVault (OMV) / Debian Linux 12',
    ip: '192.168.1.135',
    status: 'OPERATIONAL',
    tags: ['ZFS Storage Pool', 'Centralized NAS', 'NFS / SMB Shares', 'Proxmox VZDump Target', 'Offline Wikipedia'],
    tagsRo: ['Pool Stocare ZFS', 'NAS Centralizat', 'Partajări NFS / SMB', 'Țintă Backup VZDump', 'Wikipedia Offline'],
    workloads: [
      'OpenMediaVault Core Storage Engine (ZFS / ext4)',
      'NFS & SMB Centralized Storage Shares',
      'Proxmox VE Daily Backup Repository (VZDump)',
      'Kiwix Offline Wikipedia & StackOverflow ZIM Server (:8085)',
      'Immich Photo Library & Jellyfin Media Storage Pool'
    ]
  },
  {
    id: 'kubernetes-node',
    name: 'Kubernetes Worker (kubernetes)',
    machine: 'Custom ATX Compute Chassis',
    machineRo: 'Șasiu ATX Compute Custom',
    role: 'Operates as a dedicated bare-metal Kubernetes worker node for batch jobs and container execution. It runs kernel-level eBPF security sensors and continuous telemetry agents to maintain cluster resilience.',
    roleRo: 'Funcționează ca un nod worker Kubernetes bare-metal dedicat pentru sarcini batch și execuție de containere. Rulează senzori de securitate eBPF la nivel de kernel și agenți de telemetrie continuă.',
    cpu: 'AMD Athlon II X2 220 (2 Cores / 2 Threads @ 2.80 GHz Regor / AM3)',
    gpu: 'NVIDIA GeForce GTS 250 (1GB GDDR3 / 256-bit Bus)',
    ram: '4,096 MB DDR3',
    storage: '80 GB HDD (SATA II / 7200 RPM local cache; persistență pe NFS)',
    psu: 'Standard ATX Power Supply Unit',
    os: 'Talos Linux / Debian Base with containerd CRI & k3s-agent',
    ip: '192.168.1.18',
    status: 'OPERATIONAL',
    tags: ['Kubernetes Fleet', 'ArgoCD GitOps', 'Cilium eBPF', 'Rook Ceph Storage', 'CoreDNS', 'Twingate ZTNA', 'Woodpecker CI'],
    tagsRo: ['Flotă Kubernetes', 'ArgoCD GitOps', 'Cilium eBPF', 'Stocare Rook Ceph', 'CoreDNS', 'Twingate ZTNA', 'Woodpecker CI'],
    workloads: [
      'ArgoCD Declarative Continuous Delivery & GitOps App Controller',
      'Cilium eBPF CNI with WireGuard Transparent Encryption & Hubble UI',
      'Rook Ceph Distributed Cloud-Native Block (RBD) & CephFS Storage',
      'CoreDNS In-Cluster Split-Horizon DNS & Pi-hole Resolver Forwarder',
      'Twingate Zero-Trust Remote Access Connector (P2P Mesh)',
      'Woodpecker CI Runner Agent for Automated Kubernetes Testing'
    ]
  }
];
