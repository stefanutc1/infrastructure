import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import {
  THESIS_COMPONENTS_DATA,
  THESIS_DATA_FLOWS,
  ThesisComponent,
  ThesisDataFlowStep
} from '../../data/infrastructure.data';

@Component({
  selector: 'app-bachelor-thesis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="thesis" class="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      <!-- Section Header -->
      <div class="space-y-3 mb-10">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-sans font-bold tracking-widest text-emerald-400 uppercase">
            BACHELOR'S THESIS LABORATORY · FEAA CRAIOVA
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            DEFENSE LAB
          </span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-slate-50 tracking-tight">
          {{ ts.currentLang() === 'ro' ? 'Arhitectura și Securitatea Sistemelor Informatice Bancare' : 'Architecture and Security of Banking Information Systems' }}
        </h2>
        <p class="text-sm sm:text-base text-slate-300 max-w-4xl font-sans font-normal leading-relaxed">
          High-assurance banking simulation environment reproducing multi-tier financial computing:
          <span class="text-slate-100 font-medium">Apache Fineract Core-Banking</span>,
          <span class="text-slate-100 font-medium">PostgreSQL 16 with pgAudit</span>,
          <span class="text-slate-100 font-medium">FastAPI Card Authorization & SWIFT MT103 API</span>, and
          <span class="text-slate-100 font-medium">an ed25519/MFA Bastion Jump-Box</span>.
          Strict distinction between implemented components and protocol simulation stubs.
        </p>
      </div>

      <!-- Navigation Tabs for Thesis Subsystems -->
      <div class="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2 font-sans border-b border-obsidian-750">
        <button
          (click)="activeTab = 'architecture'"
          [class.bg-slate-200]="activeTab === 'architecture'"
          [class.text-slate-950]="activeTab === 'architecture'"
          [class.font-semibold]="activeTab === 'architecture'"
          [class.text-slate-300]="activeTab !== 'architecture'"
          [class.bg-obsidian-900]="activeTab !== 'architecture'"
          class="px-4 py-2 rounded-xl text-xs font-medium border border-obsidian-750 transition-all whitespace-nowrap"
        >
          1. Architecture Fleet & Specs (4+2 Nodes)
        </button>
        <button
          (click)="activeTab = 'dataflow'"
          [class.bg-slate-200]="activeTab === 'dataflow'"
          [class.text-slate-950]="activeTab === 'dataflow'"
          [class.font-semibold]="activeTab === 'dataflow'"
          [class.text-slate-300]="activeTab !== 'dataflow'"
          [class.bg-obsidian-900]="activeTab !== 'dataflow'"
          class="px-4 py-2 rounded-xl text-xs font-medium border border-obsidian-750 transition-all whitespace-nowrap"
        >
          2. Transaction Data Flow & Verification
        </button>
        <button
          (click)="activeTab = 'scenarios'"
          [class.bg-slate-200]="activeTab === 'scenarios'"
          [class.text-slate-950]="activeTab === 'scenarios'"
          [class.font-semibold]="activeTab === 'scenarios'"
          [class.text-slate-300]="activeTab !== 'scenarios'"
          [class.bg-obsidian-900]="activeTab !== 'scenarios'"
          class="px-4 py-2 rounded-xl text-xs font-medium border border-obsidian-750 transition-all whitespace-nowrap"
        >
          3. Cyber Threat & Anti-Fraud Drills (5 Scenarios)
        </button>
      </div>

      <!-- TAB 1: ARCHITECTURE NODES GRID -->
      @if (activeTab === 'architecture') {
        <div class="space-y-8">
          
          <!-- Legend Bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-obsidian-850/80 border border-obsidian-750 text-xs">
            <div class="flex items-center gap-4">
              <span class="text-slate-400">Implementation Verification:</span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                IMPLEMENTED (Active Node)
              </span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                SIMULATED (Protocol Stub)
              </span>
            </div>
            <div class="text-slate-400 font-mono text-[11px]">
              VLAN 10 (Admin) · VLAN 20 (Banking Core)
            </div>
          </div>

          <!-- Components Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (comp of thesisComponents; track comp.id) {
              <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 flex flex-col justify-between hover:border-slate-500/50 transition-all shadow-xl group">
                <div class="space-y-4">
                  <!-- Header with Badges -->
                  <div class="flex items-start justify-between gap-2">
                    <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold tracking-wider border"
                          [ngClass]="comp.status === 'IMPLEMENTED' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'">
                      {{ comp.status }}
                    </span>
                    <span class="font-mono text-xs text-slate-400 bg-obsidian-900 px-2 py-0.5 rounded border border-obsidian-750">
                      {{ comp.type }} {{ comp.vmidOrCtid }} · VLAN {{ comp.vlan }}
                    </span>
                  </div>

                  <!-- Title & Role -->
                  <div>
                    <h3 class="text-lg font-serif font-medium text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {{ comp.name }}
                    </h3>
                    <p class="text-xs text-emerald-400 font-medium mt-0.5">
                      {{ comp.role }}
                    </p>
                  </div>

                  <!-- Description -->
                  <p class="text-xs text-slate-300 leading-relaxed">
                    {{ comp.description }}
                  </p>

                  <!-- Tech Stack & IP -->
                  <div class="pt-2 border-t border-obsidian-750/70 space-y-1.5 font-mono text-[11px]">
                    <div class="flex items-center justify-between text-slate-400">
                      <span>IP Address:</span>
                      <span class="text-slate-200">{{ comp.ip }}</span>
                    </div>
                    <div class="flex items-center justify-between text-slate-400">
                      <span>Stack:</span>
                      <span class="text-slate-300 truncate max-w-[180px]">{{ comp.technology }}</span>
                    </div>
                  </div>

                  <!-- Security Controls Pill List -->
                  <div class="space-y-1.5">
                    <div class="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Hardening & Security Controls:
                    </div>
                    <ul class="space-y-1 text-[11px] text-slate-300">
                      @for (ctrl of comp.securityControls; track ctrl) {
                        <li class="flex items-start gap-1.5">
                          <span class="text-emerald-400 mt-0.5">✓</span>
                          <span>{{ ctrl }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                </div>

                <div class="mt-5 pt-3 border-t border-obsidian-750/70 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Hypervisor: Node 1 (pve)</span>
                  <span class="text-slate-500">ACID / KYC</span>
                </div>
              </div>
            }
          </div>

        </div>
      }

      <!-- TAB 2: TRANSACTION DATA FLOW -->
      @if (activeTab === 'dataflow') {
        <div class="space-y-8">
          
          <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
            <h3 class="text-xl font-serif font-normal text-slate-100">
              End-to-End Banking Transaction Pipeline
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              Every financial transaction traverses multi-layer validation: client-side and server-side Luhn checks,
              frequency throttling, double-entry ledger verification, and row-level database commits with immediate SIEM ingestion.
            </p>
          </div>

          <!-- Step-by-Step Flow List -->
          <div class="space-y-4">
            @for (step of dataFlowSteps; track step.stepNumber) {
              <div class="p-5 rounded-2xl bg-obsidian-850 border border-obsidian-750 hover:border-slate-500/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                  <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm shrink-0">
                    {{ step.stepNumber }}
                  </div>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-medium text-slate-100 text-sm">{{ step.source }}</span>
                      <span class="text-slate-500 text-xs">→</span>
                      <span class="font-medium text-emerald-400 text-sm">{{ step.destination }}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-obsidian-900 border border-obsidian-750 text-slate-400">
                        {{ step.protocol }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-300 leading-relaxed">
                      {{ step.action }}
                    </p>
                  </div>
                </div>

                <div class="md:text-right shrink-0 p-3 rounded-xl bg-obsidian-900 border border-obsidian-750 md:max-w-xs space-y-1">
                  <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Security Verification:
                  </div>
                  <div class="text-xs text-slate-200">
                    {{ step.securityCheck }}
                  </div>
                </div>
              </div>
            }
          </div>

        </div>
      }

      <!-- TAB 3: CYBER THREAT & ANTI-FRAUD DRILLS -->
      @if (activeTab === 'scenarios') {
        <div class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Scenario 1 -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  DRILL 01 · TRANSACTION INTEGRITY
                </span>
                <span class="text-xs text-slate-400 font-mono">ACID Verification</span>
              </div>
              <h4 class="text-base font-serif font-medium text-slate-100">
                Nominal Double-Entry Ledger Commitment
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                A legitimate payment of 250.00 RON is processed. The payment gateway performs card Luhn validation, translates the payload into an Apache Fineract double-entry journal entry, and commits atomic debit/credit operations inside PostgreSQL 16.
              </p>
              <div class="p-3 rounded-xl bg-obsidian-900 font-mono text-[11px] text-slate-300 space-y-1 border border-obsidian-750">
                <div class="text-slate-400"># Verification Command:</div>
                <div class="text-emerald-400">psql -U fineract -d mifostenant-default -c "SELECT id, amount, entry_type FROM m_account_transfers ORDER BY id DESC LIMIT 1;"</div>
              </div>
            </div>

            <!-- Scenario 2 -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  DRILL 02 · TAMPER DETECTION
                </span>
                <span class="text-xs text-slate-400 font-mono">pgAudit + Wazuh HIDS</span>
              </div>
              <h4 class="text-base font-serif font-medium text-slate-100">
                Direct Balance Tampering & SQL Injection Simulation
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                An attacker executes an unauthorized direct SQL <code class="text-rose-300">UPDATE m_savings_account SET account_balance_derived = 999999.00</code>. PostgreSQL's pgAudit extension logs the query immediately to the WAL, and the local Wazuh agent triggers a Level 12 critical alert in OpenSearch.
              </p>
              <div class="p-3 rounded-xl bg-obsidian-900 font-mono text-[11px] text-slate-300 space-y-1 border border-obsidian-750">
                <div class="text-slate-400"># Wazuh Rule Trigger:</div>
                <div class="text-rose-400">Rule 100210: "Unauthorized direct modification of financial balance ledger outside Spring ORM session"</div>
              </div>
            </div>

            <!-- Scenario 3 -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  DRILL 03 · ANTI-FRAUD
                </span>
                <span class="text-xs text-slate-400 font-mono">Velocity Limiting</span>
              </div>
              <h4 class="text-base font-serif font-medium text-slate-100">
                Card-Stuffing Bot Attack Throttling
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                Automated bot attempts 50 rapid transactions per minute with generated PANs. The FastAPI payment gateway activates token-bucket rate limiting after 5 failed Luhn checks, returning HTTP 429 and signaling OPNsense Suricata to drop the client IP at the firewall boundary.
              </p>
              <div class="p-3 rounded-xl bg-obsidian-900 font-mono text-[11px] text-slate-300 space-y-1 border border-obsidian-750">
                <div class="text-slate-400"># Gateway Response:</div>
                <div class="text-amber-400">HTTP/1.1 429 Too Many Requests | RateLimit-Exceeded: 5 attempts/min (Suricata IP ban issued)</div>
              </div>
            </div>

            <!-- Scenario 4 -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  DRILL 04 · CREDENTIAL DEFENSE
                </span>
                <span class="text-xs text-slate-400 font-mono">ed25519 + TOTP MFA</span>
              </div>
              <h4 class="text-base font-serif font-medium text-slate-100">
                Infostealer Credential Theft Resistance
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                If an administrator's browser or workstation is infected with an infostealer trojan (e.g., RedLine/Lumma), stolen passwords cannot access the banking core: the jump-box VM 313 demands an ed25519 hardware key and an out-of-band rotating TOTP token, preventing unauthorized pivot.
              </p>
              <div class="p-3 rounded-xl bg-obsidian-900 font-mono text-[11px] text-slate-300 space-y-1 border border-obsidian-750">
                <div class="text-slate-400"># Bastion Verification:</div>
                <div class="text-cyan-400">ssh -i ~/.ssh/id_ed25519 admin@192.168.10.50 -> "Verification code: [TOTP]" (Password authentication disabled)</div>
              </div>
            </div>

          </div>

        </div>
      }

    </section>
  `
})
export class BachelorThesisComponent {
  ts = inject(TranslationService);

  activeTab: 'architecture' | 'dataflow' | 'scenarios' = 'architecture';

  thesisComponents: ThesisComponent[] = THESIS_COMPONENTS_DATA;
  dataFlowSteps: ThesisDataFlowStep[] = THESIS_DATA_FLOWS;
}
