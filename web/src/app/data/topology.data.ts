export interface TopologyNode {
  id: string;
  name: string;
  sublabel: string;
  ip: string;
  port?: number;
  category: 'compute' | 'network' | 'security' | 'services' | 'elo' | 'storage' | 'edge';
  tier: number;
  status: 'OPERATIONAL' | 'STANDBY' | 'MAINTENANCE';
  x: number;
  y: number;
  z: number;
  color: string;
  icon?: string;
  hardware?: {
    node: string;
    ram: string;
    storage: string;
  };
  tags?: string[];
  role: string;
  connections: string[];
}

export interface TopologyLink {
  from: string;
  to: string;
  protocol?: string;
  color: string;
}

export const TOPOLOGY_NODES: TopologyNode[] = [
  // 1. WAN & Perimeter Firewall
  {
    id: 'wan-gw',
    name: 'WAN Ingress',
    sublabel: 'Fiber Optical ONT',
    ip: '192.168.1.1',
    category: 'network',
    tier: 0,
    status: 'OPERATIONAL',
    x: 0,
    y: -85,
    z: -40,
    color: '#06b6d4',
    icon: 'opnsense',
    tags: ['WAN Ingress', 'Fiber Optic', 'Demarcation', 'Network Gateway'],
    role: 'Provides Gigabit fiber optic uplink and external network boundary demarcation.',
    connections: ['opnsense-gw']
  },
  {
    id: 'opnsense-gw',
    name: 'OPNsense Firewall',
    sublabel: 'VM 200 · Stateful Core',
    ip: '192.168.1.134',
    port: 8443,
    category: 'security',
    tier: 0,
    status: 'OPERATIONAL',
    x: 0,
    y: -40,
    z: -20,
    color: '#d97706',
    icon: 'opnsense',
    hardware: { node: 'Node 1 (PVE VM 200)', ram: '2,048 MB', storage: '16 GB LVM' },
    tags: ['Perimeter Firewall', 'Suricata IDS/IPS', 'WireGuard', 'Unbound DNS', 'pf Filter'],
    role: 'Perimeter stateful firewall inspecting traffic, hosting Suricata IDS/IPS, and enforcing DNS sinkholing.',
    connections: ['node1-pve', 'node2-omv', 'kubernetes-node']
  },

  // 2. Physical Hypervisors & Nodes
  {
    id: 'node1-pve',
    name: 'Proxmox Primary',
    sublabel: 'Node 1 · Core Hypervisor',
    ip: '192.168.1.132',
    port: 8006,
    category: 'compute',
    tier: 1,
    status: 'OPERATIONAL',
    x: 0,
    y: 0,
    z: 0,
    color: '#e11d48',
    icon: 'proxmox',
    hardware: { node: 'Intel Core i3-10100F', ram: '12,288 MB DDR4', storage: '512 GB NVMe' },
    tags: ['Primary Hypervisor', 'x86_64 Bare-Metal', 'GTX 1050 Ti', 'ZRAM lz4', 'Proxmox VE 9.2'],
    role: 'Bare-metal virtualization hypervisor hosting active LXCs (100–107) and Parrot Security VM 300.',
    connections: ['homeassistant', 'n8n', 'scrutiny', 'ollama', 'uptimekuma', 'monitoring', 'owasp', 'wazuh', 'parrot']
  },
  {
    id: 'node2-omv',
    name: 'OMV NAS Storage',
    sublabel: 'Node 2 · Centralized Storage',
    ip: '192.168.1.135',
    port: 80,
    category: 'storage',
    tier: 1,
    status: 'OPERATIONAL',
    x: -110,
    y: 20,
    z: -20,
    color: '#2563eb',
    icon: 'linux',
    hardware: { node: 'ASUS Celeron N2830', ram: '2,048 MB DDR3', storage: '500 GB HDD' },
    tags: ['ZFS Mirror', 'NAS', 'NFS', 'SMB', 'Secondary Backup Pool'],
    role: 'Centralized network storage providing NFS/SMB shares and off-host hypervisor backup repository.',
    connections: ['node1-pve']
  },
  {
    id: 'kubernetes-node',
    name: 'Kubernetes Worker',
    sublabel: 'Node 4 · k3s Bare-Metal',
    ip: '192.168.1.18',
    port: 6443,
    category: 'compute',
    tier: 1,
    status: 'OPERATIONAL',
    x: 110,
    y: 20,
    z: -20,
    color: '#3b82f6',
    icon: 'linux',
    hardware: { node: 'AMD Athlon II X2 220', ram: '4,096 MB DDR3', storage: '80 GB HDD' },
    tags: ['Kubernetes', 'k3s-agent', 'Containerd', 'Alpine Linux', 'Worker Node'],
    role: 'Bare-metal lightweight Kubernetes worker executing stateless container jobs and cluster probes.',
    connections: ['node1-pve']
  },

  // 3. Active Production LXC Containers (100–107) & VM 300
  {
    id: 'homeassistant',
    name: 'Home Assistant',
    sublabel: 'CT 100 · Smart Home',
    ip: '192.168.1.10',
    port: 8123,
    category: 'edge',
    tier: 2,
    status: 'OPERATIONAL',
    x: -80,
    y: 50,
    z: 30,
    color: '#0284c7',
    icon: 'homeassistant',
    hardware: { node: 'Node 1 (PVE CT 100)', ram: '384 MB', storage: '16 GB LVM' },
    tags: ['Home Assistant', 'IoT Hub', 'Zigbee', 'Automation', 'MQTT'],
    role: 'Smart home hub controlling Zigbee devices, sensor telemetry, and local automation rules.',
    connections: ['monitoring']
  },
  {
    id: 'n8n',
    name: 'n8n Automation',
    sublabel: 'CT 101 · SOAR Engine',
    ip: '192.168.1.107',
    port: 5678,
    category: 'services',
    tier: 2,
    status: 'OPERATIONAL',
    x: -50,
    y: 65,
    z: 40,
    color: '#ea580c',
    icon: 'n8n',
    hardware: { node: 'Node 1 (PVE CT 101)', ram: '384 MB', storage: '8 GB LVM' },
    tags: ['Workflows', 'Webhooks', 'SOAR', 'Integrations', 'Automation'],
    role: 'Low-code workflow automation orchestrating incident triage and event webhooks.',
    connections: ['wazuh']
  },
  {
    id: 'scrutiny',
    name: 'Scrutiny SMART',
    sublabel: 'CT 102 · Drive Health',
    ip: '192.168.1.108',
    port: 8080,
    category: 'storage',
    tier: 2,
    status: 'OPERATIONAL',
    x: -20,
    y: 75,
    z: 50,
    color: '#0d9488',
    icon: 'scrutiny',
    hardware: { node: 'Node 1 (PVE CT 102)', ram: '128 MB', storage: '4 GB LVM' },
    tags: ['Storage', 'SMART', 'Telemetry', 'Drive Health', 'Monitoring'],
    role: 'Hard drive S.M.A.R.T. telemetry collector and disk failure warning daemon.',
    connections: ['monitoring']
  },
  {
    id: 'ollama',
    name: 'Ollama GPU AI',
    sublabel: 'CT 103 · GTX 1050 Ti',
    ip: '192.168.1.110',
    port: 11434,
    category: 'elo',
    tier: 2,
    status: 'OPERATIONAL',
    x: 20,
    y: 75,
    z: 50,
    color: '#8b5cf6',
    icon: 'python',
    hardware: { node: 'Node 1 (PVE CT 103)', ram: '2,048 MB', storage: '16 GB LVM' },
    tags: ['Local LLM', 'CUDA', 'GTX 1050 Ti', 'Inference', 'AI Runtime'],
    role: 'GPU-accelerated LLM runtime providing local AI generation and code assistant capabilities.',
    connections: ['n8n']
  },
  {
    id: 'uptimekuma',
    name: 'Uptime Kuma',
    sublabel: 'CT 104 · Status Engine',
    ip: '192.168.1.119',
    port: 3001,
    category: 'services',
    tier: 2,
    status: 'OPERATIONAL',
    x: 50,
    y: 65,
    z: 40,
    color: '#10b981',
    icon: 'uptime-kuma',
    hardware: { node: 'Node 1 (PVE CT 104)', ram: '128 MB', storage: '2 GB LVM' },
    tags: ['Healthchecks', 'Monitoring', 'Uptime', 'Status Page', 'Alerts'],
    role: 'High-frequency service availability monitor probing HTTP/TCP endpoints.',
    connections: ['monitoring']
  },
  {
    id: 'monitoring',
    name: 'Monitoring Stack',
    sublabel: 'CT 105 · Prom & Grafana',
    ip: '192.168.1.121',
    port: 3000,
    category: 'services',
    tier: 2,
    status: 'OPERATIONAL',
    x: 80,
    y: 50,
    z: 30,
    color: '#f97316',
    icon: 'grafana',
    hardware: { node: 'Node 1 (PVE CT 105)', ram: '256 MB', storage: '4 GB LVM' },
    tags: ['Prometheus', 'Grafana', 'TSDB', 'Observability', 'Dashboards'],
    role: 'Centralized cluster observability scraping system metrics and rendering visual dashboards.',
    connections: ['wazuh']
  },
  {
    id: 'owasp',
    name: 'OWASP Pentest Lab',
    sublabel: 'CT 106 · Juice Shop',
    ip: '192.168.1.175',
    port: 3000,
    category: 'security',
    tier: 2,
    status: 'OPERATIONAL',
    x: 95,
    y: 15,
    z: 20,
    color: '#e11d48',
    icon: 'shield',
    hardware: { node: 'Node 1 (PVE CT 106)', ram: '512 MB', storage: '8 GB LVM' },
    tags: ['OWASP', 'Juice Shop', 'Pentest Target', 'CyberLab', 'Web Security'],
    role: 'Intentionally vulnerable web application target for offensive penetration testing.',
    connections: ['parrot']
  },
  {
    id: 'wazuh',
    name: 'Wazuh SIEM / XDR',
    sublabel: 'CT 107 · OpenSearch',
    ip: '192.168.1.240',
    port: 443,
    category: 'security',
    tier: 2,
    status: 'OPERATIONAL',
    x: 0,
    y: 90,
    z: 60,
    color: '#0284c7',
    icon: 'wazuh',
    hardware: { node: 'Node 1 (PVE CT 107)', ram: '6,144 MB (4GB Heap)', storage: '35 GB LVM' },
    tags: ['SIEM', 'XDR', 'Wazuh Manager', 'OpenSearch Indexer', 'Compliance'],
    role: 'Enterprise SIEM ingesting host logs, Suricata EVE-JSON events, and firewall drops.',
    connections: ['opnsense-gw']
  },
  {
    id: 'parrot',
    name: 'Parrot Security OS',
    sublabel: 'VM 300 · Workstation',
    ip: '192.168.1.30',
    port: 22,
    category: 'security',
    tier: 2,
    status: 'OPERATIONAL',
    x: 120,
    y: -20,
    z: 10,
    color: '#06b6d4',
    icon: 'linux',
    hardware: { node: 'Node 1 (PVE VM 300)', ram: '2,048 MB', storage: '30 GB LVM' },
    tags: ['Parrot OS', 'CyberLab', 'Red Team', 'Forensics', 'Security Workstation'],
    role: 'Dedicated offensive security workstation for network scanning and digital forensics.',
    connections: ['owasp']
  }
];

