import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  NgZone,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopologyNode, TopologyLink, TOPOLOGY_NODES, TOPOLOGY_LINKS } from '../../data/topology.data';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-topology-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="topology-section" class="w-full space-y-5 font-sans">
      
      <!-- Section Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div class="space-y-2.5">
          <div class="inline-flex items-center gap-2 rounded-[30px] bg-[#52212e] px-3 py-0.5 text-[11px] font-mono text-[#efebe5]">
            <span class="h-1.5 w-1.5 rounded-[2px] bg-[#efebe5]"></span>
            <span>{{ ts.t.topologyTag }}</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-display text-[#efebe5] font-normal tracking-[-0.025em]">
            Spatial 3D
            <span class="font-light italic text-[#d9d1ca]">Topology Visualization.</span>
          </h2>
        </div>
        <div class="text-xs text-[#827470] font-sans max-w-sm text-right leading-relaxed hidden sm:block">
          {{ ts.t.topologyDesc }}
        </div>
      </div>

      <!-- Main 3D Container Card -->
      <div class="relative w-full h-[620px] bg-[#0c0c0c] rounded-[16px] overflow-hidden border border-[#24181e] shadow-[0_24px_60px_rgba(0,0,0,0.65)] flex flex-col select-none">
        <!-- Subtle Radial Burgundy Glow -->
        <div
          class="pointer-events-none absolute inset-0 opacity-35"
          style="background: radial-gradient(circle at 50% 45%, rgba(82, 33, 46, 0.45) 0%, transparent 65%);"
        ></div>
        
        <!-- Top Controls & Subsystem Filters Bar -->
        <div class="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          
          <!-- Filter Categories -->
          <div class="flex items-center gap-1.5 p-1.5 rounded-tl-[14px] rounded-br-[14px] bg-[#140b0f]/95 backdrop-blur-md border border-[#24181e] pointer-events-auto shadow-xl overflow-x-auto max-w-full">
            @for (cat of getCategories(); track cat.id) {
              <button
                (click)="selectCategory(cat.id)"
                [ngClass]="activeCategory === cat.id
                  ? 'bg-[#efebe5] text-[#0c0c0c] font-semibold border-[#efebe5]'
                  : 'border-transparent text-[#d9d1ca] hover:text-[#efebe5] hover:bg-[#401823]/60'"
                class="px-3 py-1.5 rounded-tl-[8px] rounded-br-[8px] text-xs font-mono transition-all border whitespace-nowrap"
              >
                {{ cat.label }}
              </button>
            }
          </div>

          <!-- Controls (Logical/Physical, Rotate, Reset) -->
          <div class="flex items-center gap-2 pointer-events-auto font-mono text-xs">
            
            <!-- Logical / Physical Toggle -->
            <div class="flex items-center p-1 rounded-tl-[12px] rounded-br-[12px] bg-[#140b0f]/95 backdrop-blur-md border border-[#24181e] shadow-xl font-medium">
              <button
                (click)="setPerspective('logical')"
                [ngClass]="perspective === 'logical'
                  ? 'bg-[#401823] text-[#efebe5] border-[#52212e]'
                  : 'text-[#827470] border-transparent hover:text-[#efebe5]'"
                class="px-3 py-1 rounded-tl-[8px] rounded-br-[8px] transition-all border"
              >
                {{ ts.t.btnLogical }}
              </button>
              <button
                (click)="setPerspective('physical')"
                [ngClass]="perspective === 'physical'
                  ? 'bg-[#401823] text-[#efebe5] border-[#52212e]'
                  : 'text-[#827470] border-transparent hover:text-[#efebe5]'"
                class="px-3 py-1 rounded-tl-[8px] rounded-br-[8px] transition-all border"
              >
                {{ ts.t.btnPhysical }}
              </button>
            </div>

            <!-- Auto-Rotate -->
            <button
              (click)="toggleAutoRotate()"
              [ngClass]="isAutoRotating
                ? 'border-[#52212e] bg-[#401823] text-[#efebe5]'
                : 'border-[#24181e] bg-[#140b0f]/95 text-[#827470]'"
              class="px-3.5 py-1.5 rounded-tl-[12px] rounded-br-[12px] backdrop-blur-md border hover:border-[#52212e] transition-all flex items-center gap-2 shadow-xl font-mono"
            >
              <span class="w-2 h-2 rounded-[2px]" [class.bg-[#efebe5]]="isAutoRotating" [class.bg-[#827470]]="!isAutoRotating"></span>
              <span>{{ ts.t.btnRotate }}</span>
            </button>

            <!-- Reset -->
            <button
              (click)="resetCamera()"
              class="px-3.5 py-1.5 rounded-tl-[12px] rounded-br-[12px] bg-[#140b0f]/95 backdrop-blur-md border border-[#24181e] hover:border-[#52212e] text-[#d9d1ca] hover:text-[#efebe5] transition-all shadow-xl"
            >
              {{ ts.t.btnReset }}
            </button>
          </div>
        </div>

        <!-- 3D Interactive Canvas -->
        <canvas
          #canvasRef
          class="relative z-10 w-full h-full flex-1 cursor-grab active:cursor-grabbing block"
          (mousedown)="onMouseDown($event)"
          (mousemove)="onMouseMove($event)"
          (mouseup)="onMouseUp($event)"
          (mouseleave)="onMouseUp($event)"
          (wheel)="onWheel($event)"
        ></canvas>

        <!-- Bottom Status HUD -->
        <div class="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex items-center justify-between font-mono text-xs">
          <div class="flex items-center gap-2 text-[#d9d1ca] font-medium bg-[#140b0f]/90 border border-[#24181e] px-3 py-1.5 rounded-tl-[10px] rounded-br-[10px]">
            <span class="w-2 h-2 rounded-[2px] bg-[#efebe5]"></span>
            <span class="tracking-wide">{{ ts.t.meshActive }} | {{ nodes.length }} {{ ts.t.nodesLabel }} | {{ links.length }} {{ ts.t.flowsLabel }}</span>
          </div>

          <div class="text-[#827470] text-[11px] uppercase tracking-wider hidden sm:block font-mono">
            {{ ts.t.interactionHint }}
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class TopologyCanvasComponent implements OnInit, OnDestroy {
  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() selectedNode: TopologyNode | null = null;
  @Input() activeCategory: string = 'all';
  @Input() perspective: 'logical' | 'physical' = 'logical';

  @Output() nodeSelected = new EventEmitter<TopologyNode | null>();
  @Output() categoryChanged = new EventEmitter<string>();
  @Output() perspectiveChanged = new EventEmitter<'logical' | 'physical'>();

  ts = inject(TranslationService);

  nodes: TopologyNode[] = TOPOLOGY_NODES;
  links: TopologyLink[] = TOPOLOGY_LINKS;

  getCategories() {
    return [
      { id: 'all', label: this.ts.t.catAll },
      { id: 'compute', label: this.ts.t.catCompute },
      { id: 'network', label: this.ts.t.catNetwork },
      { id: 'security', label: this.ts.t.catSecurity },
      { id: 'services', label: this.ts.t.catServices },
      { id: 'elo', label: this.ts.t.catElo },
      { id: 'storage', label: this.ts.t.catStorage },
      { id: 'edge', label: this.ts.t.catEdge }
    ];
  }

  isAutoRotating = true;
  private animationFrameId: number | null = null;

  // 3D Camera Angles matching exact screenshot
  private angleX = 0.42;
  private angleY = -0.32;
  private zoom = 1.0;
  private fov = 680;
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private hoveredNode: TopologyNode | null = null;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.handleResize();
    window.addEventListener('resize', this.onWindowResize);

    this.ngZone.runOutsideAngular(() => {
      this.render();
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private onWindowResize = () => {
    this.handleResize();
  };

  selectCategory(catId: string) {
    this.activeCategory = catId;
    this.categoryChanged.emit(catId);
  }

  setPerspective(mode: 'logical' | 'physical') {
    this.perspective = mode;
    this.perspectiveChanged.emit(mode);
  }

  toggleAutoRotate() {
    this.isAutoRotating = !this.isAutoRotating;
  }

  resetCamera() {
    this.angleX = 0.42;
    this.angleY = -0.32;
    this.zoom = 1.0;
    this.activeCategory = 'all';
    this.categoryChanged.emit('all');
    this.nodeSelected.emit(null);
  }

  private handleResize() {
    const canvas = this.canvasRef?.nativeElement;
    const parent = canvas?.parentElement;
    if (canvas && parent) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
    }
  }

  private project3D(x: number, y: number, z: number, cx: number, cy: number) {
    x *= this.zoom;
    y *= this.zoom;
    z *= this.zoom;

    // Rotate Y
    const cosY = Math.cos(this.angleY);
    const sinY = Math.sin(this.angleY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    // Rotate X
    const cosX = Math.cos(this.angleX);
    const sinX = Math.sin(this.angleX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    const distance = this.fov + z2 + 320;
    const scale = distance > 10 ? this.fov / distance : 0.01;

    return {
      px: cx + x1 * scale,
      py: cy + y2 * scale,
      scale: Math.max(0.2, scale),
      zOrder: z2
    };
  }

  private render = () => {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const cx = width / 2;
    const cy = height / 2 + 15;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Draw Subtle Burgundy/Ivory Perspective Floor Grid
    ctx.strokeStyle = 'rgba(217, 209, 202, 0.05)';
    ctx.lineWidth = 1;
    const floorY = 220;
    for (let gx = -380; gx <= 380; gx += 65) {
      const pStart = this.project3D(gx, floorY, -380, cx, cy);
      const pEnd = this.project3D(gx, floorY, 380, cx, cy);
      ctx.beginPath();
      ctx.moveTo(pStart.px, pStart.py);
      ctx.lineTo(pEnd.px, pEnd.py);
      ctx.stroke();
    }
    for (let gz = -380; gz <= 380; gz += 65) {
      const pStart = this.project3D(-380, floorY, gz, cx, cy);
      const pEnd = this.project3D(380, floorY, gz, cx, cy);
      ctx.beginPath();
      ctx.moveTo(pStart.px, pStart.py);
      ctx.lineTo(pEnd.px, pEnd.py);
      ctx.stroke();
    }

    const now = Date.now() * 0.002;

    // Draw Vector Edges and Data Stream Packets
    this.links.forEach((link, idx) => {
      const fromNode = this.nodes.find(n => n.id === link.from);
      const toNode = this.nodes.find(n => n.id === link.to);
      if (!fromNode || !toNode) return;

      const isFiltered = this.isLinkActive(fromNode, toNode);
      const alpha = isFiltered ? 0.65 : 0.06;

      const p1 = this.project3D(fromNode.x, fromNode.y, fromNode.z, cx, cy);
      const p2 = this.project3D(toNode.x, toNode.y, toNode.z, cx, cy);

      ctx.beginPath();
      ctx.strokeStyle = link.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = Math.max(0.8, (isFiltered ? 1.8 : 0.8) * p1.scale);
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Animate Packet Pulses
      if (isFiltered) {
        const progress = (now + idx * 0.22) % 1;
        const packetX = p1.px + (p2.px - p1.px) * progress;
        const packetY = p1.py + (p2.py - p1.py) * progress;

        ctx.beginPath();
        ctx.arc(packetX, packetY, Math.max(1.8, 3.2 * p1.scale), 0, Math.PI * 2);
        ctx.fillStyle = '#efebe5';
        ctx.shadowColor = link.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Project and Depth-Sort Nodes
    const projectedNodes = this.nodes.map(n => {
      const p = this.project3D(n.x, n.y, n.z, cx, cy);
      const isSelected = this.selectedNode?.id === n.id;
      const isHovered = this.hoveredNode?.id === n.id;
      const isActive = this.isNodeActive(n);
      return { ...n, ...p, isSelected, isHovered, isActive };
    }).sort((a, b) => b.zOrder - a.zOrder);

    // Draw Spheres and Typography
    projectedNodes.forEach(node => {
      const baseRadius = node.tier <= 2 ? 13 : 9.5;
      const radius = Math.max(4.5, baseRadius * node.scale);
      const alpha = node.isActive ? 1.0 : 0.2;

      ctx.globalAlpha = alpha;

      // Outer Selection Ring & Glow
      if (node.isSelected || node.isHovered) {
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#efebe5';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.px, node.py, radius + 10, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.14;
        ctx.fill();
        ctx.globalAlpha = alpha;
      }

      // Solid Node Sphere with Color Glow
      ctx.beginPath();
      ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.shadowColor = node.color;
      ctx.shadowBlur = node.isActive ? 10 : 2;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Center bright specular core
      ctx.beginPath();
      ctx.arc(node.px, node.py, Math.max(1.5, radius * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = '#efebe5';
      ctx.fill();

      // Node Typography Label
      const shouldDrawLabel = node.tier <= 2 || node.isSelected || node.isHovered || (this.activeCategory !== 'all' && node.isActive) || node.scale > 0.85;

      if (shouldDrawLabel) {
        const fontSize = Math.max(9, Math.round(11 * node.scale));
        ctx.font = `500 ${fontSize}px "IBM Plex Mono", monospace`;
        ctx.textAlign = 'center';

        // Drop shadow for crisp readability
        ctx.shadowColor = '#0c0c0c';
        ctx.shadowBlur = 4;
        ctx.fillStyle = node.isSelected ? '#efebe5' : node.isHovered ? '#efebe5' : 'rgba(239, 235, 229, 0.92)';
        ctx.fillText(node.name, node.px, node.py + radius + 13);
        ctx.shadowBlur = 0;

        if (node.isSelected || node.isHovered) {
          const subFontSize = Math.max(8, Math.round(9 * node.scale));
          ctx.font = `400 ${subFontSize}px "IBM Plex Mono", monospace`;
          ctx.fillStyle = 'rgba(217, 209, 202, 0.85)';
          ctx.fillText(node.sublabel || node.ip, node.px, node.py + radius + 25);
        }
      }

      ctx.globalAlpha = 1.0;
    });

    ctx.restore();

    if (this.isAutoRotating && !this.isDragging) {
      this.angleY += 0.0014;
    }

    this.animationFrameId = requestAnimationFrame(this.render);
  };

  private isNodeActive(node: TopologyNode): boolean {
    if (this.selectedNode && this.selectedNode.id === node.id) return true;
    if (this.selectedNode && this.selectedNode.connections.includes(node.id)) return true;

    if (this.perspective === 'physical') {
      return node.tier <= 2 || node.tier === 6;
    }

    if (this.activeCategory === 'all') return true;
    return node.category === this.activeCategory;
  }

  private isLinkActive(from: TopologyNode, to: TopologyNode): boolean {
    return this.isNodeActive(from) && this.isNodeActive(to);
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  onMouseMove(e: MouseEvent) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2 + 15;

    let hovered: TopologyNode | null = null;
    for (const node of this.nodes) {
      const p = this.project3D(node.x, node.y, node.z, cx, cy);
      const dist = Math.hypot(p.px - mouseX, p.py - mouseY);
      if (dist < 20) {
        hovered = node;
        break;
      }
    }
    this.hoveredNode = hovered;

    if (this.isDragging) {
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;
      this.angleY += deltaX * 0.006;
      this.angleX = Math.max(-0.9, Math.min(0.9, this.angleX + deltaY * 0.006));
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  }

  onMouseUp(e: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
    }

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2 + 15;

    let clicked: TopologyNode | null = null;
    for (const node of this.nodes) {
      const p = this.project3D(node.x, node.y, node.z, cx, cy);
      const dist = Math.hypot(p.px - mouseX, p.py - mouseY);
      if (dist < 22) {
        clicked = node;
        break;
      }
    }

    if (clicked) {
      this.ngZone.run(() => {
        this.selectedNode = clicked;
        this.nodeSelected.emit(clicked);
      });
    }
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    this.zoom = Math.max(0.5, Math.min(2.2, this.zoom + delta));
  }
}
