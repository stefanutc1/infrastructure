import { Injectable, signal } from '@angular/core';

export type Language = 'ro' | 'en';

export interface Translations {
  // Navigation & Header
  navOverview: string;
  navTopology: string;
  navServices: string;
  navHardware: string;
  navBlueprint: string;
  statusClusterActive: string;
  sublabelTag: string;

  // Overview / Hero
  heroTag: string;
  heroTitle: string;
  heroDescription: string;
  metricComputeTitle: string;
  metricComputeCount: string;
  metricComputeDesc: string;
  metricVirtTitle: string;
  metricVirtCount: string;
  metricVirtDesc: string;
  metricServicesTitle: string;
  metricServicesCount: string;
  metricServicesDesc: string;
  metricCyberTitle: string;
  metricCyberCount: string;
  metricCyberDesc: string;

  // 3D Topology
  topologyTag: string;
  topologyTitle: string;
  topologyDesc: string;
  btnRotate: string;
  btnReset: string;
  btnLogical: string;
  btnPhysical: string;
  meshActive: string;
  nodesLabel: string;
  flowsLabel: string;
  interactionHint: string;
  catAll: string;
  catCompute: string;
  catNetwork: string;
  catSecurity: string;
  catServices: string;
  catElo: string;
  catStorage: string;
  catEdge: string;

  // Hardware Fleet
  hwTag: string;
  hwTitle: string;
  hwDesc: string;
  hwCpu: string;
  hwOs: string;
  hwRam: string;
  hwStorage: string;
  hwGpu: string;
  hwPsu: string;
  hwHostedWorkloads: string;
  btnLocate3D: string;

  // Service Catalog
  srvTag: string;
  srvTitle: string;
  srvDesc: string;
  srvSearchPlaceholder: string;
  srvRamCeiling: string;
  srvStoragePool: string;
  btnLocateInMesh: string;
  srvCatAll: string;
  srvCatCore: string;
  srvCatStorage: string;
  srvCatMedia: string;
  srvCatMonitoring: string;
  srvCatSecurity: string;
  srvCatAutomation: string;
  srvCatCyber: string;
  srvCatAi: string;

  // Architecture Blueprint
  bpTag: string;
  bpTitle: string;
  bpDesc: string;
  tabVlan: string;
  tabCyber: string;
  tabMemory: string;
  tabAi: string;
  tabDevSecOps: string;

  // Node Inspector
  inspectorSpec: string;
  inspectorCascade: string;
  inspectorManifest: string;
  inspectorRole: string;
  inspectorHostAllocation: string;
  inspectorComputeHost: string;
  inspectorTierLevel: string;
  inspectorNetworkConfig: string;
  inspectorIp: string;
  inspectorPort: string;
  inspectorSubsystem: string;
  inspectorRelationshipChain: string;
  inspectorConnectedNodes: string;
  inspectorCopySpec: string;
  inspectorCopied: string;

  // Footer
  footerSub: string;
  footerTop: string;
  footerGithub: string;
}

