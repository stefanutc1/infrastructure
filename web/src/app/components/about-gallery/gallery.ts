import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { SERVICES_DATA, ServiceItem } from '../../data/services.data';

interface PhotoItem {
 src: string;
 title: string;
 titleRo: string;
 category: string;
 categoryRo: string;
 description: string;
 descriptionRo: string;
 endpoint: string;
 badge: string;
 badgeRo: string;
}

@Component({
 selector: 'app-about-gallery',
 standalone: true,
 imports: [CommonModule],
 template: `
  <section id="about" class="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-obsidian-750 font-sans">
   
   <!-- Section Header -->
   <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
    <div>
     <h2 class="text-3xl sm:text-4xl font-serif text-slate-100 font-normal">
      {{ ts.isRomanian ? 'Despre Mine & Galeria Completă a Serviciilor' : 'About Me & Complete Services Fleet Gallery' }}
     </h2>
    </div>
    <p class="text-xs sm:text-sm text-slate-400 font-sans max-w-xl leading-relaxed">
     {{ ts.isRomanian 
      ? 'Arhitectură complet implementată pe hardware fizic și mașini virtuale de către @stefanutc1. Mai jos găsiți galeria panourilor principale, a mașinilor virtuale KVM și a tuturor microserviciilor active cu capturi reale.' 
      : 'Production-grade enterprise virtualization, security, and GitOps architecture built by @stefanutc1. Explore live management panels, KVM enterprise VMs, and all active microservices.' }}
    </p>
   </div>

   <!-- About Me Engineer Bio Card -->
   <div class="mb-12 p-6 sm:p-8 rounded-3xl bg-[#0c0e11] border border-obsidian-750 shadow-2xl relative overflow-hidden">
    <div class="absolute -right-16 -top-16 w-64 h-64 bg-obsidian-800/30 rounded-full blur-3xl pointer-events-none"></div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
     
     <div class="lg:col-span-2 space-y-4">
      <div class="flex items-center gap-3">
       <div class="w-12 h-12 rounded-2xl bg-obsidian-800 border border-obsidian-700 flex items-center justify-center font-sans font-bold text-slate-300 text-xl shadow-inner">
        SN
       </div>
       <div>
        <h3 class="text-lg sm:text-xl font-bold text-slate-100">@stefanutc1</h3>
        <p class="text-xs font-sans text-slate-300">DevOps & Infrastructure Architect · Datacenter Engineering</p>
       </div>
      </div>
      <p class="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
       {{ ts.isRomanian
        ? 'Pasionat de sisteme distribuite, securitate zero-trust, virtualizare hibridă (x86_64 cu 12 GB DDR4-2133 și ARM64 Apple Silicon) și automatizare GitOps (Terraform, Ansible, CI/CD). Acest datacenter servește drept mediu sandbox enterprise pentru testarea stivelor complexe de microservicii, kernel hardening (Linux / BSD) și observabilitate în timp real.'
        : 'Passionate about distributed systems, zero-trust perimeter defense, multi-architecture virtualization (x86_64 with 12 GB DDR4-2133 and Apple Silicon ARM64), and GitOps automation. This datacenter powers live microservices, bare-metal telemetry, and real-time observability.' }}
      </p>
      <div class="flex flex-wrap gap-2 pt-2">
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Proxmox VE 9.2 (12GB x64 · i3-10100F)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">OPNsense 24.7 Firewall (VM 200)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Wazuh SIEM / XDR (CT 106 · 6GB OpenSearch)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Ollama GPU LLM (CT 102 · GTX 1050 Ti)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Bachelor Thesis: Apache Fineract (VM 310)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Bachelor Thesis: Financial DB (VM 311)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Bachelor Thesis: Payment Gateway (CT 312)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Bachelor Thesis: Bastion MFA (VM 313)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">AD PDC: Windows Server 2022 (VM 400)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">AD SDC: Windows Server 2016 (VM 401)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">AD CA: Windows Server 2012 R2 (VM 402)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">AD Client: Windows 10 Sysmon (VM 403)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">AD Legacy: Windows 7 SMBv1 (VM 404)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">AD Linux: RHEL 9 SSSD Realm (VM 405)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">OpenStack Sandbox (VM 201)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Parrot Security OS (VM 300)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Metasploitable 2 Target (VM 301)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Malware Flare-VM Sandbox (VM 303)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">REMnux Forensic Toolkit (VM 304)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">OpenMediaVault NAS (Node 2)</span>
        <span class="px-2.5 py-1 rounded-lg bg-obsidian-800 text-slate-300 font-sans text-[11px] border border-obsidian-750">Kubernetes k3s Worker (Node 4)</span>
      </div>
     </div>

     <!-- Quick Access Endpoints Box -->
     <div class="p-5 rounded-2xl bg-obsidian-900 border border-obsidian-750 font-sans text-xs space-y-2.5">
      <div class="text-[10px] text-slate-300 font-bold uppercase tracking-wider pb-1 border-b border-obsidian-800">
       {{ ts.isRomanian ? 'Acces Rapid Panouri Web' : 'Quick Access Web Dashboards' }}
      </div>
      <div class="flex justify-between items-center text-slate-300">
       <span class="text-slate-400">Grafana (CT 104):</span>
       <a href="http://192.168.1.121:3000" target="_blank" class="text-slate-300 hover:underline">192.168.1.121:3000</a>
      </div>
      <div class="flex justify-between items-center text-slate-300">
       <span class="text-slate-400">PVE x86_64 (Node 1):</span>
       <a href="https://192.168.1.132:8006" target="_blank" class="text-slate-300 hover:underline">192.168.1.132:8006</a>
      </div>
      <div class="flex justify-between items-center text-slate-300">
       <span class="text-slate-400">OPNsense (VM 200):</span>
       <a href="https://192.168.1.134:8443" target="_blank" class="text-slate-300 hover:underline">192.168.1.134:8443</a>
      </div>
      <div class="flex justify-between items-center text-slate-300">
       <span class="text-slate-400">Wazuh SIEM (CT 106):</span>
       <a href="https://192.168.1.240:443" target="_blank" class="text-slate-300 hover:underline">192.168.1.240:443</a>
      </div>
      <div class="flex justify-between items-center text-slate-300">
       <span class="text-slate-400">Uptime Kuma (CT 103):</span>
       <a href="http://192.168.1.119:3001" target="_blank" class="text-slate-300 hover:underline">192.168.1.119:3001</a>
      </div>
      <div class="flex justify-between items-center text-slate-300">
       <span class="text-slate-400">Home Assistant (CT 100):</span>
       <a href="http://192.168.1.10:8123" target="_blank" class="text-slate-300 hover:underline">192.168.1.10:8123</a>
      </div>
      <div class="flex justify-between items-center text-slate-300">
       <span class="text-slate-400">Scrutiny SMART (CT 101):</span>
       <a href="http://192.168.1.108:8080" target="_blank" class="text-slate-300 hover:underline">192.168.1.108:8080</a>
      </div>
     </div>

    </div>
   </div>

   <!-- Tab Switcher: Core Live Panels vs All Active Services (26) -->
   <div class="flex items-center justify-between gap-4 mb-8">
    <div class="flex items-center gap-2 font-sans text-xs">
     <button
      (click)="galleryTab.set('core')"
      [class.bg-obsidian-750]="galleryTab() === 'core'"
      [class.text-slate-950]="galleryTab() === 'core'"
      [class.font-bold]="galleryTab() === 'core'"
      [class.bg-obsidian-900]="galleryTab() !== 'core'"
      [class.text-slate-300]="galleryTab() !== 'core'"
      class="px-4 py-2 rounded-xl border border-obsidian-700 transition-all shadow"
     >
      {{ ts.isRomanian ? 'Panouri Principale & VM-uri Live' : 'Core Live Panels & Enterprise VMs' }} ({{ photos.length }})
     </button>
     
     <button
      (click)="galleryTab.set('all')"
      [class.bg-obsidian-750]="galleryTab() === 'all'"
      [class.text-slate-950]="galleryTab() === 'all'"
      [class.font-bold]="galleryTab() === 'all'"
      [class.bg-obsidian-900]="galleryTab() !== 'all'"
      [class.text-slate-300]="galleryTab() !== 'all'"
      class="px-4 py-2 rounded-xl border border-obsidian-700 transition-all shadow"
     >
      {{ ts.isRomanian ? 'Toate Microserviciile' : 'All Services Fleet' }} ({{ allServices.length }})
     </button>
    </div>
    
    <div class="hidden sm:block text-xs font-sans text-slate-400">
     {{ galleryTab() === 'core' 
      ? (photos.length + (ts.isRomanian ? ' Capturi Live (Hypervisori, VM-uri, Securitate)' : ' Live Captures (Hypervisors, Enterprise VMs, Security)')) 
      : (allServices.length + (ts.isRomanian ? ' Servicii Documentate & Capturate' : ' Services Documented & Screened')) }}
    </div>
   </div>

   <!-- Core Panels Gallery Grid -->
   @if (galleryTab() === 'core') {
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     @for (photo of photos; track photo.src) {
      <div 
       (click)="selectedPhoto.set(photo)"
       class="group cursor-pointer rounded-2xl bg-[#0c0e11] border border-obsidian-750 overflow-hidden hover:border-obsidian-600 transition-all duration-300 shadow-xl flex flex-col"
      >
       <div class="relative aspect-video w-full overflow-hidden bg-obsidian-950">
        <img 
         [src]="photo.src" 
         [alt]="ts.isRomanian ? photo.titleRo : photo.title"
         class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0c0e11] via-transparent to-transparent opacity-80"></div>
        <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-sans font-bold bg-obsidian-900/90 border border-obsidian-700 text-slate-300 shadow">
         {{ ts.isRomanian ? photo.badgeRo : photo.badge }}
        </span>
       </div>

       <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
         <span class="text-[10px] font-sans uppercase tracking-wider text-slate-400">{{ ts.isRomanian ? photo.categoryRo : photo.category }}</span>
         <h4 class="text-base font-bold text-slate-100 group-hover:text-slate-100 transition-colors mt-0.5">
          {{ ts.isRomanian ? photo.titleRo : photo.title }}
         </h4>
         <p class="text-xs text-slate-300 font-sans mt-1.5 line-clamp-2 leading-relaxed">
          {{ ts.isRomanian ? photo.descriptionRo : photo.description }}
         </p>
        </div>
        <div class="pt-2 border-t border-obsidian-800 flex items-center justify-between font-sans text-[11px] text-slate-400">
         <span>{{ photo.endpoint }}</span>
         <span class="text-slate-300 group-hover:translate-x-1 transition-transform">Zoom ↗</span>
        </div>
       </div>
      </div>
     }
    </div>
   }

   <!-- All 83 Services Fleet Gallery Grid -->
   @if (galleryTab() === 'all') {
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
     @for (s of allServices; track s.id) {
      <div 
       (click)="openServiceModal(s)"
       class="group cursor-pointer rounded-2xl bg-[#0c0e11] border border-obsidian-750 overflow-hidden hover:border-obsidian-600 transition-all duration-300 shadow-xl flex flex-col"
      >
       <div class="relative aspect-video w-full overflow-hidden bg-obsidian-950">
        <img 
         [src]="'photos/services/' + s.id + '.png'" 
         [alt]="s.name"
         class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0c0e11] via-transparent to-transparent opacity-80"></div>
        <span class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-obsidian-900/90 border border-obsidian-700 text-slate-300 shadow">
         {{ s.category.toUpperCase() }}
        </span>
       </div>

       <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
         <span class="text-[10px] font-sans text-slate-400">{{ s.node }}</span>
         <h4 class="text-base font-bold text-slate-100 group-hover:text-slate-100 transition-colors mt-0.5">
          {{ s.name }}
         </h4>
         <p class="text-xs text-slate-300 font-sans mt-1.5 line-clamp-2 leading-relaxed">
          {{ s.description }}
         </p>
        </div>
        <div class="pt-2 border-t border-obsidian-800 flex items-center justify-between font-sans text-[11px] text-slate-400">
         <span>{{ s.ip }}:{{ s.port }}</span>
         <span class="text-slate-300 group-hover:translate-x-1 transition-transform">Zoom ↗</span>
        </div>
       </div>
      </div>
     }
    </div>
   }

   <!-- Lightbox Zoom Modal -->
   @if (selectedPhoto(); as p) {
    <div 
     (click)="selectedPhoto.set(null)"
     class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
     <div 
      (click)="$event.stopPropagation()"
      class="max-w-6xl w-full bg-obsidian-900 border border-obsidian-750 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
     >
      <!-- Modal Header -->
      <div class="p-4 sm:p-5 border-b border-obsidian-750 flex items-center justify-between bg-obsidian-950 font-sans">
       <div>
        <span class="text-[10px] font-sans text-slate-300 uppercase tracking-wider">{{ ts.isRomanian ? p.categoryRo : p.category }}</span>
        <h3 class="text-lg font-bold text-slate-100">{{ ts.isRomanian ? p.titleRo : p.title }}</h3>
       </div>
       <button 
        (click)="selectedPhoto.set(null)"
        class="w-8 h-8 rounded-full bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 flex items-center justify-center text-sm font-sans transition-colors"
        aria-label="Close"
       >&times;</button>
      </div>

      <!-- Modal Image -->
      <div class="flex-1 overflow-auto p-2 bg-black flex items-center justify-center">
       <img [src]="p.src" [alt]="ts.isRomanian ? p.titleRo : p.title" class="max-w-full max-h-[70vh] object-contain rounded-lg" />
      </div>

      <!-- Modal Footer -->
      <div class="p-4 sm:p-5 border-t border-obsidian-750 bg-obsidian-950 font-sans text-xs text-slate-300 flex flex-col sm:flex-row justify-between gap-3">
       <p class="leading-relaxed max-w-3xl">{{ ts.isRomanian ? p.descriptionRo : p.description }}</p>
       <div class="font-sans text-slate-300 self-start sm:self-auto flex items-center gap-2">
        <span>{{ p.endpoint }}</span>
        <span class="px-2 py-0.5 rounded bg-obsidian-800 border border-obsidian-700 text-[10px]">{{ ts.isRomanian ? p.badgeRo : p.badge }}</span>
       </div>
      </div>
     </div>
    </div>
   }

  </section>
 `
})
export class AboutGalleryComponent {
 ts = inject(TranslationService);
 galleryTab = signal<'core' | 'all'>('core');
 selectedPhoto = signal<PhotoItem | null>(null);
 allServices = SERVICES_DATA;

