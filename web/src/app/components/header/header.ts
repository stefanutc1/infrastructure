import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      class="sticky top-0 z-40 w-full border-b border-[#24181e] transition-colors font-sans"
      style="backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); background-color: rgba(12, 12, 12, 0.78);"
    >
      <div class="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div class="flex h-20 items-center justify-between gap-4">
          <!-- Brand Identity (matching stefanutc1.github.io) -->
          <a
            href="#overview"
            class="flex items-center gap-3.5 text-left group min-w-0 shrink-0"
          >
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-tl-[14px] rounded-br-[14px] border border-[#52212e] bg-[#401823] font-display text-sm font-semibold tracking-tight text-[#efebe5] group-hover:bg-[#52212e] transition">
              MȘ
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2.5">
                <span class="font-display text-base font-medium tracking-tight text-[#efebe5] truncate">
                  Moană Ștefănuț-Cornel
                </span>
                <span class="hidden sm:inline-flex items-center gap-1.5 rounded-[30px] bg-[#52212e] px-2.5 py-0.5 text-[11px] font-mono text-[#efebe5]">
                  <span class="h-1.5 w-1.5 rounded-[2px] bg-[#efebe5]"></span>
                  infrastructure
                </span>
              </div>
              <div class="text-[11px] font-mono text-[#827470] truncate">
                Software Engineering since 2015 · FEAA UCV (2024 – 2027)
              </div>
            </div>
          </a>

          <!-- Center Navigation Links -->
          <nav class="hidden xl:flex items-center gap-1 font-sans text-xs font-medium text-[#d9d1ca]">
            <a href="#overview" class="px-3 py-1.5 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#401823] hover:text-[#efebe5] transition">{{ ts.t.navOverview }}</a>
            <a href="#topology-section" class="px-3 py-1.5 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#401823] hover:text-[#efebe5] transition">{{ ts.t.navTopology }}</a>
            <a href="#hardware" class="px-3 py-1.5 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#401823] hover:text-[#efebe5] transition">{{ ts.t.navHardware }}</a>
            <a href="#services" class="px-3 py-1.5 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#401823] hover:text-[#efebe5] transition">{{ ts.t.navServices }}</a>
            <a href="#network" class="px-3 py-1.5 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#401823] hover:text-[#efebe5] transition">{{ ts.t.navNetwork }}</a>
            <a href="#thesis" class="px-3 py-1.5 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#401823] hover:text-[#efebe5] transition">{{ ts.t.navThesis }}</a>
            <a href="#cyber-cases" class="px-3 py-1.5 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#401823] hover:text-[#efebe5] transition">{{ ts.t.navCyber }}</a>
            <a href="#iac-cicd" class="px-3 py-1.5 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#401823] hover:text-[#efebe5] transition">{{ ts.t.navIac }}</a>
            <a href="#about" class="px-3 py-1.5 rounded-tl-[10px] rounded-br-[10px] hover:bg-[#401823] hover:text-[#efebe5] transition">Gallery</a>
          </nav>

          <!-- Right Actions & Chamfered CTAs -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              (click)="searchTriggered.emit()"
              class="inline-flex items-center gap-2 rounded-tl-[12px] rounded-br-[12px] border border-[#52212e] bg-[#140b0f] px-3 py-2 text-xs text-[#d9d1ca] hover:text-[#efebe5] hover:border-[#efebe5]/40 transition font-mono"
              title="Search (⌘K)"
            >
              <span>⌘K</span>
              <span class="hidden sm:inline text-[11px] text-[#827470]">Search</span>
            </button>

            <a
              href="https://stefanutc1.github.io"
              class="hidden sm:inline-flex items-center gap-1.5 dp-btn-outline px-3.5 py-2 text-xs font-medium"
            >
              <span>Main Site</span>
              <span>↗</span>
            </a>

            <a
              href="https://github.com/stefanutc1/infrastructure"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 dp-btn-primary px-4 py-2 text-xs font-medium"
            >
              <span>GitHub</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        <!-- Mobile / Tablet Navigation Bar -->
        <div class="flex xl:hidden items-center gap-1.5 overflow-x-auto pb-3 pt-1 no-scrollbar text-xs font-medium">
          <a href="#overview" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">{{ ts.t.navOverview }}</a>
          <a href="#topology-section" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">{{ ts.t.navTopology }}</a>
          <a href="#hardware" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">{{ ts.t.navHardware }}</a>
          <a href="#services" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">{{ ts.t.navServices }}</a>
          <a href="#network" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">{{ ts.t.navNetwork }}</a>
          <a href="#ad" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">{{ ts.t.navAd }}</a>
          <a href="#thesis" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">{{ ts.t.navThesis }}</a>
          <a href="#cyber-cases" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">{{ ts.t.navCyber }}</a>
          <a href="#iac-cicd" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">{{ ts.t.navIac }}</a>
          <a href="#about" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">Gallery</a>
          <a href="#blueprint" class="shrink-0 rounded-tl-[10px] rounded-br-[10px] border border-[#24181e] bg-[#140b0f] px-3 py-1.5 text-[#d9d1ca] hover:text-[#efebe5]">{{ ts.t.navBlueprint }}</a>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Output() searchTriggered = new EventEmitter<void>();

  ts = inject(TranslationService);
}