const EN_TRANSLATIONS: Translations = {
  navOverview: 'Overview',
  navTopology: '3D Topology',
  navServices: 'Services',
  navHardware: 'Hardware Fleet',
  navBlueprint: 'Architecture & Cyber',
  statusClusterActive: '3 nodes online',
  sublabelTag: 'Infrastructure & Services',

  heroTag: 'SYSTEM ARCHITECTURE & OVERVIEW',
  heroTitle: 'A heterogeneous bare-metal compute cluster, private cloud, and security testing lab.',
  heroDescription: 'Technical documentation and interactive overview of the datacenter infrastructure: Proxmox VE virtualization on Intel x86_64, ZFS storage, OPNsense firewall segmentation, local GPU LLMs, and automation.',
  
  metricComputeTitle: 'PHYSICAL COMPUTE',
  metricComputeCount: '3 Nodes',
  metricComputeDesc: 'Intel i3-10100F (GTX 1050 Ti), ASUS Celeron OMV NAS, and AMD Athlon II k3s.',
  
  metricVirtTitle: 'VIRTUALIZATION',
  metricVirtCount: '1 Hypervisor',
  metricVirtDesc: 'Proxmox VE 9.2 x86_64 hosting OPNsense (VM 200), Parrot (VM 300), Active Directory lab (VMs 400–405), and 7 production LXCs (100–106).',
  
  metricServicesTitle: 'ACTIVE SERVICES',
  metricServicesCount: '22 Workloads',
  metricServicesDesc: 'Production microservices, Active Directory forest, SIEM telemetry, local GPU AI, and network infrastructure.',
  
  metricCyberTitle: 'SECURITY & DFIR',
  metricCyberCount: 'SOC · Wazuh SIEM',
  metricCyberDesc: 'Wazuh SIEM / XDR (4GB Heap), Suricata IDS/IPS, OPNsense firewall, and 5 digital forensics investigations.',

  topologyTag: 'NETWORK TOPOLOGY',
  topologyTitle: 'Spatial 3D Topology Visualization',
  topologyDesc: 'Click nodes to inspect technical specifications, network relationships, and deployment manifests.',
  btnRotate: 'Rotate',
  btnReset: 'Reset',
  btnLogical: 'Logical',
  btnPhysical: 'Physical',
  meshActive: 'ACTIVE MESH',
  nodesLabel: 'NODES',
  flowsLabel: 'FLOWS',
  interactionHint: 'DRAG TO ROTATE · SCROLL TO ZOOM · CLICK FOR DETAILS',
  catAll: 'All Layers',
  catCompute: 'Compute & Hypervisors',
  catNetwork: 'Network & Ingress',
  catSecurity: 'Security & Cyber',
  catServices: 'Core Services',
  catElo: 'AI Control Plane',
  catStorage: 'Storage & ZFS',
  catEdge: 'Edge Sensors',

  hwTag: 'PHYSICAL HARDWARE',
  hwTitle: 'Hardware Fleet (3 Compute Nodes)',
  hwDesc: 'Multi-node bare-metal infrastructure: Intel Core i3 x86_64 virtualization, ASUS Celeron ZFS NAS, and AMD Athlon II Kubernetes worker.',
  hwCpu: 'Processor (CPU)',
  hwOs: 'Operating System',
  hwRam: 'RAM Capacity',
  hwStorage: 'Storage Pool',
  hwGpu: 'GPU / ML Accelerator',
  hwPsu: 'Power Supply (PSU)',
  hwHostedWorkloads: 'Hosted Virtual Workloads on this Node',
  btnLocate3D: 'LOCATE IN 3D',

  srvTag: 'SERVICES CATALOG',
  srvTitle: 'Active Services & Workloads',
  srvDesc: 'Catalog of active datacenter microservices and infrastructure components with real-time telemetry and resource allocations.',
  srvSearchPlaceholder: 'Search service, port, host, category...',
  srvRamCeiling: 'RAM Ceiling',
  srvStoragePool: 'Storage Pool',
  btnLocateInMesh: 'LOCATE IN 3D',
  srvCatAll: 'All Services',
  srvCatCore: 'Core Infrastructure',
  srvCatStorage: 'Storage & Sync',
  srvCatMedia: 'Media Streaming',
  srvCatMonitoring: 'Observability',
  srvCatSecurity: 'Security & SSO',
  srvCatAutomation: 'Automation & IoT',
  srvCatCyber: 'Cyber & DFIR',
  srvCatAi: 'AI & Ollama LLM',

  bpTag: 'TECHNICAL BLUEPRINT',
  bpTitle: 'System Architecture & Blueprint',
  bpDesc: 'Technical specifications for VLAN isolation, cybersecurity tooling, digital forensics (DFIR), ZFS storage, and UPS telemetry.',
  tabVlan: 'VLAN Segmentation Matrix',
  tabCyber: 'Cybersecurity & DFIR',
  tabMemory: 'RAM Allocation Budgets',
  tabAi: 'AI Routing & Ollama GPU',
  tabDevSecOps: 'DevSecOps & Immutability',

  inspectorSpec: 'SPECIFICATION',
  inspectorCascade: 'RELATIONSHIPS',
  inspectorManifest: 'MANIFEST',
  inspectorRole: 'TECHNICAL ROLE',
  inspectorHostAllocation: 'HOST & CAPACITY',
  inspectorComputeHost: 'Compute Host',
  inspectorTierLevel: 'Layer Tier',
  inspectorNetworkConfig: 'Network Configuration',
  inspectorIp: 'IP Address',
  inspectorPort: 'Exposed Port',
  inspectorSubsystem: 'Subsystem',
  inspectorRelationshipChain: 'Connection Chain',
  inspectorConnectedNodes: 'Connected Nodes',
  inspectorCopySpec: 'COPY SPEC',
  inspectorCopied: 'COPIED!',

  footerSub: '— Proxmox VE · OPNsense · Wazuh SIEM/XDR · DFIR · Ollama LLM',
  footerTop: 'TOP ↑',
  footerGithub: 'GITHUB REPO'
};

const TRANSLATIONS: Record<Language, Translations> = {
  ro: EN_TRANSLATIONS,
  en: EN_TRANSLATIONS
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal<Language>('en');

  get isRomanian(): boolean {
    return false;
  }

  constructor() {
    this.currentLang.set('en');
    localStorage.setItem('homelab_lang', 'en');
  }

  get t(): Translations {
    return EN_TRANSLATIONS;
  }

  setLanguage(lang: Language) {
    this.currentLang.set('en');
    localStorage.setItem('homelab_lang', 'en');
  }
}