export const TOPOLOGY_LINKS: TopologyLink[] = [
  // Edge Demarcation
  { from: 'wan-gw', to: 'opnsense-gw', protocol: 'Gigabit Fiber', color: 'rgba(6, 182, 212, 0.7)' },
  
  // OPNsense Gateway -> Compute Nodes
  { from: 'opnsense-gw', to: 'node1-pve', protocol: 'VLAN 10 Trunk', color: 'rgba(217, 119, 6, 0.7)' },
  { from: 'opnsense-gw', to: 'node2-omv', protocol: 'VLAN 10 LAN', color: 'rgba(37, 99, 235, 0.6)' },
  { from: 'opnsense-gw', to: 'kubernetes-node', protocol: 'VLAN 10 LAN', color: 'rgba(59, 130, 246, 0.6)' },

  // Node 1 Hypervisor -> Hosted LXCs
  { from: 'node1-pve', to: 'homeassistant', protocol: 'veth / Bridge', color: 'rgba(2, 132, 199, 0.5)' },
  { from: 'node1-pve', to: 'n8n', protocol: 'veth / Bridge', color: 'rgba(234, 88, 12, 0.5)' },
  { from: 'node1-pve', to: 'scrutiny', protocol: 'veth / Bridge', color: 'rgba(13, 148, 136, 0.5)' },
  { from: 'node1-pve', to: 'ollama', protocol: 'PCIe Passthrough', color: 'rgba(139, 92, 246, 0.7)' },
  { from: 'node1-pve', to: 'uptimekuma', protocol: 'veth / Bridge', color: 'rgba(16, 185, 129, 0.5)' },
  { from: 'node1-pve', to: 'monitoring', protocol: 'veth / Bridge', color: 'rgba(249, 115, 22, 0.5)' },
  { from: 'node1-pve', to: 'owasp', protocol: 'veth / Bridge', color: 'rgba(225, 29, 72, 0.5)' },
  { from: 'node1-pve', to: 'wazuh', protocol: 'veth / Bridge', color: 'rgba(2, 132, 199, 0.7)' },
  { from: 'node1-pve', to: 'parrot', protocol: 'VirtIO SCSI', color: 'rgba(6, 182, 212, 0.6)' },

  // Inter-Service Flows
  { from: 'homeassistant', to: 'monitoring', protocol: 'Prometheus Metrics', color: 'rgba(249, 115, 22, 0.4)' },
  { from: 'scrutiny', to: 'monitoring', protocol: 'SMART Telemetry', color: 'rgba(13, 148, 136, 0.4)' },
  { from: 'uptimekuma', to: 'monitoring', protocol: 'HTTP Scrapes', color: 'rgba(16, 185, 129, 0.4)' },
  { from: 'n8n', to: 'ollama', protocol: 'REST Inference API', color: 'rgba(139, 92, 246, 0.5)' },
  { from: 'n8n', to: 'wazuh', protocol: 'SOAR Active Response', color: 'rgba(2, 132, 199, 0.5)' },
  { from: 'opnsense-gw', to: 'wazuh', protocol: 'Syslog 514/UDP', color: 'rgba(217, 119, 6, 0.6)' },
  { from: 'parrot', to: 'owasp', protocol: 'Security Audit / HTTP', color: 'rgba(225, 29, 72, 0.5)' }
];
