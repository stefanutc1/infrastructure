import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { NETWORK_VLANS_DATA, NetworkVLAN } from '../../data/infrastructure.data';

@Component({
  selector: 'app-network-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="network" class="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      <!-- Section Header -->
      <div class="space-y-3 mb-10">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span class="text-xs font-sans font-bold tracking-widest text-cyan-400 uppercase">
            NETWORK ARCHITECTURE & SEGMENTATION
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            OPNSENSE 24.7 · LINUX BRIDGES
          </span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-slate-50 tracking-tight">
          VLAN Isolation, Bridge Topologies & DNS Sinkholing
        </h2>
        <p class="text-sm sm:text-base text-slate-300 max-w-4xl font-sans font-normal leading-relaxed">
          Zero-trust packet segregation enforced across Linux bridges (<code class="text-slate-100">vmbr0</code>,
          <code class="text-slate-100">vmbr1</code>, <code class="text-slate-100">vmbr2</code>) and 5 distinct 802.1Q VLAN segments.
          Malicious traffic is sinkholed to <code class="text-cyan-400">0.0.0.0</code> via Unbound DNS, while the isolated malware sandbox operates under a strict air-gap policy.
        </p>
      </div>

      <!-- Linux Bridges Architecture -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3 hover:border-slate-500/50 transition-all shadow-xl">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              vmbr0
            </span>
            <span class="text-[11px] font-mono text-slate-400">Uplink Demarcation</span>
          </div>
          <h3 class="text-base font-serif font-medium text-slate-100">
            Physical WAN Ingress Bridge
          </h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Directly bridges the physical Realtek/Intel NIC to the ISP fiber optic ONT. Exclusively terminates WAN traffic into OPNsense (VM 200) without exposing the host OS directly to the internet.
          </p>
          <div class="pt-2 border-t border-obsidian-750/70 font-mono text-[11px] text-slate-400 flex justify-between">
            <span>Uplink: 1 Gbps Fiber</span>
            <span class="text-slate-300">LAN: 192.168.1.0/24</span>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3 hover:border-slate-500/50 transition-all shadow-xl">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
              vmbr1
            </span>
            <span class="text-[11px] font-mono text-slate-400">Tagged 802.1Q Trunk</span>
          </div>
          <h3 class="text-base font-serif font-medium text-slate-100">
            Internal Production Services Trunk
          </h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Multi-VLAN trunk connecting virtual machines and LXCs to OPNsense. Carries tagged frames for VLAN 10 (Management), VLAN 20 (Services & Banking Core), and VLAN 40 (Active Directory).
          </p>
          <div class="pt-2 border-t border-obsidian-750/70 font-mono text-[11px] text-slate-400 flex justify-between">
            <span>VLANs: 10, 20, 40, 50</span>
            <span class="text-slate-300">Inter-VLAN Filtered</span>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3 hover:border-slate-500/50 transition-all shadow-xl">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
              vmbr2
            </span>
            <span class="text-[11px] font-mono text-slate-400">Air-Gapped Lab</span>
          </div>
          <h3 class="text-base font-serif font-medium text-slate-100">
            Isolated Cyber & Malware Detonation Bridge
          </h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Non-routed internal bridge for dynamic malware analysis (Flare-VM) and offensive security drills. Zero outbound internet routing; all external requests terminate in an isolated INetSim simulation.
          </p>
          <div class="pt-2 border-t border-obsidian-750/70 font-mono text-[11px] text-slate-400 flex justify-between">
            <span>VLAN: 30 Isolated</span>
            <span class="text-rose-400 font-semibold">Default-Deny WAN</span>
          </div>
        </div>

      </div>

      <!-- VLAN Matrix Table & Cards -->
      <div class="space-y-4">
        <h3 class="text-xl font-serif font-normal text-slate-100 flex items-center gap-2">
          <span>802.1Q VLAN Segmentation Matrix</span>
          <span class="text-xs font-mono font-normal text-slate-400">({{ vlans.length }} Isolated Segments)</span>
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          @for (vlan of vlans; track vlan.vlanId) {
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-4 hover:border-slate-500/60 transition-all shadow-xl">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2.5">
                  <span class="w-3 h-3 rounded-full" [style.backgroundColor]="vlan.color"></span>
                  <span class="font-mono text-sm font-bold text-slate-100">
                    VLAN {{ vlan.vlanId }} · {{ vlan.name }}
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono border"
                      [ngClass]="vlan.isolated ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'">
                  {{ vlan.isolated ? 'STRICT ISOLATION' : 'ROUTED SEGMENT' }}
                </span>
              </div>

              <p class="text-xs text-slate-300 leading-relaxed">
                {{ vlan.purpose }}
              </p>

              <div class="p-3 rounded-xl bg-obsidian-900 border border-obsidian-750 font-mono text-[11px] space-y-1.5">
                <div class="flex justify-between text-slate-400">
                  <span>Subnet CIDR:</span>
                  <span class="text-slate-200">{{ vlan.subnet }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Default Gateway:</span>
                  <span class="text-slate-200">{{ vlan.gateway }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Linux Bridge:</span>
                  <span class="text-slate-200">{{ vlan.bridge }}</span>
                </div>
              </div>

              <div class="space-y-1">
                <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Firewall Policy (OPNsense pf):
                </div>
                <p class="text-xs text-slate-300 leading-relaxed font-sans">
                  {{ vlan.firewallRules }}
                </p>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- DNS Sinkhole & WireGuard Mesh -->
      <div class="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              UNBOUND SINKHOLE
            </span>
            <span class="text-xs font-mono text-slate-400">0.0.0.0 / Null Route</span>
          </div>
          <h4 class="text-base font-serif font-medium text-slate-100">
            Automated Malicious DNS Null-Routing
          </h4>
          <p class="text-xs text-slate-300 leading-relaxed">
            OPNsense Unbound DNS service intercepts queries matching forensic IoCs (e.g. <code class="text-amber-300">voetbalshop-nlco[.]com</code> from case SEC-2026-ECOM-005). The server responds with <code class="text-amber-300">0.0.0.0</code>, instantaneously preventing client devices from establishing C2 communication.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              WIREGUARD MESH
            </span>
            <span class="text-xs font-mono text-slate-400">10.10.0.0/24 Subnet</span>
          </div>
          <h4 class="text-base font-serif font-medium text-slate-100">
            Encrypted Administrative Remote Ingress
          </h4>
          <p class="text-xs text-slate-300 leading-relaxed">
            High-speed ChaCha20-Poly1305 encrypted VPN terminating at OPNsense. Allows authenticated remote devices to securely administer the cluster and access the hardened jump-box VM 313 without exposing any services directly to the public internet.
          </p>
        </div>

      </div>

    </section>
  `
})
export class NetworkViewComponent {
  ts = inject(TranslationService);

  vlans: NetworkVLAN[] = NETWORK_VLANS_DATA;
}
