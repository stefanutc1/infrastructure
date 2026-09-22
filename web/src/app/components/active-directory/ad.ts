import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { AD_MEMBERS_DATA, ActiveDirectoryMember } from '../../data/infrastructure.data';

@Component({
  selector: 'app-active-directory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="ad" class="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      <!-- Section Header -->
      <div class="space-y-3 mb-10">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span class="text-xs font-sans font-bold tracking-widest text-blue-400 uppercase">
            ENTERPRISE IDENTITY & ACTIVE DIRECTORY LAB
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
            FOREST ROOT · AD.HOMELAB.LOCAL
          </span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-slate-50 tracking-tight">
          Multi-Generational Active Directory & Identity Security
        </h2>
        <p class="text-sm sm:text-base text-slate-300 max-w-4xl font-sans font-normal leading-relaxed">
          Comprehensive enterprise identity infrastructure spanning Windows Server 2022 (PDC), Windows Server 2016 (SDC),
          Windows Server 2012 R2 (AD CS CA), Windows 10/7 endpoints, and Red Hat Enterprise Linux 9 via SSSD/Kerberos.
          Real-time threat detection via SwiftOnSecurity Sysmon and Wazuh SIEM integration.
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2 font-sans border-b border-obsidian-750">
        <button
          (click)="activeTab = 'fleet'"
          [class.bg-slate-200]="activeTab === 'fleet'"
          [class.text-slate-950]="activeTab === 'fleet'"
          [class.font-semibold]="activeTab === 'fleet'"
          [class.text-slate-300]="activeTab !== 'fleet'"
          [class.bg-obsidian-900]="activeTab !== 'fleet'"
          class="px-4 py-2 rounded-xl text-xs font-medium border border-obsidian-750 transition-all whitespace-nowrap"
        >
          1. Domain Fleet & Workstations (VMs 400–407)
        </button>
        <button
          (click)="activeTab = 'topology'"
          [class.bg-slate-200]="activeTab === 'topology'"
          [class.text-slate-950]="activeTab === 'topology'"
          [class.font-semibold]="activeTab === 'topology'"
          [class.text-slate-300]="activeTab !== 'topology'"
          [class.bg-obsidian-900]="activeTab !== 'topology'"
          class="px-4 py-2 rounded-xl text-xs font-medium border border-obsidian-750 transition-all whitespace-nowrap"
        >
          2. Replication & Authentication Matrix
        </button>
        <button
          (click)="activeTab = 'detection'"
          [class.bg-slate-200]="activeTab === 'detection'"
          [class.text-slate-950]="activeTab === 'detection'"
          [class.font-semibold]="activeTab === 'detection'"
          [class.text-slate-300]="activeTab !== 'detection'"
          [class.bg-obsidian-900]="activeTab !== 'detection'"
          class="px-4 py-2 rounded-xl text-xs font-medium border border-obsidian-750 transition-all whitespace-nowrap"
        >
          3. Threat Detection Scenarios (Kerberos / Sysmon)
        </button>
      </div>

      <!-- TAB 1: FLEET MEMBERS -->
      @if (activeTab === 'fleet') {
        <div class="space-y-8">
          
          <!-- Filter / Status Bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-obsidian-850/80 border border-obsidian-750 text-xs">
            <div class="flex items-center gap-4">
              <span class="text-slate-400">Environment Status:</span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                ACTIVE RUNTIME (VMs 400–405)
              </span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30 font-mono text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                DECLARATIVE BLUEPRINT (VMs 406–407)
              </span>
            </div>
            <div class="text-slate-400 font-mono text-[11px]">
              Domain FQDN: ad.homelab.local · Kerberos Realm: AD.HOMELAB.LOCAL
            </div>
          </div>

          <!-- Member Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (member of adMembers; track member.vmid) {
              <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 flex flex-col justify-between hover:border-slate-500/50 transition-all shadow-xl group">
                <div class="space-y-4">
                  <!-- Header -->
                  <div class="flex items-start justify-between gap-2">
                    <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold tracking-wider border"
                          [ngClass]="member.status === 'ACTIVE_RUNTIME' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'">
                      {{ member.status === 'ACTIVE_RUNTIME' ? 'ACTIVE RUNTIME' : 'IAC BLUEPRINT' }}
                    </span>
                    <span class="font-mono text-xs text-slate-400 bg-obsidian-900 px-2 py-0.5 rounded border border-obsidian-750">
                      VM {{ member.vmid }} · {{ member.ramMb }} MB RAM
                    </span>
                  </div>

                  <!-- Hostname & Role -->
                  <div>
                    <h3 class="text-lg font-serif font-medium text-slate-100 group-hover:text-blue-300 transition-colors">
                      {{ member.hostname }}
                    </h3>
                    <p class="text-xs text-blue-400 font-medium mt-0.5">
                      {{ member.role }}
                    </p>
                  </div>

                  <!-- OS & IP -->
                  <div class="pt-2 border-t border-obsidian-750/70 space-y-1.5 font-mono text-[11px]">
                    <div class="flex items-center justify-between text-slate-400">
                      <span>IP Address:</span>
                      <span class="text-slate-200">{{ member.ip }}</span>
                    </div>
                    <div class="flex items-center justify-between text-slate-400">
                      <span>Operating System:</span>
                      <span class="text-slate-300 truncate max-w-[170px]">{{ member.os }}</span>
                    </div>
                    <div class="flex items-center justify-between text-slate-400">
                      <span>Detection Engine:</span>
                      <span class="text-slate-300 truncate max-w-[170px]">{{ member.detectionEngine }}</span>
                    </div>
                  </div>

                  <!-- Audit Policies -->
                  <div class="space-y-1.5">
                    <div class="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Audit Policies & Telemetry:
                    </div>
                    <ul class="space-y-1 text-[11px] text-slate-300">
                      @for (policy of member.auditPolicies; track policy) {
                        <li class="flex items-start gap-1.5">
                          <span class="text-blue-400 mt-0.5">•</span>
                          <span>{{ policy }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                </div>

                <div class="mt-5 pt-3 border-t border-obsidian-750/70 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Host: Node 1 (pve)</span>
                  <span class="text-slate-500">Tier {{ member.vmid <= 402 ? '0' : '1' }}</span>
                </div>
              </div>
            }
          </div>

        </div>
      }

      <!-- TAB 2: REPLICATION & AUTH TOPOLOGY -->
      @if (activeTab === 'topology') {
        <div class="space-y-8">
          
          <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
            <h3 class="text-xl font-serif font-normal text-slate-100">
              Active Directory Protocol & Trust Architecture
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              The domain environment enforces multi-master directory synchronization, Kerberos v5 ticket-granting,
              authoritative DNS delegation, enterprise public-key infrastructure via AD CS, and cross-platform identity for Linux.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                <h4 class="text-base font-serif font-medium text-slate-100">
                  Domain Controllers & Replication
                </h4>
              </div>
              <ul class="space-y-2.5 text-xs text-slate-300">
                <li class="p-3 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                  <div class="font-semibold text-slate-100 flex items-center justify-between">
                    <span>ad2022 (VM 400) ↔ ad2016 (VM 401)</span>
                    <span class="font-mono text-[10px] text-blue-400">RPC / DRS</span>
                  </div>
                  <p class="text-slate-400">
                    AD DS Multi-master directory replication. Schema, Configuration, and Domain NC partitions synchronized bidirectionally.
                  </p>
                </li>
                <li class="p-3 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                  <div class="font-semibold text-slate-100 flex items-center justify-between">
                    <span>ad2022 (VM 400) → ad2012 (VM 402)</span>
                    <span class="font-mono text-[10px] text-blue-400">AD CS / RPC</span>
                  </div>
                  <p class="text-slate-400">
                    Enterprise Root CA enrollment. Issues machine certificates for Kerberos PKINIT and LDAPS authentication.
                  </p>
                </li>
              </ul>
            </div>

            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                <h4 class="text-base font-serif font-medium text-slate-100">
                  Endpoints & Cross-Platform Federation
                </h4>
              </div>
              <ul class="space-y-2.5 text-xs text-slate-300">
                <li class="p-3 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                  <div class="font-semibold text-slate-100 flex items-center justify-between">
                    <span>adwin10 (VM 403) → ad2022 (VM 400)</span>
                    <span class="font-mono text-[10px] text-indigo-400">Kerberos / Port 88</span>
                  </div>
                  <p class="text-slate-400">
                    Modern Windows 10 workstation requesting AS-REQ / TGS-REQ tickets. GPOs applied for security baselines and Sysmon forwarding.
                  </p>
                </li>
                <li class="p-3 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                  <div class="font-semibold text-slate-100 flex items-center justify-between">
                    <span>adrhel (VM 405) → ad2022 (VM 400)</span>
                    <span class="font-mono text-[10px] text-red-400">SSSD / Kerberos PAM</span>
                  </div>
                  <p class="text-slate-400">
                    Red Hat Enterprise Linux 9 joined to the domain via realmd and sssd. AD users can SSH into Linux using active domain credentials.
                  </p>
                </li>
              </ul>
            </div>

          </div>

        </div>
      }

      <!-- TAB 3: THREAT DETECTION SCENARIOS -->
      @if (activeTab === 'detection') {
        <div class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  ATTACK 01 · T1558.003
                </span>
                <span class="text-xs text-slate-400 font-mono">Event ID 4769</span>
              </div>
              <h4 class="text-base font-serif font-medium text-slate-100">
                Kerberoasting Attack Detection
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                An adversary queries the domain controller requesting TGS service tickets for user accounts with ServicePrincipalName (SPN) set, targeting weak RC4 ticket encryption.
              </p>
              <div class="p-3 rounded-xl bg-obsidian-900 font-mono text-[11px] text-slate-300 space-y-1 border border-obsidian-750">
                <div class="text-slate-400"># Detection Signature:</div>
                <div class="text-rose-400">EventID 4769 AND TicketOptions: 0x40810000 AND TicketEncryptionType: 0x17 (RC4-HMAC)</div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  ATTACK 02 · T1558.004
                </span>
                <span class="text-xs text-slate-400 font-mono">Event ID 4768</span>
              </div>
              <h4 class="text-base font-serif font-medium text-slate-100">
                AS-REP Roasting (No Pre-Authentication)
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                Adversary requests authentication for accounts having "Do not require Kerberos preauthentication" configured, receiving an encrypted AS-REP directly crackable offline.
              </p>
              <div class="p-3 rounded-xl bg-obsidian-900 font-mono text-[11px] text-slate-300 space-y-1 border border-obsidian-750">
                <div class="text-slate-400"># Detection Signature:</div>
                <div class="text-amber-400">EventID 4768 AND PreAuthType: 0 (Pre-authentication not provided / disabled on target user)</div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  ATTACK 03 · T1003.006
                </span>
                <span class="text-xs text-slate-400 font-mono">Event ID 4662</span>
              </div>
              <h4 class="text-base font-serif font-medium text-slate-100">
                DCSync Replication Rights Abuse
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                Compromised account invokes directory replication rights (DS-Replication-Get-Changes-All) pretending to be a DC to harvest cleartext password hashes (ntds.dit).
              </p>
              <div class="p-3 rounded-xl bg-obsidian-900 font-mono text-[11px] text-slate-300 space-y-1 border border-obsidian-750">
                <div class="text-slate-400"># Detection Signature:</div>
                <div class="text-purple-400">EventID 4662 AND AccessMask: 0x100 AND Properties: &#123;1131f6aa-9c07-11d1-f79f-00c04fc2dcd2&#125; (DCSync)</div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  ATTACK 04 · T1557.001
                </span>
                <span class="text-xs text-slate-400 font-mono">Suricata NTLM</span>
              </div>
              <h4 class="text-base font-serif font-medium text-slate-100">
                Legacy SMBv1 & NTLM Relay Containment
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                Adversary poisons LLMNR/NBT-NS or exploits legacy client adwin7 (VM 404) to relay NTLM hashes. OPNsense Suricata inspects SMB negotiation, alerting on SMBv1 usage.
              </p>
              <div class="p-3 rounded-xl bg-obsidian-900 font-mono text-[11px] text-slate-300 space-y-1 border border-obsidian-750">
                <div class="text-slate-400"># Suricata Rule Trigger:</div>
                <div class="text-cyan-400">alert smb any any -> any 445 (msg:"SURICATA SMBv1 Protocol Negotiation Attempt"; flow:to_server;)</div>
              </div>
            </div>

          </div>

        </div>
      }

    </section>
  `
})
export class ActiveDirectoryComponent {
  ts = inject(TranslationService);

  activeTab: 'fleet' | 'topology' | 'detection' = 'fleet';

  adMembers: ActiveDirectoryMember[] = AD_MEMBERS_DATA;
}
