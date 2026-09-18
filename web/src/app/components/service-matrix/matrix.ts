import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SERVICES_DATA, ServiceItem } from '../../data/services.data';
import { TOPOLOGY_NODES, TopologyNode } from '../../data/topology.data';
import { TranslationService } from '../../services/translation.service';

@Component({
 selector: 'app-service-matrix',
 standalone: true,
 imports: [CommonModule],
 template: `
  <section id="services" class="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
   
   <!-- Section Header -->
   <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
    <div class="space-y-2">
     <div class="hidden">
      {{ ts.t.srvTag }}
     </div>
     <h2 class="text-3xl sm:text-4xl font-serif font-normal text-slate-50 tracking-tight">
      {{ ts.t.srvTitle }}
     </h2>
     <p class="text-sm text-slate-300 max-w-2xl font-sans font-normal leading-relaxed">
      {{ ts.t.srvDesc }}
     </p>
    </div>

    <!-- Search Bar -->
    <div class="w-full md:w-72">
     <input
      type="text"
      [value]="searchQuery"
      (input)="onSearch($event)"
      [placeholder]="ts.t.srvSearchPlaceholder"
      class="w-full px-4 py-2.5 rounded-xl bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder:text-slate-500 font-sans text-xs outline-none focus:border-slate-500 transition-colors shadow-inner"
     />
    </div>
   </div>

   <!-- Category Filter Pills -->
   <div class="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2 font-sans">
    @for (cat of getCategories(); track cat.id) {
     <button
      (click)="activeCategory = cat.id"
      [class.bg-slate-200]="activeCategory === cat.id"
      [class.text-slate-950]="activeCategory === cat.id"
      [class.font-semibold]="activeCategory === cat.id"
      [class.border-slate-300]="activeCategory === cat.id"
      [class.text-slate-300]="activeCategory !== cat.id"
      [class.bg-obsidian-900]="activeCategory !== cat.id"
      [class.border-obsidian-750]="activeCategory !== cat.id"
      [class.hover:text-slate-50]="activeCategory !== cat.id"
      class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
     >
      {{ cat.label }} ({{ getCategoryCount(cat.id) }})
     </button>
    }
   </div>

   <!-- Services Grid -->
   <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
    @for (srv of filteredServices; track srv.id) {
     <div class="p-5 rounded-2xl bg-obsidian-850/80 border border-obsidian-750 hover:border-obsidian-600 transition-all flex flex-col justify-between group shadow-xl">
      
      <div class="space-y-3.5">
       
       <!-- Screenshot Thumbnail Preview with Lightbox Trigger -->
       <div 
        (click)="selectedServicePhoto.set(srv)"
        class="relative aspect-video w-full rounded-xl overflow-hidden bg-obsidian-950 border border-obsidian-750 cursor-pointer group-hover:border-obsidian-600 transition-all shadow-inner"
       >
        <img 
         [src]="srv.photo || ('photos/services/' + srv.id + '.png')" 
         [alt]="srv.name" 
         class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
         (error)="onScreenshotError($event)"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent"></div>
        <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-obsidian-900/90 border border-obsidian-700 font-sans text-[10px] text-slate-200 font-semibold flex items-center gap-1 shadow">
         <span>Screenshot HD</span>
         <span>↗</span>
        </div>
       </div>

       <!-- Top Row: Icon & Status -->
       <div class="flex items-start justify-between gap-3 pt-1">
        <div class="flex items-center gap-3">
         <div class="w-10 h-10 rounded-xl bg-obsidian-900 border border-obsidian-750 p-2 flex items-center justify-center shrink-0">
          <img [src]="'icons/' + srv.icon + '.svg'" [alt]="srv.name" class="w-full h-full object-contain" (error)="onImgError($event)" />
         </div>
         <div>
          <h3 class="font-sans font-bold text-slate-50 text-base group-hover:text-slate-200 transition-colors">
           {{ srv.name }}
          </h3>
          <div class="text-[11px] font-sans text-slate-400">
           {{ srv.domain }}
          </div>
         </div>
        </div>

        
       </div>

       <!-- Description -->
       <p class="text-xs text-slate-300 leading-relaxed font-sans font-normal line-clamp-2">
        {{ (ts.isRomanian && srv.descriptionRo) ? srv.descriptionRo : srv.description }}
       </p>

       <!-- Tags -->
       @if (srv.tags && srv.tags.length > 0) {
        <div class="flex flex-wrap gap-1.5 pt-0.5">
         @for (tag of srv.tags; track tag) {
          <span class="text-[10px] font-sans px-2 py-0.5 rounded-md bg-obsidian-900/90 border border-obsidian-750 text-slate-400 font-medium">
           #{{ tag }}
          </span>
         }
        </div>
       }

       <!-- Hardware Allocations -->
       <div class="grid grid-cols-2 gap-2 pt-1 font-sans text-[11px]">
        <div class="p-2 rounded-lg bg-obsidian-900 border border-obsidian-750">
         <div class="text-[9px] text-slate-400 uppercase">{{ ts.t.srvRamCeiling }}</div>
         <div class="font-semibold text-slate-100">{{ srv.ram }}</div>
        </div>
        <div class="p-2 rounded-lg bg-obsidian-900 border border-obsidian-750">
         <div class="text-[9px] text-slate-400 uppercase">{{ ts.t.srvStoragePool }}</div>
         <div class="font-bold text-slate-200">{{ srv.storage }}</div>
        </div>
       </div>

       <div class="p-2 rounded-lg bg-obsidian-900 border border-obsidian-750 font-sans text-[11px] text-slate-300 flex items-center justify-between">
        <span class="truncate">{{ srv.node }}</span>
        @if (srv.port > 0) {
         <span class="text-slate-200 font-semibold">:{{ srv.port }}</span>
        }
       </div>
       </div>

      </div>
    }
   </div>

   <!-- Service Screenshot Lightbox Modal -->
   @if (selectedServicePhoto(); as s) {
    <div 
     (click)="selectedServicePhoto.set(null)"
     class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
     <div 
      (click)="$event.stopPropagation()"
      class="max-w-5xl w-full bg-obsidian-900 border border-obsidian-750 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
     >
      <!-- Modal Header -->
      <div class="p-4 sm:p-5 border-b border-obsidian-750 flex items-center justify-between bg-obsidian-950 font-sans">
       <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-obsidian-900 border border-obsidian-750 p-2 flex items-center justify-center">
         <img [src]="'icons/' + s.icon + '.svg'" [alt]="s.name" class="w-full h-full object-contain" (error)="onImgError($event)" />
        </div>
        <div>
         <span class="text-[10px] font-sans text-slate-300 uppercase tracking-wider">{{ s.category }} · {{ s.node }}</span>
         <h3 class="text-lg font-bold text-slate-100">{{ s.name }}</h3>
        </div>
       </div>
       <button 
        (click)="selectedServicePhoto.set(null)"
        class="w-8 h-8 rounded-full bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 flex items-center justify-center text-sm font-sans transition-colors"
        aria-label="Close"
       >&times;</button>
      </div>

      <!-- Modal Image -->
      <div class="flex-1 overflow-auto p-2 bg-black flex items-center justify-center">
       <img [src]="s.photo || ('photos/services/' + s.id + '.png')" [alt]="s.name" class="max-w-full max-h-[65vh] object-contain rounded-lg" />
      </div>

      <!-- Modal Footer Details -->
      <div class="p-4 sm:p-5 border-t border-obsidian-750 bg-obsidian-950 font-sans text-xs text-slate-300 flex flex-col sm:flex-row justify-between gap-3">
       <p class="leading-relaxed max-w-2xl">{{ (ts.isRomanian && s.descriptionRo) ? s.descriptionRo : s.description }}</p>
       <div class="font-sans text-slate-300 self-start sm:self-auto flex items-center gap-2">
        <span>{{ s.ip }}:{{ s.port }}</span>
        <span class="text-slate-500">|</span>
        <span class="text-slate-400">{{ s.domain }}</span>
       </div>
      </div>
     </div>
    </div>
   }

  </section>
 `
})
export class ServiceMatrixComponent {
 @Output() nodeFocused = new EventEmitter<TopologyNode>();

