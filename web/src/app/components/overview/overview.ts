import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="relative w-full px-5 sm:px-10 py-12 sm:py-20 overflow-hidden font-sans"
      style="background: linear-gradient(270deg, rgba(12, 12, 12, 0.58) 0%, rgb(23, 9, 13) 100%);"
    >
      <!-- Ambient Burgundy Glow Orbs -->
      <div aria-hidden="true" class="dp-ambient-orb absolute -top-24 -left-24 z-0"></div>
      <div aria-hidden="true" class="dp-ambient-orb absolute -bottom-32 right-10 z-0"></div>

      <div class="relative z-10 space-y-8">
        <!-- drivepoint.ro / stefanutc1.github.io Status Pill -->
        <div class="inline-flex flex-wrap items-center gap-2.5 rounded-[30px] bg-[#52212e] px-4 py-1.5 text-xs font-mono text-[#efebe5] shadow-sm">
          <span class="h-2 w-2 rounded-[2.5px] bg-[#efebe5]"></span>
          <span>PROXMOX VE 9.2 · 4 BARE-METAL NODES · 5 OPNSENSE VLANS · WAZUH SIEM</span>
        </div>

        <!-- Mixed Roman + Light Italic Inter Display Headline -->
        <div class="max-w-4xl space-y-2">
          <h1 class="font-display text-4xl sm:text-5xl lg:text-[54px] font-medium tracking-tight text-[#efebe5] leading-[1.08]">
            Heterogeneous Bare-Metal Cluster,
            <span class="block font-display font-light italic text-2xl sm:text-3xl lg:text-[34px] text-[#d9d1ca] mt-2 leading-[1.18]">
              private cloud orchestration, Core-Banking lab, and DFIR telemetry.
            </span>
          </h1>
        </div>

        <!-- Narrative Paragraph with 4px #52212e Left Border -->
        <div class="dp-heading-accent max-w-3xl text-sm sm:text-[15px] text-[#d9d1ca] leading-relaxed">
          <p>{{ ts.t.heroDescription }}</p>
        </div>

        <!-- Signature Chamfered CTAs -->
        <div class="flex flex-wrap items-center gap-3.5 pt-1">
          <button
            (click)="scrollTo('topology-section')"
            class="dp-btn-primary inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-medium"
          >
            <span>Explore 3D Topology Mesh</span>
            <span>→</span>
          </button>

          <button
            (click)="scrollTo('cyber-cases')"
            class="dp-btn-cream inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-medium"
          >
            <span>Forensic Cases &amp; CTF Writeups</span>
          </button>

          <a
            href="https://stefanutc1.github.io"
            class="dp-btn-outline inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium"
          >
            <span>Personal Blog &amp; Portfolio</span>
            <span>↗</span>
          </a>
        </div>

        <!-- 4 Architectural Highlight Cards (.dp-glass-card) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-left">
          <div (click)="scrollTo('hardware')" class="dp-glass-card p-5 space-y-2.5 cursor-pointer group">
            <div class="text-[11px] font-mono uppercase tracking-wider text-[#827470] flex items-center justify-between">
              <span>[01] · {{ ts.t.metricComputeTitle }}</span>
              <span class="text-xs text-[#d9d1ca] group-hover:translate-x-0.5 transition-transform">↗</span>
            </div>
            <div class="font-display text-2xl font-medium text-[#efebe5]">{{ ts.t.metricComputeCount }}</div>
            <p class="text-xs text-[#d9d1ca] leading-relaxed">
              {{ ts.t.metricComputeDesc }}
            </p>
            <div class="h-[2px] w-10 bg-[#52212e] pt-0.5"></div>
          </div>

          <div (click)="scrollTo('topology-section')" class="dp-glass-card p-5 space-y-2.5 cursor-pointer group">
            <div class="text-[11px] font-mono uppercase tracking-wider text-[#827470] flex items-center justify-between">
              <span>[02] · {{ ts.t.metricVirtTitle }}</span>
              <span class="text-xs text-[#d9d1ca] group-hover:translate-x-0.5 transition-transform">↗</span>
            </div>
            <div class="font-display text-2xl font-medium text-[#efebe5]">{{ ts.t.metricVirtCount }}</div>
            <p class="text-xs text-[#d9d1ca] leading-relaxed">
              {{ ts.t.metricVirtDesc }}
            </p>
            <div class="h-[2px] w-10 bg-[#52212e] pt-0.5"></div>
          </div>

          <div (click)="scrollTo('services')" class="dp-glass-card p-5 space-y-2.5 cursor-pointer group">
            <div class="text-[11px] font-mono uppercase tracking-wider text-[#827470] flex items-center justify-between">
              <span>[03] · {{ ts.t.metricServicesTitle }}</span>
              <span class="text-xs text-[#d9d1ca] group-hover:translate-x-0.5 transition-transform">↗</span>
            </div>
            <div class="font-display text-2xl font-medium text-[#efebe5]">{{ ts.t.metricServicesCount }}</div>
            <p class="text-xs text-[#d9d1ca] leading-relaxed">
              {{ ts.t.metricServicesDesc }}
            </p>
            <div class="h-[2px] w-10 bg-[#52212e] pt-0.5"></div>
          </div>

          <div (click)="scrollTo('cyber-cases')" class="dp-glass-card p-5 space-y-2.5 cursor-pointer group">
            <div class="text-[11px] font-mono uppercase tracking-wider text-[#827470] flex items-center justify-between">
              <span>[04] · {{ ts.t.metricCyberTitle }}</span>
              <span class="text-xs text-[#d9d1ca] group-hover:translate-x-0.5 transition-transform">↗</span>
            </div>
            <div class="font-display text-2xl font-medium text-[#efebe5]">{{ ts.t.metricCyberCount }}</div>
            <p class="text-xs text-[#d9d1ca] leading-relaxed">
              {{ ts.t.metricCyberDesc }}
            </p>
            <div class="h-[2px] w-10 bg-[#52212e] pt-0.5"></div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class OverviewComponent {
  ts = inject(TranslationService);

  scrollTo(targetId: string) {
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
