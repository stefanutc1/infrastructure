import { Component, HostListener, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SERVICES_DATA, ServiceItem } from '../../data/services.data';
import { HARDWARE_NODES, HardwareNode } from '../../data/hardware.data';
import { TOPOLOGY_NODES, TopologyNode } from '../../data/topology.data';
import { TranslationService } from '../../services/translation.service';

interface SearchResultItem {
  id: string;
  title: string;
  category: string;
  subtext: string;
  type: 'service' | 'hardware' | 'vlan' | 'command' | 'doc';
  actionData?: any;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fadeIn" (click)="close()">
        
        <div class="w-full max-w-2xl bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[80vh]" (click)="$event.stopPropagation()">
          
          <!-- Search Header -->
          <div class="p-4 border-b border-obsidian-750 flex items-center gap-3 bg-obsidian-950">
            <span class="text-slate-300 font-sans text-base">⌘</span>
            <input
              #searchInput
              type="text"
              [value]="query"
              (input)="onInput($event)"
              [placeholder]="ts.isRomanian ? 'Caută servicii, noduri, porturi, comenzi CLI (ex: ollama, zfs, vlan, npm)...' : 'Search services, nodes, ports, CLI commands (e.g. ollama, zfs, vlan, npm)...'"
              class="w-full bg-transparent text-slate-100 placeholder:text-slate-500 font-sans text-sm outline-none"
            />
            <button (click)="close()" class="text-xs font-sans text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-obsidian-800 border border-obsidian-700">ESC</button>
          </div>

          <!-- Quick Filters -->
          <div class="flex items-center gap-1.5 px-4 py-2 bg-obsidian-950/60 border-b border-obsidian-750 text-xs font-sans overflow-x-auto no-scrollbar">
            <button (click)="activeFilter = 'all'" [class.text-slate-300]="activeFilter === 'all'" [class.bg-slate-400/10]="activeFilter === 'all'" class="px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors">{{ ts.isRomanian ? "Toate" : "All" }}</button>
            <button (click)="activeFilter = 'service'" [class.text-slate-300]="activeFilter === 'service'" [class.bg-slate-400/10]="activeFilter === 'service'" class="px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors">{{ ts.isRomanian ? "Servicii" : "Services" }} ({{ services.length }})</button>
            <button (click)="activeFilter = 'hardware'" [class.text-slate-300]="activeFilter === 'hardware'" [class.bg-slate-400/10]="activeFilter === 'hardware'" class="px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors">Hardware ({{ hardware.length }})</button>
            <button (click)="activeFilter = 'command'" [class.text-slate-300]="activeFilter === 'command'" [class.bg-slate-400/10]="activeFilter === 'command'" class="px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors">{{ ts.isRomanian ? "Comenzi CLI" : "CLI Commands" }}</button>
          </div>

          <!-- Results List -->
          <div class="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-sans max-h-[55vh]">
            @if (filteredResults.length === 0) {
              <div class="p-8 text-center text-slate-400 font-sans text-xs">
                {{ ts.isRomanian ? 'Niciun rezultat găsit pentru: ' : 'No results found for: ' }} <span class="text-slate-300 font-sans">"{{ query }}"</span>
              </div>
            }

