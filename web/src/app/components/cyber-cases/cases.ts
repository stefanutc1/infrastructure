import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { CYBER_CASES_DATA, CyberInvestigation } from '../../data/infrastructure.data';

@Component({
  selector: 'app-cyber-cases',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="cyber-cases" class="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      <!-- Section Header -->
      <div class="space-y-3 mb-10">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span class="text-xs font-sans font-bold tracking-widest text-rose-400 uppercase">
            DIGITAL FORENSICS & INCIDENT RESPONSE (DFIR)
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
            5 CASE DOSSIERS · TLP:CLEAR
          </span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-slate-50 tracking-tight">
          Real-World Threat Deconstructions & Forensic Cases
        </h2>
        <p class="text-sm sm:text-base text-slate-300 max-w-4xl font-sans font-normal leading-relaxed">
          Deep-dive reverse engineering investigations conducted against live cybercrime campaigns:
          brand impersonations, vishing syndicates, crypto task scams, affiliate pyramid operations, and browser-in-the-middle phishing kits.
          All indicators of compromise (IoCs) are defanged and correlated with datacenter defenses.
        </p>
      </div>

      <!-- Case Filters -->
      <div class="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2 font-sans border-b border-obsidian-750">
        <button
          (click)="selectedCategory = 'all'"
          [class.bg-slate-200]="selectedCategory === 'all'"
          [class.text-slate-950]="selectedCategory === 'all'"
          [class.font-semibold]="selectedCategory === 'all'"
          [class.text-slate-300]="selectedCategory !== 'all'"
          [class.bg-obsidian-900]="selectedCategory !== 'all'"
          class="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-obsidian-750 transition-all whitespace-nowrap"
        >
          All Cases ({{ cases.length }})
        </button>
        @for (c of cases; track c.caseId) {
          <button
            (click)="selectedCategory = c.caseId"
            [class.bg-slate-200]="selectedCategory === c.caseId"
            [class.text-slate-950]="selectedCategory === c.caseId"
            [class.font-semibold]="selectedCategory === c.caseId"
            [class.text-slate-300]="selectedCategory !== c.caseId"
            [class.bg-obsidian-900]="selectedCategory !== c.caseId"
            class="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-obsidian-750 transition-all whitespace-nowrap"
          >
            {{ c.caseId }}
          </button>
        }
      </div>

      <!-- Cases Accordion / Cards List -->
      <div class="space-y-6">
        @for (c of filteredCases; track c.caseId) {
          <div class="p-6 sm:p-8 rounded-2xl bg-obsidian-850 border border-obsidian-750 hover:border-slate-500/50 transition-all shadow-xl space-y-6">
            
            <!-- Case Header -->
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-obsidian-750">
              <div class="space-y-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    {{ c.caseId }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded text-[11px] font-mono bg-obsidian-900 text-slate-300 border border-obsidian-750">
                    {{ c.category }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {{ c.status }}
                  </span>
                </div>
                <h3 class="text-xl sm:text-2xl font-serif font-medium text-slate-100">
                  {{ c.title }}
                </h3>
                <div class="text-xs text-slate-400 font-mono">
                  <span class="text-cyan-400 font-medium">{{ c.author }}</span> · Date: <span class="text-slate-200">{{ c.date }}</span> · Evidence: <code class="text-slate-300">{{ c.evidenceDir }}</code>
                </div>
              </div>

              <!-- Action Link -->
              <div class="shrink-0">
                <a [href]="'https://github.com/stefanutc1/infrastructure/tree/main/' + c.evidenceDir"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-900 hover:bg-slate-800 text-slate-200 text-xs font-mono border border-obsidian-750 transition-all">
                  <span>View Dossier</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            <!-- Summary & Attack Vector -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div class="space-y-2">
                <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Executive Summary:
                </div>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {{ c.summary }}
                </p>
                <div class="pt-2 text-xs text-slate-400">
                  <span class="text-slate-300 font-semibold">Attack Vector: </span>
                  {{ c.attackVector }}
                </div>
              </div>

              <!-- Threat Actor TTPs -->
              <div class="space-y-2">
                <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Threat Actor TTPs:
                </div>
                <ul class="space-y-1.5 text-xs text-slate-300">
                  @for (ttp of c.threatActorTTPs; track ttp) {
                    <li class="flex items-start gap-2">
                      <span class="text-rose-400 mt-0.5">•</span>
                      <span>{{ ttp }}</span>
                    </li>
                  }
                </ul>
              </div>

            </div>

            <!-- Indicators of Compromise (IoCs) & Legal / Authority Disposition -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5 border-t border-obsidian-750/70">
              
              <!-- IoC Table -->
              <div class="space-y-2">
                <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                  <span>Key Indicators of Compromise (IoCs):</span>
                  <span class="text-[10px] text-amber-400 font-normal">DEFANGED</span>
                </div>
                <div class="p-3 rounded-xl bg-obsidian-900 border border-obsidian-750 font-mono text-[11px] space-y-1.5">
                  @for (ioc of c.keyIoCs; track ioc.value) {
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-slate-400 shrink-0">[{{ ioc.type }}]</span>
                      <span class="text-rose-300 truncate select-all">{{ ioc.value }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Authority Disposition & MITRE ATT&CK -->
              <div class="space-y-3">
                <div>
                  <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Resolution & CSIRT Disposition:
                  </div>
                  <p class="text-xs text-emerald-400 font-medium leading-relaxed mt-1">
                    {{ c.disposition }}
                  </p>
                </div>

                <div>
                  <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                    MITRE ATT&CK Techniques:
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    @for (tech of c.mitreTechniques; track tech) {
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-obsidian-900 border border-obsidian-750 text-slate-300">
                        {{ tech }}
                      </span>
                    }
                  </div>
                </div>
              </div>

            </div>

          </div>
        }
      </div>

    </section>
  `
})
export class CyberCasesComponent {
  ts = inject(TranslationService);

  cases: CyberInvestigation[] = CYBER_CASES_DATA;
  selectedCategory: string = 'all';

  get filteredCases(): CyberInvestigation[] {
    if (this.selectedCategory === 'all') {
      return this.cases;
    }
    return this.cases.filter(c => c.caseId === this.selectedCategory);
  }
}
