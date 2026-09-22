import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { CI_CD_GATES_DATA, CiCdGate } from '../../data/infrastructure.data';

@Component({
  selector: 'app-iac-cicd',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="iac-cicd" class="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      <!-- Section Header -->
      <div class="space-y-3 mb-10">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse"></span>
          <span class="text-xs font-sans font-bold tracking-widest text-violet-400 uppercase">
            DEVSECOPS, IAC & GITHUB ACTIONS
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/30">
            6 SECURITY GATES · ZERO DRIFT
          </span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-slate-50 tracking-tight">
          Declarative Infrastructure & Automated CI/CD Gates
        </h2>
        <p class="text-sm sm:text-base text-slate-300 max-w-4xl font-sans font-normal leading-relaxed">
          Infrastructure state is defined as code and reconciled continuously through GitOps.
          Every pull request and commit must pass 6 automated security and verification gates before deployment
          to the bare-metal Proxmox hypervisor and Kubernetes cluster.
        </p>
      </div>

      <!-- IaC Declarative Lifecycle Diagram -->
      <div class="p-6 sm:p-8 rounded-2xl bg-obsidian-850 border border-obsidian-750 space-y-6 mb-10 shadow-xl">
        <div class="space-y-1">
          <h3 class="text-xl font-serif font-medium text-slate-100">
            Declarative Provisioning & Reconciliation Lifecycle
          </h3>
          <p class="text-xs sm:text-sm text-slate-400">
            End-to-end automated deployment flow from version control to hardware execution.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div class="p-4 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-2">
            <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex justify-between">
              <span>Stage 01</span>
              <span class="text-violet-400">Git SCM</span>
            </div>
            <div class="font-medium text-sm text-slate-100">GitOps Source</div>
            <p class="text-xs text-slate-400 leading-relaxed">
              Branch-protected repository. All infrastructure changes modeled as declarative code with signed commits.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-2">
            <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex justify-between">
              <span>Stage 02</span>
              <span class="text-violet-400">Terraform</span>
            </div>
            <div class="font-medium text-sm text-slate-100">State Provisioning</div>
            <p class="text-xs text-slate-400 leading-relaxed">
              <code class="text-slate-300">bpg/proxmox</code> provider manages VM IDs 200–405, LXC storage, and virtual network bridges.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-2">
            <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex justify-between">
              <span>Stage 03</span>
              <span class="text-violet-400">Ansible</span>
            </div>
            <div class="font-medium text-sm text-slate-100">Host Hardening</div>
            <p class="text-xs text-slate-400 leading-relaxed">
              Applies CIS benchmarks, configures ZRAM lz4 compression, deploys Wazuh agents, and sets up SSH keys.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-2">
            <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex justify-between">
              <span>Stage 04</span>
              <span class="text-violet-400">k3s / Docker</span>
            </div>
            <div class="font-medium text-sm text-slate-100">Service Launch</div>
            <p class="text-xs text-slate-400 leading-relaxed">
              Microservices instantiated in LXCs and Kubernetes pods on Node 4 with isolated cgroups.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-2">
            <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex justify-between">
              <span>Stage 05</span>
              <span class="text-emerald-400">Verification</span>
            </div>
            <div class="font-medium text-sm text-slate-100">Telemetry Proof</div>
            <p class="text-xs text-slate-400 leading-relaxed">
              Uptime Kuma probes HTTP endpoints; Scrutiny confirms NVMe/HDD health; Wazuh ingests logs.
            </p>
          </div>

        </div>
      </div>

      <!-- The 6 Automated CI Security Gates -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-serif font-normal text-slate-100 flex items-center gap-2">
            <span>Automated GitHub Actions CI Security Gates</span>
            <span class="text-xs font-mono font-normal text-slate-400">(6 Active Jobs)</span>
          </h3>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ALL GATES PASSING
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (gate of gates; track gate.id) {
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 hover:border-slate-500/60 transition-all shadow-xl flex flex-col justify-between space-y-4">
              
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border"
                        [ngClass]="gate.stage === 'security' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : (gate.stage === 'lint' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30')">
                    {{ gate.stage }}
                  </span>
                  <span class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                    BLOCKING GATE
                  </span>
                </div>

                <div>
                  <h4 class="text-base font-serif font-medium text-slate-100">
                    {{ gate.name }}
                  </h4>
                  <div class="text-xs text-violet-400 font-mono mt-0.5">
                    Engine: {{ gate.tool }}
                  </div>
                </div>

                <p class="text-xs text-slate-300 leading-relaxed">
                  {{ gate.description }}
                </p>

                <div class="text-[11px] text-slate-400 font-mono">
                  <span class="text-slate-500">Scope: </span>{{ gate.scope }}
                </div>
              </div>

              <!-- Executed Command -->
              <div class="pt-3 border-t border-obsidian-750/70 space-y-1">
                <div class="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Automated Check Command:
                </div>
                <div class="p-2 rounded-lg bg-obsidian-900 border border-obsidian-750 font-mono text-[10px] text-slate-300 overflow-x-auto select-all">
                  {{ gate.command }}
                </div>
              </div>

            </div>
          }
        </div>
      </div>

    </section>
  `
})
export class IacCicdComponent {
  ts = inject(TranslationService);

  gates: CiCdGate[] = CI_CD_GATES_DATA;
}