            @for (item of filteredResults; track item.id) {
              <div
                (click)="onSelect(item)"
                class="flex items-center justify-between p-3 rounded-xl hover:bg-obsidian-800/80 border border-transparent hover:border-obsidian-700 transition-all cursor-pointer group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-7 h-7 rounded-lg bg-obsidian-950 border border-obsidian-750 flex items-center justify-center font-sans font-bold text-[10px] text-slate-300">
                    {{ item.type === 'service' ? 'SRV' : item.type === 'hardware' ? 'HW' : item.type === 'command' ? 'CLI' : 'DOC' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-100 group-hover:text-slate-300 transition-colors text-xs flex items-center gap-2">
                      <span>{{ item.title }}</span>
                      <span class="text-[10px] font-sans text-slate-400 font-normal px-1.5 py-0.2 rounded bg-obsidian-950 border border-obsidian-750">{{ item.category }}</span>
                    </div>
                    <div class="text-[11px] text-slate-400 font-sans mt-0.5 truncate max-w-md">
                      {{ item.subtext }}
                    </div>
                  </div>
                </div>

                <div class="text-right font-sans text-[11px] text-slate-500 group-hover:text-slate-300 flex items-center gap-1">
                  <span>{{ ts.isRomanian ? 'Accesează' : 'Jump' }}</span>
                  <span>→</span>
                </div>
              </div>
            }
          </div>

          <!-- Palette Footer -->
          <div class="p-3 bg-obsidian-950 border-t border-obsidian-750 text-[11px] font-sans text-slate-400 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span><kbd class="px-1.5 py-0.5 rounded bg-obsidian-850 border border-obsidian-700 text-slate-300">↑↓</kbd> {{ ts.isRomanian ? "Navighează" : "Navigate" }}</span>
              <span><kbd class="px-1.5 py-0.5 rounded bg-obsidian-850 border border-obsidian-700 text-slate-300">↵</kbd> {{ ts.isRomanian ? "Selectează" : "Select" }}</span>
            </div>
            <span class="text-slate-300">{{ ts.isRomanian ? "Infrastructure // Căutare Rapidă (⌘K)" : "Infrastructure // Quick Search (⌘K)" }}</span>
          </div>

        </div>

      </div>
    }
  `
})
export class CommandPaletteComponent {
  @Output() nodeFocused = new EventEmitter<TopologyNode>();

  ts = inject(TranslationService);
  isOpen = false;
  query = '';
  activeFilter: 'all' | 'service' | 'hardware' | 'command' = 'all';

  services: ServiceItem[] = SERVICES_DATA;
  hardware: HardwareNode[] = HARDWARE_NODES;

  cliCommands = [
    { id: 'cmd-ollama', title: 'Ollama Inference Test', category: 'CLI / AI', subtext: 'curl -s http://192.168.1.110:11434/api/tags', type: 'command' as const },
    { id: 'cmd-zfs', title: 'ZFS Pool Status Check', category: 'CLI / Storage', subtext: 'zpool status -v && zfs list -o space', type: 'command' as const },
    { id: 'cmd-pct', title: 'Proxmox Container List', category: 'CLI / Proxmox', subtext: 'pct list && qm list', type: 'command' as const },
    { id: 'cmd-dr', title: 'Disaster Recovery vzdump Runner', category: 'CLI / DR', subtext: './scripts/disaster-recovery/dr_vzdump_restore.sh proxmox', type: 'command' as const },
    { id: 'cmd-chaos', title: 'Chaos 100% CPU Stress Runner', category: 'CLI / Chaos', subtext: './scripts/chaos/chaos_runner.sh cpu-stress 60', type: 'command' as const },
    { id: 'cmd-trivy', title: 'Trivy IaC & Container Security Scan', category: 'CLI / DevSecOps', subtext: 'trivy config ./terraform && trivy fs .', type: 'command' as const },
    { id: 'cmd-fw-verify', title: 'Enterprise Dual-Tier Firewall & Forensics Verification', category: 'CLI / Cyber', subtext: './scripts/verify-enterprise-firewall.sh', type: 'command' as const }
  ];

  forensicCases: SearchResultItem[] = [
    {
      id: 'case-steam',
      title: 'DFIR Case: Steam OpenID 2.0 AiTM & Browser-in-the-Middle',
      category: 'Cyber Forensics · TLP:CLEAR',
      subtext: 'SEC-2025-BITM-003 · In-DOM fake window, credential harvesting & trade bot hijacking',
      type: 'command',
      actionData: { hash: '#cyber', caseSlug: 'openid' }
    },
    {
      id: 'case-task',
      title: 'DFIR Case: Pig Butchering Task Scam & USDT TRC-20 Drainage',
      category: 'Cyber Forensics · TLP:CLEAR',
      subtext: 'SEC-2026-TASK-001 · Decompiled scam web app, kill-switches & C2 infrastructure',
      type: 'command',
      actionData: { hash: '#cyber', caseSlug: 'task-scam' }
    },
    {
      id: 'case-revolut',
      title: 'DFIR Case: FinTech Voice Phishing (Vishing) & Real-Time Relay',
      category: 'Cyber Forensics · TLP:CLEAR',
      subtext: 'SEC-2026-VISH-002 · Real-time reverse proxy, Caller ID spoofing & bank API relay',
      type: 'command',
      actionData: { hash: '#cyber', caseSlug: 'revolut' }
    },
    {
      id: 'case-mrr',
      title: 'DFIR Case: TikTok Algorithmic Funnels & Recursive MRR Schemes',
      category: 'Cyber Forensics · TLP:CLEAR',
      subtext: 'SEC-2025-MRR-001 · 19-stage investigation, synthetic LLM courses & payment gateway abuse',
      type: 'command',
      actionData: { hash: '#cyber', caseSlug: 'tiktok' }
    }
  ];

  cveCases: SearchResultItem[] = [
    {
      id: 'cve-pve-auth',
      title: 'CVE Assessment: CVE-2023-54391 (Proxmox VE Auth Bypass)',
      category: 'Cyber Threat Intel · CVSS 9.8',
      subtext: 'Proxmox VE libpve-access-control Authentication Bypass to root@pam via tfa-challenge parameter',
      type: 'command',
      actionData: { hash: '#cve-pve-auth' }
    },
    {
      id: 'cve-pve-xss',
      title: 'CVE Assessment: CVE-2025-57539 (Proxmox VE Stored XSS)',
      category: 'Cyber Threat Intel · CVSS 5.4',
      subtext: 'Proxmox VE Datacenter Configuration Stored XSS in U2F Origin field leading to root privilege escalation',
      type: 'command',
      actionData: { hash: '#cve-pve-xss' }
    },
    {
      id: 'cve-hyperv',
      title: 'CVE Assessment: CVE-2026-69603 & CVE-2026-80083',
      category: 'Cyber Threat Intel · CVSS 8.8',
      subtext: 'Windows Hyper-V Guest-to-Host Virtual Machine Escape via synthetic device shared memory',
      type: 'command',
      actionData: { hash: '#cve-hyperv' }
    },
    {
      id: 'cve-dns',
      title: 'CVE Assessment: CVE-2026-69730',
      category: 'Cyber Threat Intel · CVSS 9.8',
      subtext: 'Windows DNS Server Critical Remote Code Execution (RCE) via malformed response',
      type: 'command',
      actionData: { hash: '#cve-dns' }
    },
    {
      id: 'cve-dhcp',
      title: 'CVE Assessment: CVE-2026-69845 & CVE-2026-72979',
      category: 'Cyber Threat Intel · CVSS 9.8',
      subtext: 'Windows DHCP Server Heap Overflow & Use-After-Free RCE via malformed vendor options',
      type: 'command',
      actionData: { hash: '#cve-dhcp' }
    }
  ];

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggle();
    } else if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.query = '';
    }
  }

  open() {
    this.isOpen = true;
    this.query = '';
  }

  close() {
    this.isOpen = false;
  }

  onInput(e: Event) {
    this.query = (e.target as HTMLInputElement).value;
  }

  get filteredResults(): SearchResultItem[] {
    const q = this.query.toLowerCase().trim();
    let results: SearchResultItem[] = [];

    // Add Services
    if (this.activeFilter === 'all' || this.activeFilter === 'service') {
      for (const s of this.services) {
        results.push({
          id: 'srv-' + s.id,
          title: s.name,
          category: `Service · ${s.category.toUpperCase()}`,
          subtext: `${s.node} · ${s.domain} · Port :${s.port || 'N/A'} · RAM: ${s.ram}`,
          type: 'service',
          actionData: s
        });
      }
    }

    // Add Hardware
    if (this.activeFilter === 'all' || this.activeFilter === 'hardware') {
      for (const h of this.hardware) {
        results.push({
          id: 'hw-' + h.id,
          title: h.name,
          category: `Hardware · ${h.machine}`,
          subtext: `${h.cpu} · ${h.ram} · ${h.storage} · IP: ${h.ip}`,
          type: 'hardware',
          actionData: h
        });
      }
    }

    // Add CLI Commands
    if (this.activeFilter === 'all' || this.activeFilter === 'command') {
      for (const c of this.cliCommands) {
        results.push({
          id: c.id,
          title: c.title,
          category: c.category,
          subtext: c.subtext,
          type: 'command',
          actionData: c
        });
      }
      // Add Forensic Investigation Cases
      results.push(...this.forensicCases);
      // Add Windows CVE Threat Intelligence Assessments
      results.push(...this.cveCases);
    }

    if (!q) return results.slice(0, 12);

    return results.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.subtext.toLowerCase().includes(q)
    );
  }

  onSelect(item: SearchResultItem) {
    this.close();

    if (item.id.startsWith('cve-')) {
      const data = item.actionData as { hash: string };
      window.location.hash = data.hash;
      const el = document.getElementById('cyber') || document.getElementById('blueprint');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    } else if (item.id.startsWith('case-')) {
      const data = item.actionData as { hash: string; caseSlug: string };
      window.location.hash = `#case-${data.caseSlug}`;
      const el = document.getElementById('cyber') || document.getElementById('blueprint');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    } else if (item.type === 'service') {
      const srv = item.actionData as ServiceItem;
      const found = TOPOLOGY_NODES.find(n => n.id === srv.id || n.name.toLowerCase().includes(srv.name.toLowerCase()));
      if (found) {
        this.nodeFocused.emit(found);
      }
      const el = document.getElementById('services');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (item.type === 'hardware') {
      const hw = item.actionData as HardwareNode;
      const found = TOPOLOGY_NODES.find(n => n.id === hw.id);
      if (found) {
        this.nodeFocused.emit(found);
      }
      const el = document.getElementById('hardware');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (item.type === 'command') {
      navigator.clipboard.writeText(item.subtext);
      const el = document.getElementById('blueprint');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