 ts = inject(TranslationService);
 services: ServiceItem[] = SERVICES_DATA;
 searchQuery = '';
 activeCategory = 'all';
 selectedServicePhoto = signal<ServiceItem | null>(null);

 getCategories() {
  return [
   { id: 'all', label: this.ts.t.srvCatAll },
   { id: 'core', label: this.ts.t.srvCatCore },
   { id: 'storage', label: this.ts.t.srvCatStorage },
   { id: 'media', label: this.ts.t.srvCatMedia },
   { id: 'monitoring', label: this.ts.t.srvCatMonitoring },
   { id: 'security', label: this.ts.t.srvCatSecurity },
   { id: 'automation', label: this.ts.t.srvCatAutomation },
   { id: 'cyber', label: this.ts.t.srvCatCyber }
  ];
 }

 getCategoryCount(catId: string): number {
  if (catId === 'all') return this.services.length;
  return this.services.filter(s => s.category === catId).length;
 }

 get filteredServices(): ServiceItem[] {
  return this.services.filter(s => {
   const matchCat = this.activeCategory === 'all' || s.category === this.activeCategory;
   const q = this.searchQuery.toLowerCase().trim();
   const matchSearch = !q ||
    s.name.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q) ||
    s.node.toLowerCase().includes(q) ||
    s.domain.toLowerCase().includes(q) ||
    String(s.port).includes(q);

   return matchCat && matchSearch;
  });
 }

 onSearch(e: Event) {
  this.searchQuery = (e.target as HTMLInputElement).value;
 }

 onImgError(e: Event) {
  (e.target as HTMLElement).style.display = 'none';
 }

 onScreenshotError(e: Event) {
  (e.target as HTMLElement).style.display = 'none';
 }

 focusNodeInTopology(srv: ServiceItem) {
  const found = TOPOLOGY_NODES.find(n =>
   n.id === srv.id ||
   n.name.toLowerCase().includes(srv.name.toLowerCase()) ||
   (n.port && n.port === srv.port)
  );
  if (found) {
   this.nodeFocused.emit(found);
   const topEl = document.getElementById('topology-section');
   if (topEl) topEl.scrollIntoView({ behavior: 'smooth' });
  }
 }
}