 photos: PhotoItem[] = [
  {
   src: 'photos/grafana_nodes_dashboard.png',
   title: 'Grafana · Multi-Architecture Nodes (12GB x86_64 & ARM64)',
   titleRo: 'Grafana · Noduri Multi-Arhitectură (12GB x86_64 & ARM64)',
   category: 'OBSERVABILITY & METRICS',
   categoryRo: 'OBSERVABILITATE & METRICI',
   description: 'Unified Grafana Enterprise dashboard tracking Proxmox VE hypervisors (Intel i3-10100F with 12GB DDR4-2133 and Apple Silicon M1), 8-thread CPU timeline, ZRAM compression (6.0GB), and container telemetry.',
   descriptionRo: 'Dashboard unificat Grafana Enterprise ce monitorizează hypervisorii Proxmox VE (Intel i3-10100F cu 12GB DDR4-2133 și Apple Silicon M1), cronologie CPU 8 fire, compresie ZRAM (6.0GB) și telemetrie containere.',
   endpoint: '192.168.1.132:3000',
   badge: 'GRAFANA LIVE',
   badgeRo: 'GRAFANA LIVE'
  },
  {
   src: 'photos/grafana_opnsense_dashboard.png',
   title: 'Grafana · OPNsense Perimeter Firewall & Threat Intel',
   titleRo: 'Grafana · Firewall Perimetral OPNsense & Threat Intel',
   category: 'OBSERVABILITY & SECURITY',
   categoryRo: 'OBSERVABILITATE & SECURITATE',
   description: 'Real-time security telemetry: Suricata 8.0 NIDS/IPS engine status, CrowdSec LAPI bouncer packet filter drops, Unbound DNS-over-TLS Quad9 resolver, and WAN/Inter-VLAN throughput.',
   descriptionRo: 'Telemetrie de securitate în timp real: status motor NIDS/IPS Suricata 8.0, blocări packet filter prin bouncerul CrowdSec LAPI, resolver Unbound DNS-over-TLS Quad9 și debit WAN/Inter-VLAN.',
   endpoint: '192.168.1.132:3000',
   badge: 'SECURITY LIVE',
   badgeRo: 'SECURITATE LIVE'
  },
  {
   src: 'photos/proxmox_ve_dashboard.png',
   title: 'Proxmox VE 9.2.10 · Primary x86_64 Hypervisor (12GB RAM)',
   titleRo: 'Proxmox VE 9.2.10 · Hypervisor Primar x86_64 (12GB RAM)',
   category: 'VIRTUALIZATION & HYPERVISOR',
   categoryRo: 'VIRTUALIZARE & HYPERVISOR',
   description: 'Native Proxmox VE Node Summary on Node 1 (Intel i3-10100F, 12GB DDR4-2133, 512GB SSD), managing KVM virtual machines (VM 200-209) and active LXC containers.',
   descriptionRo: 'Panoul nativ Proxmox VE Node Summary pe Nodul 1 (Intel i3-10100F, 12GB DDR4-2133, 512GB SSD), administrând mașinile virtuale KVM (VM 200-209) și containerele LXC active.',
   endpoint: '192.168.1.132:8006',
   badge: 'PVE 12GB RAM',
   badgeRo: 'PVE 12GB RAM'
  },
  {
    src: 'photos/services/vm-windows.png',
    title: 'Windows Server 2022 · Active Directory Forest Root PDC (VM 400)',
    titleRo: 'Windows Server 2022 · PDC Rădăcină Pădure Active Directory (VM 400)',
    category: 'ACTIVE DIRECTORY & ENTERPRISE IDENTITY',
    categoryRo: 'ACTIVE DIRECTORY & IDENTITATE ENTERPRISE',
    description: 'Active Directory Domain Services Forest Root PDC on Windows Server 2022 Datacenter with FSMO roles, Kerberos KDC, and integrated DNS (4096 MB RAM).',
    descriptionRo: 'PDC rădăcină de pădure Active Directory Domain Services pe Windows Server 2022 Datacenter cu roluri FSMO, Kerberos KDC și DNS integrat (4096 MB RAM).',
    endpoint: '192.168.1.222 (RDP 3389 / Kerberos 88)',
    badge: 'AD: WIN SERVER 2022',
    badgeRo: 'AD: WIN SERVER 2022'
  },
  {
    src: 'photos/services/vm-rhel.png',
    title: 'Red Hat Enterprise Linux 9 · SSSD Active Directory Member (VM 405)',
    titleRo: 'Red Hat Enterprise Linux 9 · Membru Active Directory SSSD (VM 405)',
    category: 'ENTERPRISE LINUX & REALMD',
    categoryRo: 'LINUX ENTERPRISE & REALMD',
    description: 'RHEL 9.4 enterprise Linux server joined to the Active Directory realm via SSSD and Kerberos for centralized domain user authentication and PAM integration.',
    descriptionRo: 'Server enterprise RHEL 9.4 integrat în domeniul Active Directory prin SSSD și Kerberos pentru autentificarea centralizată a utilizatorilor de domeniu.',
    endpoint: '192.168.1.228 (SSH 22 / SSSD PAM)',
    badge: 'RHEL 9 SSSD',
    badgeRo: 'RHEL 9 SSSD'
  },
  {
    src: 'photos/services/wazuh.png',
    title: 'Wazuh 4.14 · Enterprise SIEM, OpenSearch & XDR (CT 106)',
    titleRo: 'Wazuh 4.14 · Platformă Enterprise SIEM, OpenSearch & XDR (CT 106)',
    category: 'CYBERSECURITY & SIEM PLATFORM',
    categoryRo: 'SECURITATE CIBERNETICĂ & PLATFORMĂ SIEM',
    description: 'Wazuh Manager, Indexer (OpenSearch 2.19 with 4GB JVM Heap), and Dashboard deployed in dedicated LXC 106 on Proxmox VE (6GB RAM) analyzing real-time security events and FIM.',
    descriptionRo: 'Wazuh Manager, Indexer (OpenSearch 2.19 cu Heap JVM 4GB) și Dashboard implementate în containerul LXC 106 pe Proxmox VE (6GB RAM) pentru analiză în timp real.',
    endpoint: '192.168.1.240:443 / 1514 (Wazuh Web & Agent Listener)',
    badge: 'WAZUH SIEM (CT 106)',
    badgeRo: 'WAZUH SIEM (CT 106)'
  },
  {
    src: 'photos/services/openstack.png',
    title: 'OpenStack Dev Sandbox · Kolla-Ansible Cloud (VM 201)',
    titleRo: 'OpenStack Dev Sandbox · Cloud Kolla-Ansible (VM 201)',
    category: 'CLOUD INFRASTRUCTURE & SDN',
    categoryRo: 'INFRASTRUCTURĂ CLOUD & SDN',
    description: 'Single-node OpenStack controller deployed via Kolla-Ansible for SDN Neutron testing and virtual machine orchestration under Proxmox VE.',
    descriptionRo: 'Controller OpenStack single-node implementat prin Kolla-Ansible pentru testarea rețelelor software (SDN Neutron) și orchestrare de mașini virtuale.',
    endpoint: '192.168.1.136:80 (Horizon Dashboard)',
    badge: 'OPENSTACK CLOUD',
    badgeRo: 'OPENSTACK CLOUD'
  },
  {
    src: 'photos/services/metasploitable2.png',
    title: 'Metasploitable 2 · Vulnerable Exploit Target (VM 301)',
    titleRo: 'Metasploitable 2 · Țintă Vulnerabilă pentru Exploatare (VM 301)',
    category: 'CYBERSECURITY & PROVING GROUND',
    categoryRo: 'SECURITATE CIBERNETICĂ & POLIGON DE TEST',
    description: 'Intentionally vulnerable Linux test environment in isolated VLAN 30 for offensive exploit validation, payload crafting, and IDS signature tuning.',
    descriptionRo: 'Mediu Linux deliberat vulnerabil în VLAN 30 izolat pentru validarea exploatărilor ofensive și calibrarea semnăturilor IDS.',
    endpoint: '192.168.30.10 (VLAN 30 Isolated Target)',
    badge: 'METASPLOITABLE (VM 301)',
    badgeRo: 'METASPLOITABLE (VM 301)'
  },
  {
    src: 'photos/services/dfir-sandbox.png',
    title: 'Windows Malware Sandbox · Flare-VM Detonation (VM 303)',
    titleRo: 'Windows Malware Sandbox · Detonare Malware Flare-VM (VM 303)',
    category: 'CYBERSECURITY & MALWARE LAB',
    categoryRo: 'SECURITATE CIBERNETICĂ & LAB MALWARE',
    description: 'Isolated Windows 10 dynamic analysis sandbox equipped with Mandiant Flare-VM, Procmon, x64dbg, and Wireshark for behavioral malware detonation in VLAN 30.',
    descriptionRo: 'Sandbox izolat Windows 10 pentru analiză dinamică de malware, dotat cu suita Flare-VM, Procmon, x64dbg și Wireshark pentru detonare comportamentală în VLAN 30.',
    endpoint: '192.168.30.20 (VLAN 30 Isolated Sandbox)',
    badge: 'FLARE-VM SANDBOX',
    badgeRo: 'FLARE-VM SANDBOX'
  },
  {
    src: 'photos/services/remnux.png',
    title: 'REMnux · Digital Forensics & Reverse Engineering (VM 304)',
    titleRo: 'REMnux · Criminalistică Digitală & Inginerie Inversă (VM 304)',
    category: 'DIGITAL FORENSICS & REVERSE ENGINEERING',
    categoryRo: 'CRIMINALISTICĂ DIGITALĂ & INGINERIE INVERSĂ',
    description: 'Specialized Linux distribution for static binary analysis, document deobfuscation, Ghidra reverse engineering, and memory triage in VLAN 30.',
    descriptionRo: 'Distribuție Linux specializată de inginerie inversă pentru analiza statică a binarilor, deobfuscarea documentelor și triajul probelor în VLAN 30.',
    endpoint: '192.168.30.30 (VLAN 30 Reverse Engineering)',
    badge: 'REMNUX (VM 304)',
    badgeRo: 'REMNUX (VM 304)'
  },
  {
   src: 'photos/services/opnsense.png',
   title: 'OPNsense 26.1 Hardened · Core Firewall Console (VM 200)',
   titleRo: 'OPNsense 26.1 Hardened · Consolă Firewall Central (VM 200)',
   category: 'FIREWALL & CORE GATEWAY',
   categoryRo: 'FIREWALL & GATEWAY CENTRAL',
   description: 'Live text console of OPNsense FreeBSD perimeter firewall managing WAN DHCP (192.168.1.134), inter-VLAN routing, and hardware interface bindings.',
   descriptionRo: 'Consola text în timp real a firewall-ului perimetral OPNsense FreeBSD ce gestionează WAN DHCP (192.168.1.134), rutarea inter-VLAN și legăturile hardware de rețea.',
   endpoint: '192.168.1.134:8443 (Console / Web)',
   badge: 'OPNSENSE CORE',
   badgeRo: 'OPNSENSE CORE'
  },
  {
   src: 'photos/pihole_admin_dashboard.png',
   title: 'Pi-hole · DNS Sinkhole & Network Ad-Blocking',
   titleRo: 'Pi-hole · Filtrare DNS & Blocare Reclame la Nivel de Rețea',
   category: 'DNS & NETWORK PRIVACY',
   categoryRo: 'DNS & CONFIDENȚIALITATE REȚEA',
   description: 'Network-wide DNS filter blocking telemetry and malware domains with FTL engine, tracking query statistics, client activity, and 89,947 gravity blocked domains.',
   descriptionRo: 'Filtru DNS la nivelul întregii rețele ce blochează domeniile de telemetrie și malware cu motorul FTL, urmărind statisticile interogărilor și 89.947 domenii blocate în gravity.',
   endpoint: '192.168.1.4:8080',
   badge: 'PI-HOLE DNS',
   badgeRo: 'PI-HOLE DNS'
  },
  {
   src: 'photos/homeassistant_dashboard.png',
   title: 'Home Assistant · IoT Automation & Control Hub',
   titleRo: 'Home Assistant · Hub de Automatizare & Control IoT',
   category: 'HOME AUTOMATION & IOT',
   categoryRo: 'AUTOMATIZARE LOCUINȚĂ & IOT',
   description: 'Centralized home automation and smart IoT controller running in containerized environment on Node 1 with Lovelace user interface and multi-room management.',
   descriptionRo: 'Controler centralizat de automatizare și IoT inteligent rulat în mediu containerizat pe Nodul 1 cu interfață Lovelace și administrare multi-cameră.',
   endpoint: '192.168.1.10:8123',
   badge: 'HOME ASSISTANT',
   badgeRo: 'HOME ASSISTANT'
  },
  {
   src: 'photos/opnsense_vlan_segmentation.png',
   title: 'OPNsense · 802.1Q VLAN Micro-Segmentation',
   titleRo: 'OPNsense · Micro-Segmentare VLAN 802.1Q',
   category: 'ZERO-TRUST NETWORKING & VLANS',
   categoryRo: 'REȚELE ZERO-TRUST & VLANS',
   description: 'Interfaces: Other Types: VLAN overview configuring 5 isolated 802.1Q subnets (Management 10, Services 20, CyberLab 30, DMZ 40, IoT 50) with default-deny pf packet filtering.',
   descriptionRo: 'Panoul Interfaces: Other Types: VLAN ce configurează 5 subrețele izolate 802.1Q (Management 10, Servicii 20, CyberLab 30, DMZ 40, IoT 50) cu filtrare implicită default-deny.',
   endpoint: '192.168.1.134:8443',
   badge: '802.1Q VLANS',
   badgeRo: '802.1Q VLANS'
  },
  {
   src: 'photos/opnsense_suricata_defense.png',
   title: 'OPNsense · Suricata 8.0 NIDS/IPS Engine',
   titleRo: 'OPNsense · Motor NIDS/IPS Suricata 8.0',
   category: 'CYBERSECURITY & THREAT DETECTION',
   categoryRo: 'SECURITATE CIBERNETICĂ & DETECȚIE AMENINȚĂRI',
   description: 'Suricata Intrusion Detection System running in promiscuous PCAP live mode across WAN and VLAN interfaces with ET Open rules active.',
   descriptionRo: 'Sistemul de detecție a intruziunilor Suricata rulând în mod promiscuu PCAP live pe interfețele WAN și VLAN cu setul de reguli ET Open activ.',
   endpoint: '192.168.1.134:8443',
   badge: 'SURICATA IDS',
   badgeRo: 'SURICATA IDS'
  },
  {
   src: 'photos/opnsense_firewall_rules.png',
   title: 'OPNsense · VLAN Micro-Segmentation Policies (pf)',
   titleRo: 'OPNsense · Politici Micro-Segmentare VLAN (pf)',
   category: 'NETWORK SECURITY',
   categoryRo: 'SECURITATE DE REȚEA',
   description: 'Strict packet filter (pf) rules enforcing zero-trust isolation between VLAN 10 (Management), 20 (Services), 30 (CyberLab), 40 (DMZ), and 50 (IoT).',
   descriptionRo: 'Reguli stricte de packet filter (pf) ce impun izolarea zero-trust între VLAN 10 (Management), 20 (Servicii), 30 (CyberLab), 40 (DMZ) și 50 (IoT).',
   endpoint: '192.168.1.134:8443',
   badge: 'PF RULES',
   badgeRo: 'REGULI PF'
  },
  {
   src: 'photos/opnsense_wireguard_vpn.png',
   title: 'OPNsense · WireGuard Kernel VPN Mesh',
   titleRo: 'OPNsense · Tunel Criptografic WireGuard Kernel Mesh',
   category: 'ZERO-TRUST NETWORKING',
   categoryRo: 'REȚELE ZERO-TRUST',
   description: 'High-speed in-kernel WireGuard cryptographic tunnel providing remote zero-trust access into the homelab private subnet.',
   descriptionRo: 'Tunel criptografic de mare viteză direct în kernelul FreeBSD WireGuard ce oferă acces securizat zero-trust în subrețeaua privată a homelab-ului.',
   endpoint: '192.168.1.134:8443',
   badge: 'WIREGUARD VPN',
   badgeRo: 'WIREGUARD VPN'
  },
  {
   src: 'photos/opnsense_unbound_dns.png',
   title: 'OPNsense · Unbound DNS-over-TLS (DoT)',
   titleRo: 'OPNsense · Unbound DNS-over-TLS (DoT)',
   category: 'PRIVACY & DNSSEC',
   categoryRo: 'CONFIDENȚIALITATE & DNSSEC',
   description: 'Encrypted recursive DNS resolver forwarding port 853 queries to Quad9 and Cloudflare with strict DNSSEC validation.',
   descriptionRo: 'Resolver DNS recursiv criptat ce redirecționează interogările pe portul 853 către Quad9 și Cloudflare cu validare strictă DNSSEC.',
   endpoint: '192.168.1.134:8443',
   badge: 'DOT QUAD9',
   badgeRo: 'DOT QUAD9'
  }
 ];

 openServiceModal(s: ServiceItem) {
  this.selectedPhoto.set({
   src: 'photos/services/' + s.id + '.png',
   title: s.name,
   titleRo: s.name,
   category: s.category.toUpperCase() + ' · ' + s.node,
   categoryRo: s.category.toUpperCase() + ' · ' + s.node,
   description: s.description,
   descriptionRo: s.description,
   endpoint: s.ip + ':' + s.port + ' | ' + s.domain,
   badge: s.status,
   badgeRo: s.status
  });
 }
}
