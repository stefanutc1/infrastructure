import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header';
import { OverviewComponent } from './components/overview/overview';
import { TopologyCanvasComponent } from './components/topology-canvas/topology';
import { NodeInspectorComponent } from './components/node-inspector/inspector';
import { ServiceMatrixComponent } from './components/service-matrix/matrix';
import { HardwareFleetComponent } from './components/hardware-fleet/hardware';
import { ArchitectureBlueprintComponent } from './components/architecture-blueprint/blueprint';
import { AboutGalleryComponent } from './components/about-gallery/gallery';
import { CommandPaletteComponent } from './components/command-palette/palette';
import { NetworkViewComponent } from './components/network-view/network';
import { ActiveDirectoryComponent } from './components/active-directory/ad';
import { BachelorThesisComponent } from './components/bachelor-thesis/thesis';
import { CyberCasesComponent } from './components/cyber-cases/cases';
import { IacCicdComponent } from './components/iac-cicd/pipeline';
import { TopologyNode } from './data/topology.data';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    OverviewComponent,
    TopologyCanvasComponent,
    NodeInspectorComponent,
    HardwareFleetComponent,
    ServiceMatrixComponent,
    NetworkViewComponent,
    ActiveDirectoryComponent,
    BachelorThesisComponent,
    CyberCasesComponent,
    IacCicdComponent,
    AboutGalleryComponent,
    ArchitectureBlueprintComponent,
    CommandPaletteComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  @ViewChild(CommandPaletteComponent) commandPalette!: CommandPaletteComponent;

  ts = inject(TranslationService);
  selectedNode: TopologyNode | null = null;
  activeCategory: string = 'all';
  perspective: 'logical' | 'physical' = 'logical';

  onNodeSelected(node: TopologyNode | null) {
    this.selectedNode = node;
  }

  onCategoryChanged(cat: string) {
    this.activeCategory = cat;
  }

  onPerspectiveChanged(mode: 'logical' | 'physical') {
    this.perspective = mode;
  }

  openCommandPalette() {
    if (this.commandPalette) {
      this.commandPalette.open();
    }
  }
}
