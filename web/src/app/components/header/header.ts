import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="w-full border-b border-obsidian-750 bg-[#0c0e11]/90 backdrop-blur-xl sticky top-0 z-40 font-sans">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative overflow-x-auto no-scrollbar">
        
        <!-- Navigation Links -->
        <nav class="flex items-center gap-4 sm:gap-6 font-sans text-xs font-medium text-slate-300 shrink-0">
          <a href="#overview" class="hover:text-slate-100 transition-colors">{{ ts.t.navOverview }}</a>
          <a href="#topology-section" class="hover:text-slate-100 transition-colors">{{ ts.t.navTopology }}</a>
          <a href="#hardware" class="hover:text-slate-100 transition-colors">{{ ts.t.navHardware }}</a>
          <a href="#services" class="hover:text-slate-100 transition-colors">{{ ts.t.navServices }}</a>
          <a href="#network" class="hover:text-slate-100 transition-colors">{{ ts.t.navNetwork }}</a>
          <a href="#ad" class="hover:text-slate-100 transition-colors">{{ ts.t.navAd }}</a>
          <a href="#thesis" class="hover:text-slate-100 transition-colors">{{ ts.t.navThesis }}</a>
          <a href="#cyber-cases" class="hover:text-slate-100 transition-colors">{{ ts.t.navCyber }}</a>
          <a href="#iac-cicd" class="hover:text-slate-100 transition-colors">{{ ts.t.navIac }}</a>
          <a href="#about" class="hover:text-slate-100 transition-colors">About</a>
          <a href="#blueprint" class="hover:text-slate-100 transition-colors">{{ ts.t.navBlueprint }}</a>
        </nav>

        <!-- Command Palette Trigger Button (Ctrl+K / Cmd+K) -->
        <div class="hidden lg:flex items-center gap-2 ml-4 shrink-0">
          <button
            (click)="searchTriggered.emit()"
            class="px-2.5 py-1 rounded-lg bg-obsidian-900 border border-obsidian-750 text-slate-400 hover:text-slate-200 text-[11px] font-mono flex items-center gap-1.5 transition-colors"
          >
            <span>⌘K</span>
            <span class="text-[10px] text-slate-500">Search</span>
          </button>
        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  @Output() searchTriggered = new EventEmitter<void>();

  ts = inject(TranslationService);

  onNavCyber() {
    window.location.hash = 'cyber';
    const el = document.getElementById('cyber') || document.getElementById('blueprint');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
