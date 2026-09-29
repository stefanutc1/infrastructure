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
      
      <!-- Section Header (stefanutc1.github.io / drivepoint.ro Editorial Header) -->
      <div class="space-y-4 mb-10">
        <div class="inline-flex items-center gap-2.5 rounded-[30px] bg-[#52212e] px-3.5 py-1 text-xs font-mono text-[#efebe5] shadow-sm">
          <span class="h-1.5 w-1.5 rounded-[2px] bg-[#efebe5] animate-pulse"></span>
          <span>DIGITAL FORENSICS, INCIDENT RESPONSE & CTF WRITEUPS · {{ cases.length }} DOSSIERS · TLP:CLEAR</span>
        </div>

        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#efebe5] tracking-[-0.025em] leading-[1.08]">
          Real-World Threat Deconstructions
          <span class="font-light italic text-[#d9d1ca]"> & Competitive CTF Writeups.</span>
        </h2>

        <p class="dp-heading-accent text-sm sm:text-base text-[#d9d1ca] max-w-4xl font-sans font-light leading-relaxed">
          Deep-dive reverse engineering investigations and competitive CTF writeups conducted by
          <strong class="text-[#efebe5] font-medium">Moană Ștefănuț-Cornel (&#64;stefanutc1)</strong>:
          the <span class="text-[#efebe5] font-medium">19.09.2026 InvataCyber.ro CTF (3/3 flags · 100%)</span>,
          e-commerce brand impersonations, FinTech vishing syndicates, crypto task scams, affiliate pyramid funnels,
          and Browser-in-the-Middle (BitM) phishing frameworks.
        </p>
      </div>

      <!-- Case Filters -->
      <div class="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-3 font-sans border-b border-[#24181e]">
        <button
          (click)="selectedCategory = 'all'"
          [ngClass]="selectedCategory === 'all'
            ? 'bg-[#efebe5] text-[#0c0c0c] font-semibold border-[#efebe5]'
            : 'bg-[#140b0f] text-[#d9d1ca] border-[#24181e] hover:border-[#52212e]'"
          class="px-4 py-2 rounded-tl-[12px] rounded-br-[12px] text-xs border transition-all whitespace-nowrap font-mono"
        >
          All Dossiers ({{ cases.length }})
        </button>
        @for (c of cases; track c.caseId) {
          <button
            (click)="selectedCategory = c.caseId"
            [ngClass]="selectedCategory === c.caseId
              ? 'bg-[#efebe5] text-[#0c0c0c] font-semibold border-[#efebe5]'
              : 'bg-[#140b0f] text-[#d9d1ca] border-[#24181e] hover:border-[#52212e]'"
            class="px-4 py-2 rounded-tl-[12px] rounded-br-[12px] text-xs border transition-all whitespace-nowrap font-mono"
          >
            {{ c.caseId }}
          </button>
        }
      </div>

      <!-- Cases Feed (brunorochamoura.com/posts/ .post-entry + .entry-cover style matched to site colors) -->
      <div class="space-y-8">
        @for (c of filteredCases; track c.caseId; let idx = $index) {
          <article class="group relative rounded-[8px] border border-[#24181e] bg-[#140b0f] p-5 sm:p-7 transition-all duration-200 hover:-translate-y-[2px] hover:border-[#52212e] hover:bg-[#17090d] shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
            
            <!-- .entry-cover: Dark UI Telemetry Card Banner -->
            <div class="mb-6 overflow-hidden rounded-[6px] border border-[#24181e] bg-[#0c0c0c]">
              <div class="relative w-full overflow-hidden bg-[#0c0c0c] p-4 sm:p-6 select-none">
                <div
                  class="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-56 w-[480px] rounded-full opacity-35 blur-3xl"
                  style="background: radial-gradient(circle, rgba(82, 33, 46, 0.75) 0%, transparent 70%);"
                ></div>

                <div class="relative mx-auto rounded-[8px] border border-[#24181e] bg-[#140b0f]/95 p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.75)]">
                  <!-- Top bar -->
                  <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#24181e] pb-3 mb-4">
                    <div class="flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full bg-[#efebe5]"></span>
                      <span class="h-2.5 w-2.5 rounded-full bg-[#52212e]"></span>
                      <span class="h-2.5 w-2.5 rounded-full bg-[#827470]/50"></span>
                      <span class="ml-2 font-mono text-[11px] uppercase tracking-wider text-[#827470]">
                        {{ c.caseId }} // {{ c.category }}
                      </span>
                    </div>
                    <span class="rounded-[4px] border border-[#52212e] bg-[#401823] px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#efebe5]">
                      {{ c.status }}
                    </span>
                  </div>

                  <!-- Center Telemetry Row -->
                  <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                    <div>
                      <div class="font-mono text-[10px] uppercase tracking-widest text-[#827470]">
                        FORENSIC & OFFENSIVE TELEMETRY ARCHIVE
                      </div>
                      <div class="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#efebe5] mt-0.5">
                        {{ c.evidenceDir }}
                      </div>
                    </div>
                    <div class="font-mono text-xs text-[#d9d1ca]">
                      IOCs / FLAGS EXTRACTED: <span class="text-[#efebe5] font-semibold">{{ c.keyIoCs.length }}</span> · MITRE / CWE: <span class="text-[#efebe5] font-semibold">{{ c.mitreTechniques.length }}</span>
                    </div>
                  </div>

                  <!-- Progress Bar -->
                  <div class="h-2 w-full overflow-hidden rounded-full bg-[#0c0c0c] border border-[#24181e] mb-4">
                    <div class="h-full w-full rounded-full bg-gradient-to-r from-[#401823] via-[#52212e] to-[#efebe5]"></div>
                  </div>

                  <!-- 3 Sub-cards -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div class="rounded-[6px] border border-[#24181e] bg-[#0c0c0c]/90 p-2.5">
                      <div class="font-mono text-[9px] uppercase tracking-wider text-[#827470]">PRIMARY INDICATOR / FLAG</div>
                      <div class="mt-0.5 font-mono text-xs font-semibold text-[#efebe5] truncate">{{ c.keyIoCs[0]?.value }}</div>
                    </div>
                    <div class="rounded-[6px] border border-[#24181e] bg-[#0c0c0c]/90 p-2.5">
                      <div class="font-mono text-[9px] uppercase tracking-wider text-[#827470]">LEAD INVESTIGATOR</div>
                      <div class="mt-0.5 font-mono text-xs font-semibold text-[#d9d1ca] truncate">{{ c.author }}</div>
                    </div>
                    <div class="rounded-[6px] border border-[#24181e] bg-[#0c0c0c]/90 p-2.5">
                      <div class="font-mono text-[9px] uppercase tracking-wider text-[#827470]">DATE & CLASSIFICATION</div>
                      <div class="mt-0.5 font-mono text-xs font-semibold text-[#efebe5] truncate">{{ c.date }} · TLP:CLEAR</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- .entry-header -->
            <header class="mb-4 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#24181e] pb-4">
              <div>
                <h3 class="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-[#efebe5] leading-[1.25]">
                  {{ c.title }}
                </h3>
                <div class="mt-1.5 font-mono text-xs text-[#827470]">
                  <span>{{ c.date }}</span>
                  <span class="mx-1.5">·</span>
                  <span class="text-[#d9d1ca]">{{ c.author }}</span>
                  <span class="mx-1.5">·</span>
                  <span>Repository Path: <code class="text-[#efebe5]">{{ c.evidenceDir }}</code></span>
                </div>
              </div>

              <div class="shrink-0">
                <a
                  [href]="'https://github.com/stefanutc1/infrastructure/tree/main/' + c.evidenceDir"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="dp-btn-primary text-xs font-mono"
                >
                  <span>Inspect Dossier</span>
                  <span>↗</span>
                </a>
              </div>
            </header>

            <!-- .entry-content: Summary, Attack Vector & TTPs -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div class="space-y-2.5">
                <div class="text-[11px] font-mono uppercase tracking-wider text-[#827470] font-semibold">
                  Executive Summary
                </div>
                <p class="text-sm text-[#d9d1ca] leading-[1.65]">
                  {{ c.summary }}
                </p>
                <div class="pt-2 text-xs text-[#827470] leading-relaxed">
                  <span class="text-[#efebe5] font-semibold">Attack Vector / Exploitation Chain: </span>
                  <span class="text-[#d9d1ca]">{{ c.attackVector }}</span>
                </div>
              </div>

              <div class="space-y-2.5">
                <div class="text-[11px] font-mono uppercase tracking-wider text-[#827470] font-semibold">
                  Technical Findings & TTPs
                </div>
                <ul class="space-y-2 text-xs sm:text-sm text-[#d9d1ca]">
                  @for (ttp of c.threatActorTTPs; track ttp) {
                    <li class="flex items-start gap-2.5">
                      <span class="mt-1.5 h-1.5 w-1.5 rounded-[2px] bg-[#efebe5] shrink-0"></span>
                      <span class="leading-relaxed">{{ ttp }}</span>
                    </li>
                  }
                </ul>
              </div>
            </div>

            <!-- Indicators of Compromise (IoCs) & Disposition -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5 border-t border-[#24181e]">
              <div class="space-y-2">
                <div class="text-[11px] font-mono uppercase tracking-wider text-[#827470] font-semibold flex items-center justify-between">
                  <span>Extracted Indicators / Flags:</span>
                  <span class="rounded-[4px] bg-[#401823] border border-[#52212e] px-2 py-0.5 text-[10px] text-[#efebe5] font-mono">VERIFIED</span>
                </div>
                <div class="p-3.5 rounded-[6px] bg-[#0c0c0c] border border-[#24181e] font-mono text-xs space-y-2">
                  @for (ioc of c.keyIoCs; track ioc.value) {
                    <div class="flex items-center justify-between gap-2 border-b border-[#24181e]/60 last:border-b-0 pb-1.5 last:pb-0">
                      <span class="text-[#827470] shrink-0">[{{ ioc.type }}]</span>
                      <span class="text-[#efebe5] truncate select-all">{{ ioc.value }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="space-y-3.5">
                <div>
                  <div class="text-[11px] font-mono uppercase tracking-wider text-[#827470] font-semibold">
                    Resolution & Disposition
                  </div>
                  <p class="text-xs sm:text-sm text-[#efebe5] font-normal leading-relaxed mt-1">
                    {{ c.disposition }}
                  </p>
                </div>

                <div>
                  <div class="text-[10px] font-mono uppercase tracking-wider text-[#827470] font-semibold mb-2">
                    MITRE ATT&CK / CWE Classification
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    @for (tech of c.mitreTechniques; track tech) {
                      <span class="px-2.5 py-1 rounded-[4px] text-[11px] font-mono bg-[#0c0c0c] border border-[#24181e] text-[#d9d1ca]">
                        {{ tech }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            </div>

          </article>
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
