import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';
import { CveAssessment, CVE_ASSESSMENTS_RO, CVE_ASSESSMENTS_EN } from '../../data/cve.data';

export interface ForensicCase {
  id: string;
  caseId: string;
  title: string;
  badge: string;
  classification: string;
  date: string;
  author: string;
  status: string;
  summary: string;
  attackVector: string;
  reverseFindings: string[];
  financialFlow: string;
  iocs: { type: string; value: string }[];
  datacenterDefense: string;
  repoPath: string;
  githubUrl: string;
  mitreAttack: string[];
}

@Component({
  selector: 'app-architecture-blueprint',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div id="cyber" class="relative -top-20"></div>
    <section id="blueprint" class="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      
      <!-- Section Header -->
      <div class="space-y-2 mb-8">
        <div class="text-xs font-sans font-bold tracking-widest text-slate-300 uppercase">
          {{ ts.t.bpTag }}
        </div>
        <h2 class="text-3xl sm:text-4xl font-serif font-normal text-slate-50 tracking-tight">
          {{ ts.t.bpTitle }}
        </h2>
        <p class="text-sm text-slate-300 max-w-3xl font-sans font-normal leading-relaxed">
          {{ ts.t.bpDesc }}
        </p>
      </div>

      <!-- Interactive Blueprint Tabs -->
      <div class="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2 font-sans">
        <button
          (click)="activeTab = 'cloud'"
          [class.bg-slate-200]="activeTab === 'cloud'"
          [class.text-slate-950]="activeTab === 'cloud'"
          [class.font-semibold]="activeTab === 'cloud'"
          [class.border-slate-300]="activeTab === 'cloud'"
          [class.text-slate-300]="activeTab !== 'cloud'"
          [class.bg-obsidian-900]="activeTab !== 'cloud'"
          [class.border-obsidian-750]="activeTab !== 'cloud'"
          [class.hover:text-slate-50]="activeTab !== 'cloud'"
          class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
        >
          {{ ts.isRomanian ? 'Multi-Cloud Hibrid & CI/CD (9 Fluxuri)' : 'Hybrid Multi-Cloud & CI/CD (9 Workflows)' }}
        </button>
        <button
          (click)="activeTab = 'vlan'"
          [class.bg-slate-200]="activeTab === 'vlan'"
          [class.text-slate-950]="activeTab === 'vlan'"
          [class.font-semibold]="activeTab === 'vlan'"
          [class.border-slate-300]="activeTab === 'vlan'"
          [class.text-slate-300]="activeTab !== 'vlan'"
          [class.bg-obsidian-900]="activeTab !== 'vlan'"
          [class.border-obsidian-750]="activeTab !== 'vlan'"
          [class.hover:text-slate-50]="activeTab !== 'vlan'"
          class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
        >
          {{ ts.isRomanian ? 'Matrice VLAN & Firewall' : 'VLAN & Firewall Matrix' }}
        </button>
        <button
          (click)="activeTab = 'power'"
          [class.bg-slate-200]="activeTab === 'power'"
          [class.text-slate-950]="activeTab === 'power'"
          [class.font-semibold]="activeTab === 'power'"
          [class.border-slate-300]="activeTab === 'power'"
          [class.text-slate-300]="activeTab !== 'power'"
          [class.bg-obsidian-900]="activeTab !== 'power'"
          [class.border-obsidian-750]="activeTab !== 'power'"
          [class.hover:text-slate-50]="activeTab !== 'power'"
          class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
        >
          {{ ts.isRomanian ? 'UPS & Telemetrie Energie' : 'UPS & Power Telemetry' }}
        </button>
        <button
          (click)="activeTab = 'storage'"
          [class.bg-slate-200]="activeTab === 'storage'"
          [class.text-slate-950]="activeTab === 'storage'"
          [class.font-semibold]="activeTab === 'storage'"
          [class.border-slate-300]="activeTab === 'storage'"
          [class.text-slate-300]="activeTab !== 'storage'"
          [class.bg-obsidian-900]="activeTab !== 'storage'"
          [class.border-obsidian-750]="activeTab !== 'storage'"
          [class.hover:text-slate-50]="activeTab !== 'storage'"
          class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
        >
          {{ ts.isRomanian ? 'Stocare ZFS & Pool-uri' : 'ZFS Storage Pools' }}
        </button>
        <button
          (click)="activeTab = 'cyber'"
          [class.bg-slate-200]="activeTab === 'cyber'"
          [class.text-slate-950]="activeTab === 'cyber'"
          [class.font-semibold]="activeTab === 'cyber'"
          [class.border-slate-300]="activeTab === 'cyber'"
          [class.text-slate-300]="activeTab !== 'cyber'"
          [class.bg-obsidian-900]="activeTab !== 'cyber'"
          [class.border-obsidian-750]="activeTab !== 'cyber'"
          [class.hover:text-slate-50]="activeTab !== 'cyber'"
          class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
        >
          {{ ts.t.tabCyber }}
        </button>
        <button
          (click)="activeTab = 'zerotrust'"
          [class.bg-slate-200]="activeTab === 'zerotrust'"
          [class.text-slate-950]="activeTab === 'zerotrust'"
          [class.font-semibold]="activeTab === 'zerotrust'"
          [class.border-slate-300]="activeTab === 'zerotrust'"
          [class.text-slate-300]="activeTab !== 'zerotrust'"
          [class.bg-obsidian-900]="activeTab !== 'zerotrust'"
          [class.border-obsidian-750]="activeTab !== 'zerotrust'"
          [class.hover:text-slate-50]="activeTab !== 'zerotrust'"
          class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
        >
          {{ ts.isRomanian ? 'Laborator Zero-Trust & GitOps' : 'Zero-Trust & GitOps Proving Ground' }}
        </button>
        <button
          (click)="activeTab = 'generator'"
          [class.bg-slate-200]="activeTab === 'generator'"
          [class.text-slate-950]="activeTab === 'generator'"
          [class.font-semibold]="activeTab === 'generator'"
          [class.border-slate-300]="activeTab === 'generator'"
          [class.text-slate-300]="activeTab !== 'generator'"
          [class.bg-obsidian-900]="activeTab !== 'generator'"
          [class.border-obsidian-750]="activeTab !== 'generator'"
          [class.hover:text-slate-50]="activeTab !== 'generator'"
          class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
        >
          {{ ts.isRomanian ? 'Generator IaC & Runbooks' : 'IaC Generator & Runbooks' }}
        </button>
        <button
          (click)="activeTab = 'chaos'"
          [class.bg-slate-200]="activeTab === 'chaos'"
          [class.text-slate-950]="activeTab === 'chaos'"
          [class.font-semibold]="activeTab === 'chaos'"
          [class.border-slate-300]="activeTab === 'chaos'"
          [class.text-slate-300]="activeTab !== 'chaos'"
          [class.bg-obsidian-900]="activeTab !== 'chaos'"
          [class.border-obsidian-750]="activeTab !== 'chaos'"
          [class.hover:text-slate-50]="activeTab !== 'chaos'"
          class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
        >
          {{ ts.isRomanian ? 'Ingineria Haosului & Reziliență' : 'Chaos & Resiliency' }}
        </button>
        <button
          (click)="activeTab = 'observability'"
          [class.bg-slate-200]="activeTab === 'observability'"
          [class.text-slate-950]="activeTab === 'observability'"
          [class.font-semibold]="activeTab === 'observability'"
          [class.border-slate-300]="activeTab === 'observability'"
          [class.text-slate-300]="activeTab !== 'observability'"
          [class.bg-obsidian-900]="activeTab !== 'observability'"
          [class.border-obsidian-750]="activeTab !== 'observability'"
          [class.hover:text-slate-50]="activeTab !== 'observability'"
          class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
        >
          {{ ts.isRomanian ? 'Observabilitate LGTM & SLO' : 'LGTM & SLO Metrics' }}
        </button>
        <button
          (click)="activeTab = 'glossary'"
          [class.bg-slate-200]="activeTab === 'glossary'"
          [class.text-slate-950]="activeTab === 'glossary'"
          [class.font-semibold]="activeTab === 'glossary'"
          [class.border-slate-300]="activeTab === 'glossary'"
          [class.text-slate-300]="activeTab !== 'glossary'"
          [class.bg-obsidian-900]="activeTab !== 'glossary'"
          [class.border-obsidian-750]="activeTab !== 'glossary'"
          [class.hover:text-slate-50]="activeTab !== 'glossary'"
          class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap"
        >
          {{ ts.isRomanian ? 'Glosar Tehnic' : 'Technical Glossary' }}
        </button>
      </div>

      <!-- TAB: MULTI-CLOUD & CI/CD QUALITY MATRIX -->
      @if (activeTab === 'cloud') {
        <div class="space-y-8">
          
          <!-- Cloud Providers Grid -->
          <div class="space-y-3">
            <h3 class="text-base font-sans font-bold text-slate-100 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-slate-400"></span>
              {{ ts.isRomanian ? 'Infrastructură Multi-Cloud Hibridă (Terraform Declarativ)' : 'Hybrid Multi-Cloud Infrastructure (Declarative Terraform)' }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <!-- Azure -->
              <div class="p-5 rounded-2xl bg-obsidian-850/90 border border-obsidian-750 space-y-3 hover:border-blue-500/50 transition-colors">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-blue-400">MICROSOFT AZURE</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800">Archive Tier / HSM</span>
                </div>
                <div class="text-sm font-semibold text-slate-100">
                  {{ ts.isRomanian ? 'Key Vault HSM & Recuperare în Caz de Dezastru' : 'Key Vault HSM & Disaster Recovery' }}
                </div>
                <ul class="text-xs text-slate-300 space-y-1.5 font-sans">
                  <li>• <strong>Azure Key Vault</strong>: {{ ts.isRomanian ? 'Cloud HSM backup pentru Step-CA Root CA & chei LUKS Tang/Clevis.' : 'Cloud HSM backup for Step-CA Root CA & LUKS Tang/Clevis escrow keys.' }}</li>
                  <li>• <strong>Blob Storage Archive Tier</strong>: {{ ts.isRomanian ? 'Snapshot-uri ZFS criptate cu cost aproape de zero.' : 'Encrypted ZFS snapshots at near-zero cold storage cost.' }}</li>
                  <li>• <strong>Entra ID Application</strong>: {{ ts.isRomanian ? 'SAML/OIDC federat cu Authentik pentru SSO Enterprise.' : 'SAML/OIDC federated with Authentik for enterprise SSO.' }}</li>
                  <li>• <strong>Azure Arc</strong>: {{ ts.isRomanian ? 'Onboarding nod fizic în Microsoft Defender for Cloud.' : 'Onboarding physical compute into Microsoft Defender for Cloud.' }}</li>
                </ul>
              </div>

              <!-- GCP -->
              <div class="p-5 rounded-2xl bg-obsidian-850/90 border border-obsidian-750 space-y-3 hover:border-obsidian-600 transition-colors">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-slate-300">GOOGLE CLOUD (GCP)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-obsidian-850 text-slate-300 border border-obsidian-700">WORM / OIDC Keyless</span>
                </div>
                <div class="text-sm font-semibold text-slate-100">
                  {{ ts.isRomanian ? 'Stocare WORM & Workload Identity' : 'WORM Storage & Workload Identity' }}
                </div>
                <ul class="text-xs text-slate-300 space-y-1.5 font-sans">
                  <li>• <strong>GCS Object Locking (WORM)</strong>: {{ ts.isRomanian ? 'Backup imutabil anti-ransomware pentru PBS și Restic.' : 'Immutable ransomware-proof storage lock for PBS & Restic.' }}</li>
                  <li>• <strong>Workload Identity Federation</strong>: {{ ts.isRomanian ? 'CI/CD keyless fără fișiere credentials.json statice.' : 'Keyless CI/CD without static credentials.json keys.' }}</li>
                  <li>• <strong>Cloud DNS Managed Zone</strong>: {{ ts.isRomanian ? 'Fallback extern split-horizon cu suport DNSSEC.' : 'External split-horizon fallback with DNSSEC validation.' }}</li>
                  <li>• <strong>BigQuery Security Sink</strong>: {{ ts.isRomanian ? 'Export telemetrie honeypots T-Pot & Wazuh SIEM.' : 'Security telemetry export from T-Pot honeypots & Wazuh SIEM.' }}</li>
                </ul>
              </div>

              <!-- AWS -->
              <div class="p-5 rounded-2xl bg-obsidian-850/90 border border-obsidian-750 space-y-3 hover:border-amber-500/50 transition-colors">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-amber-400">AMAZON WEB SERVICES</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800">Glacier Deep Archive</span>
                </div>
                <div class="text-sm font-semibold text-slate-100">
                  {{ ts.isRomanian ? 'Stocare la Rece & IAM AssumeRole' : 'Cold Storage & IAM AssumeRole' }}
                </div>
                <ul class="text-xs text-slate-300 space-y-1.5 font-sans">
                  <li>• <strong>S3 Glacier Deep Archive</strong>: {{ ts.isRomanian ? 'Retenție 365 zile pentru arhive reci criptate.' : '365-day cold compliance retention for encrypted archives.' }}</li>
                  <li>• <strong>Object Lock Compliance</strong>: {{ ts.isRomanian ? 'Blocare strictă la ștergere pe perioada de retenție.' : 'Strict non-deletable retention lock during disaster recovery cycle.' }}</li>
                  <li>• <strong>IAM OIDC Provider</strong>: {{ ts.isRomanian ? 'Autentificare GitHub Actions cu roluri least-privilege.' : 'GitHub Actions least-privilege assume-role authentication.' }}</li>
                  <li>• <strong>Site-to-Site VPN Gateway</strong>: {{ ts.isRomanian ? 'Conexiune IPsec dedicată cu firewall-ul OPNsense.' : 'Dedicated IPsec encrypted tunnel connected to OPNsense.' }}</li>
                </ul>
              </div>

            </div>
          </div>

          <!-- CI/CD Workflows Table -->
          <div class="space-y-3">
            <h3 class="text-base font-sans font-bold text-slate-100 flex items-center justify-between">
              <span class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                {{ ts.isRomanian ? 'Matrice CI/CD Enterprise (9 Fluxuri Automate · 36+ Verificări Paralele)' : 'Enterprise CI/CD Matrix (9 Automated Workflows · 36+ Parallel Checks)' }}
              </span>
              <span class="text-xs font-mono text-slate-300">GitHub Actions CI/CD</span>
            </h3>
            
            <div class="rounded-2xl bg-obsidian-850/90 border border-obsidian-750 shadow-xl overflow-hidden font-mono text-xs">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-obsidian-750 bg-obsidian-900 text-slate-300 text-[11px] uppercase tracking-wider">
                      <th class="p-4">{{ ts.isRomanian ? 'Flux GitHub Actions' : 'GitHub Actions Workflow' }}</th>
                      <th class="p-4">{{ ts.isRomanian ? 'Tip Pipeline' : 'Pipeline Type' }}</th>
                      <th class="p-4">{{ ts.isRomanian ? 'Garanții de Calitate & Verificări' : 'Quality Guarantees & Verification' }}</th>
                      <th class="p-4">{{ ts.isRomanian ? 'Frecvență / Declanșator' : 'Frequency / Trigger' }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-obsidian-750/70">
                    <tr class="hover:bg-obsidian-750/40 transition-colors">
                      <td class="p-4 font-bold text-slate-300 whitespace-nowrap">homelab-ci-cd-matrix.yml</td>
                      <td class="p-4 text-slate-200">{{ ts.isRomanian ? 'Matrice Calitate' : 'Quality Matrix' }}</td>
                      <td class="p-4 text-slate-300">{{ ts.isRomanian ? 'Terraform Fmt & Validate, Checkov IaC, Trivy, Docker Compose, ShellCheck, Secret Leakage, Angular Build' : 'Terraform Fmt & Validate, Checkov IaC, Trivy, Docker Compose, ShellCheck, Secret Leakage, Angular Build' }}</td>
                      <td class="p-4 text-slate-400">Push / PR / Dispatch</td>
                    </tr>
                    <tr class="hover:bg-obsidian-750/40 transition-colors">
                      <td class="p-4 font-bold text-slate-300 whitespace-nowrap">ci.yml</td>
                      <td class="p-4 text-slate-200">{{ ts.isRomanian ? 'Pipeline CI Central' : 'Core CI Pipeline' }}</td>
                      <td class="p-4 text-slate-300">{{ ts.isRomanian ? 'Gitleaks & TruffleHog Secrets, Ruff Lint, MyPy Types, Bandit SAST, Semgrep, Sintaxă Ansible, Kubeconform' : 'Gitleaks & TruffleHog Secrets, Ruff Lint, MyPy Types, Bandit SAST, Semgrep, Ansible Syntax, Kubeconform' }}</td>
                      <td class="p-4 text-slate-400">Push / PR</td>
                    </tr>
                    <tr class="hover:bg-obsidian-750/40 transition-colors">
                      <td class="p-4 font-bold text-slate-300 whitespace-nowrap">cd.yml</td>
                      <td class="p-4 text-slate-200">{{ ts.isRomanian ? 'Livrare Continuă' : 'Continuous Deploy' }}</td>
                      <td class="p-4 text-slate-300">{{ ts.isRomanian ? 'Sincronizare GitOps, Împachetare Imagini Container (GHCR), Verificare Rollback' : 'GitOps Synchronization, Container Image Packaging (GHCR), Rollback Verification' }}</td>
                      <td class="p-4 text-slate-400">Push to main</td>
                    </tr>
                    <tr class="hover:bg-obsidian-750/40 transition-colors">
                      <td class="p-4 font-bold text-slate-300 whitespace-nowrap">container-scan.yml</td>
                      <td class="p-4 text-slate-200">{{ ts.isRomanian ? 'Securitate / CVE' : 'Security / CVE' }}</td>
                      <td class="p-4 text-slate-300">{{ ts.isRomanian ? 'Scanare Vulnerabilități Imagini Containere Trivy & Conformitate CIS Dockle' : 'Trivy & Dockle Container Image Vulnerability & CIS Benchmark Scanning' }}</td>
                      <td class="p-4 text-slate-400">Push / Scheduled</td>
                    </tr>
                    <tr class="hover:bg-obsidian-750/40 transition-colors">
                      <td class="p-4 font-bold text-slate-300 whitespace-nowrap">security-scan.yml</td>
                      <td class="p-4 text-slate-200">{{ ts.isRomanian ? 'Securitate SAST' : 'SAST Security' }}</td>
                      <td class="p-4 text-slate-300">{{ ts.isRomanian ? 'Motor GitHub CodeQL, Analiză Statică Avansată a Vulnerabilităților (Python & TypeScript)' : 'GitHub CodeQL Engine, Advanced Security Static Analysis (Python & TypeScript)' }}</td>
                      <td class="p-4 text-slate-400">Weekly / Push</td>
                    </tr>
                    <tr class="hover:bg-obsidian-750/40 transition-colors">
                      <td class="p-4 font-bold text-slate-300 whitespace-nowrap">security-scheduled.yml</td>
                      <td class="p-4 text-slate-200">{{ ts.isRomanian ? 'Audit Nocturn' : 'Nightly Audit' }}</td>
                      <td class="p-4 text-slate-300">{{ ts.isRomanian ? 'Audit Programat Nocturn pentru Dependențe (Pip-Audit, NPM Audit, Trivy FS)' : 'Nightly Dependency Vulnerability Audits (Pip-Audit, NPM Audit, Trivy FS)' }}</td>
                      <td class="p-4 text-slate-400">Cron (02:00 UTC)</td>
                    </tr>
                    <tr class="hover:bg-obsidian-750/40 transition-colors">
                      <td class="p-4 font-bold text-slate-300 whitespace-nowrap">deploy-pages.yml</td>
                      <td class="p-4 text-slate-200">{{ ts.isRomanian ? 'CD Pagini Statice' : 'Static Pages CD' }}</td>
                      <td class="p-4 text-slate-300">{{ ts.isRomanian ? 'Build Producție Angular 19 & Publicare Zero-Downtime pe GitHub Pages' : 'Angular 19 Production Build & GitHub Pages Zero-Downtime Deployment' }}</td>
                      <td class="p-4 text-slate-400">Push to main</td>
                    </tr>
                    <tr class="hover:bg-obsidian-750/40 transition-colors">
                      <td class="p-4 font-bold text-slate-300 whitespace-nowrap">desktop-macos-release.yml</td>
                      <td class="p-4 text-slate-200">{{ ts.isRomanian ? 'Lansare Binare' : 'Binary Release' }}</td>
                      <td class="p-4 text-slate-300">{{ ts.isRomanian ? 'Compilare Universală C# .NET 10 macOS, Semnare Binară & Împachetare DMG' : 'C# .NET 10 Native macOS Universal App Compilation, Signing & DMG Packaging' }}</td>
                      <td class="p-4 text-slate-400">Tag / Release</td>
                    </tr>
                    <tr class="hover:bg-obsidian-750/40 transition-colors">
                      <td class="p-4 font-bold text-slate-300 whitespace-nowrap">readme-sync.yml</td>
                      <td class="p-4 text-slate-200">{{ ts.isRomanian ? 'Automatizare Documentație' : 'Docs Automation' }}</td>
                      <td class="p-4 text-slate-300">{{ ts.isRomanian ? 'Sincronizare Automată a Documentației și Verificare Badge-uri în 5 Limbi' : 'Multilingual Documentation Sync & Badge Verification across 5 Languages' }}</td>
                      <td class="p-4 text-slate-400">Push to main</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      }

      <!-- TAB 1: VLAN MATRIX -->
      @if (activeTab === 'vlan') {
        <div class="space-y-6">
          <div class="rounded-2xl bg-obsidian-850/90 border border-obsidian-750 shadow-xl overflow-hidden font-sans text-xs">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-obsidian-750 bg-obsidian-900 text-slate-300 text-[11px] uppercase tracking-wider">
                    <th class="p-4">VLAN ID</th>
                    <th class="p-4">{{ ts.isRomanian ? 'Segment Rețea' : 'Network Segment' }}</th>
                    <th class="p-4">Subnet CIDR</th>
                    <th class="p-4">Gateway</th>
                    <th class="p-4">{{ ts.isRomanian ? 'Sarcini de Lucru Ataşate' : 'Attached Workloads' }}</th>
                    <th class="p-4">{{ ts.isRomanian ? 'Politica de Securitate' : 'Security Policy' }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-obsidian-750/70">
                  @for (vlan of (ts.isRomanian ? vlanMatrixRo : vlanMatrixEn); track vlan.id) {
                    <tr class="hover:bg-obsidian-750/40 transition-colors">
                      <td class="p-4 font-bold text-slate-300 whitespace-nowrap">{{ vlan.id }}</td>
                      <td class="p-4 font-medium text-slate-100">{{ vlan.name }}</td>
                      <td class="p-4 text-slate-300 whitespace-nowrap">{{ vlan.subnet }}</td>
                      <td class="p-4 text-slate-300 whitespace-nowrap">{{ vlan.gateway }}</td>
                      <td class="p-4 text-slate-200">{{ vlan.nodes }}</td>
                      <td class="p-4 text-slate-400">{{ vlan.firewallPolicy }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: POWER & UPS TELEMETRY -->
      @if (activeTab === 'power') {
        <div class="space-y-6">
          <!-- Live Telemetry KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
            <div class="p-5 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-lg space-y-2">
              <div class="text-[10px] text-slate-400 uppercase">{{ ts.isRomanian ? 'Tensiune de Intrare' : 'Input Voltage' }}</div>
              <div class="text-2xl font-bold text-slate-300">231.4 V AC</div>
              <div class="text-[11px] text-slate-300">{{ ts.isRomanian ? 'Undă Sinusoidală Pură 50.0 Hz' : 'Pure Sine Wave 50.0 Hz' }}</div>
            </div>
            <div class="p-5 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-lg space-y-2">
              <div class="text-[10px] text-slate-400 uppercase">{{ ts.isRomanian ? 'Încărcare Baterie' : 'Battery Charge' }}</div>
              <div class="text-2xl font-bold text-slate-300">100% (13.7V)</div>
              <div class="text-[11px] text-slate-300">{{ ts.isRomanian ? 'Baterie 100Ah Deep-Cycle AGM' : '100Ah Deep-Cycle AGM' }}</div>
            </div>
            <div class="p-5 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-lg space-y-2">
              <div class="text-[10px] text-slate-400 uppercase">{{ ts.isRomanian ? 'Autonomie Estimată' : 'Estimated Autonomy' }}</div>
              <div class="text-2xl font-bold text-slate-300">~245 Mins</div>
              <div class="text-[11px] text-slate-300">{{ ts.isRomanian ? 'Consum Activ: 84 Watts' : 'Active Load: 84 Watts' }}</div>
            </div>
            <div class="p-5 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-lg space-y-2">
              <div class="text-[10px] text-slate-400 uppercase">{{ ts.isRomanian ? 'Eficiență Energetică (PUE)' : 'Efficiency PUE' }}</div>
              <div class="text-2xl font-bold text-slate-300">1.14 PUE</div>
              <div class="text-[11px] text-slate-300">{{ ts.isRomanian ? 'Consum Redus Sub 100W' : 'Sub-100W Baseline Cluster' }}</div>
            </div>
          </div>

          <!-- NUT Graceful Shutdown Sequence -->
          <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-4">
            <h3 class="font-sans font-bold text-slate-50 text-base">
              {{ ts.isRomanian ? 'Oprire Secvențială Controlată prin Network UPS Tools (NUT)' : 'Network UPS Tools (NUT) Graceful Sequential Shutdown' }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 font-sans text-xs">
              <div class="p-3.5 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                <span class="text-slate-300 font-bold">{{ ts.isRomanian ? 'Pasul 1: Non-Critic' : 'Step 1: Non-Critical' }}</span>
                <p class="text-slate-300 text-[11px] font-sans">{{ ts.isRomanian ? 'Oprire Media (Jellyfin CT 105) & Nextcloud' : 'Stop Media (Jellyfin CT 105) & Nextcloud' }}</p>
              </div>
              <div class="p-3.5 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                <span class="text-slate-300 font-bold">{{ ts.isRomanian ? 'Pasul 2: Baze de Date' : 'Step 2: Databases' }}</span>
                <p class="text-slate-300 text-[11px] font-sans">{{ ts.isRomanian ? 'Flush & Oprire PostgreSQL & Pool OMV NFS' : 'Flush & Stop PostgreSQL & OMV NFS Pool' }}</p>
              </div>
              <div class="p-3.5 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                <span class="text-slate-300 font-bold">{{ ts.isRomanian ? 'Pasul 3: VM-uri Core' : 'Step 3: Core VMs' }}</span>
                <p class="text-slate-300 text-[11px] font-sans">{{ ts.isRomanian ? 'Oprire Controlată Windows Server 2025 Datacenter & OPNsense' : 'Gracefully stop Windows Server 2025 Datacenter & OPNsense' }}</p>
              </div>
              <div class="p-3.5 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                <span class="text-slate-300 font-bold">{{ ts.isRomanian ? 'Pasul 4: Oprire Gazdă' : 'Step 4: Host Poweroff' }}</span>
                <p class="text-slate-300 text-[11px] font-sans">{{ ts.isRomanian ? 'Proxmox VE execută poweroff curat' : 'Proxmox VE executes poweroff cleanly' }}</p>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: ZFS STORAGE -->
      @if (activeTab === 'storage') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
          <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-4">
            <div class="flex items-center justify-between border-b border-obsidian-750 pb-3">
              <h3 class="font-bold text-sm text-slate-50">{{ ts.isRomanian ? 'rpool (SSD NVMe Local)' : 'rpool (Local NVMe SSD)' }}</h3>
              <span class="px-2 py-0.5 rounded bg-slate-400/15 text-slate-300 text-[10px] font-bold">ONLINE · 512GB</span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-slate-300">
                <span>{{ ts.isRomanian ? 'Rată Compresie ZSTD:' : 'ZSTD Compression Ratio:' }}</span>
                <span class="font-bold text-slate-300">1.84x</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>{{ ts.isRomanian ? 'Rată Succes Cache ARC:' : 'ARC Cache Hit Rate:' }}</span>
                <span class="font-bold text-slate-300">98.6%</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>{{ ts.isRomanian ? 'Aliniere Bloc Baze de Date:' : 'Database Block Alignment:' }}</span>
                <span class="font-bold text-slate-100">recordsize=16k</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>{{ ts.isRomanian ? 'Sănătate SSD (Speranță Viață TBW):' : 'SSD Health (TBW Life Expectancy):' }}</span>
                <span class="font-bold text-slate-300">{{ ts.isRomanian ? '99.1% Rămas (Test S.M.A.R.T. Trecut)' : '99.1% Remaining (S.M.A.R.T. Passed)' }}</span>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-4">
            <div class="flex items-center justify-between border-b border-obsidian-750 pb-3">
              <h3 class="font-bold text-sm text-slate-50">{{ ts.isRomanian ? 'datapool (Mirror ZFS OMV)' : 'datapool (OMV ZFS Mirror)' }}</h3>
              <span class="px-2 py-0.5 rounded bg-slate-400/15 text-slate-300 text-[10px] font-bold">ONLINE · 500GB</span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-slate-300">
                <span>{{ ts.isRomanian ? 'Rol Stocare:' : 'Storage Role:' }}</span>
                <span class="font-bold text-slate-100">{{ ts.isRomanian ? 'Partajare NFS/SMB + Backup-uri vzdump' : 'NFS/SMB Share + vzdump Backups' }}</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>{{ ts.isRomanian ? 'Dimensiune Bloc Media:' : 'Media Block Size:' }}</span>
                <span class="font-bold text-slate-100">recordsize=1M (Jellyfin & Kiwix)</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>{{ ts.isRomanian ? 'Arhivă Offline:' : 'Offline Archive:' }}</span>
                <span class="font-bold text-slate-300">Kiwix Wikipedia ZIM (100% Offline)</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>{{ ts.isRomanian ? 'Programare Verificare ZFS Scrub:' : 'ZFS Scrub Scheduler:' }}</span>
                <span class="font-bold text-slate-200">{{ ts.isRomanian ? 'Prima duminică din lună (0 Erori)' : '1st Sunday of Month (0 Errors)' }}</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: CYBERLAB & FORENSICS -->
      @if (activeTab === 'cyber') {
        <div class="space-y-10">

          <!-- Section Header & Filter Sub-Bar -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                <span class="text-[10px] font-sans font-bold tracking-widest text-slate-400 uppercase">
                  TLP:CLEAR · THREAT INTEL & DFIR SUITE
                </span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-serif font-normal text-slate-50 tracking-tight">
                {{ ts.isRomanian ? 'Investigații Criminalistice Reale & Apărare Perimetrală' : 'Real-World Cyber Forensics & Dual-Tier Perimeter Defense' }}
              </h3>
              <p class="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans font-normal leading-relaxed">
                {{ ts.isRomanian ? '4 dosare complete de investigație criminalistică (reverse engineering C2, deconstrucție API fraudulos, SIP spoofing și atacuri BitM), corelate cu stiva de detecție din Datacenter.' : '4 exhaustive digital forensics investigations (C2 reverse engineering, fraudulent API deconstruction, SIP spoofing, and BitM attacks) correlated directly with the Datacenter detection stack.' }}
              </p>
            </div>

            <!-- Sub-Section Navigation -->
            <div class="flex items-center gap-1.5 p-1 bg-obsidian-900 rounded-xl border border-obsidian-750 font-sans text-xs self-start md:self-auto flex-wrap">
              <button
                (click)="cyberSubSection = 'all'"
                [class.bg-slate-200]="cyberSubSection === 'all'"
                [class.text-slate-950]="cyberSubSection === 'all'"
                [class.font-semibold]="cyberSubSection === 'all'"
                [class.border-slate-300]="cyberSubSection === 'all'"
                [class.text-slate-300]="cyberSubSection !== 'all'"
                [class.hover:text-slate-50]="cyberSubSection !== 'all'"
                class="px-3 py-1.5 rounded-lg border border-transparent transition-all"
              >
                {{ ts.isRomanian ? 'Toate (Complet)' : 'All (Complete)' }}
              </button>
              <button
                (click)="cyberSubSection = 'cases'"
                [class.bg-slate-200]="cyberSubSection === 'cases'"
                [class.text-slate-950]="cyberSubSection === 'cases'"
                [class.font-semibold]="cyberSubSection === 'cases'"
                [class.border-slate-300]="cyberSubSection === 'cases'"
                [class.text-slate-300]="cyberSubSection !== 'cases'"
                [class.hover:text-slate-50]="cyberSubSection !== 'cases'"
                class="px-3 py-1.5 rounded-lg border border-transparent transition-all"
              >
                {{ ts.isRomanian ? 'Dosare DFIR (4)' : 'DFIR Cases (4)' }}
              </button>
              <button
                (click)="cyberSubSection = 'perimeter'"
                [class.bg-slate-200]="cyberSubSection === 'perimeter'"
                [class.text-slate-950]="cyberSubSection === 'perimeter'"
                [class.font-semibold]="cyberSubSection === 'perimeter'"
                [class.border-slate-300]="cyberSubSection === 'perimeter'"
                [class.text-slate-300]="cyberSubSection !== 'perimeter'"
                [class.hover:text-slate-50]="cyberSubSection !== 'perimeter'"
                class="px-3 py-1.5 rounded-lg border border-transparent transition-all"
              >
                {{ ts.isRomanian ? 'Dual-Tier Firewall' : 'Dual-Tier Firewall' }}
              </button>
              <button
                (click)="cyberSubSection = 'pillars'"
                [class.bg-slate-200]="cyberSubSection === 'pillars'"
                [class.text-slate-950]="cyberSubSection === 'pillars'"
                [class.font-semibold]="cyberSubSection === 'pillars'"
                [class.border-slate-300]="cyberSubSection === 'pillars'"
                [class.text-slate-300]="cyberSubSection !== 'pillars'"
                [class.hover:text-slate-50]="cyberSubSection !== 'pillars'"
                class="px-3 py-1.5 rounded-lg border border-transparent transition-all"
              >
                {{ ts.isRomanian ? 'Piloni SOC (8)' : 'SOC Pillars (8)' }}
              </button>
              <button
                (click)="cyberSubSection = 'cve'"
                [class.bg-slate-200]="cyberSubSection === 'cve'"
                [class.text-slate-950]="cyberSubSection === 'cve'"
                [class.font-semibold]="cyberSubSection === 'cve'"
                [class.border-slate-300]="cyberSubSection === 'cve'"
                [class.text-slate-300]="cyberSubSection !== 'cve'"
                [class.hover:text-slate-50]="cyberSubSection !== 'cve'"
                class="px-3 py-1.5 rounded-lg border border-transparent transition-all"
              >
                {{ ts.isRomanian ? 'Vulnerabilități Windows (CVE)' : 'Windows CVE Assessments' }}
              </button>
            </div>
          </div>

          <!-- SUB-SECTION 1: THE 4 DIGITAL FORENSICS INVESTIGATIONS -->
          @if (cyberSubSection === 'all' || cyberSubSection === 'cases') {
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <h4 class="text-lg sm:text-xl font-serif font-normal text-slate-100 flex items-center gap-2.5">
                    <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span>{{ ts.isRomanian ? '1. Cazuri de Criminalistică Digitală & Deconstrucție Amenințări' : '1. Digital Forensics & Threat Deconstruction Case Studies' }}</span>
                  </h4>
                  <p class="text-xs sm:text-sm text-slate-400 font-sans font-normal leading-relaxed">
                    {{ ts.isRomanian ? 'Selectează un dosar pentru a citi analiza tehnică completă, decompilarea API și regulile de detecție.' : 'Select any investigation to inspect full technical analysis, API decompilation, and detection signatures.' }}
                  </p>
                </div>
                <span class="text-xs font-sans text-slate-400">4 {{ ts.isRomanian ? 'Cazuri Finalizate' : 'Completed Cases' }}</span>
              </div>

              <!-- 4 Cases Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
                @for (c of (ts.isRomanian ? forensicCasesRo : forensicCasesEn); track c.id) {
                  <div
                    (click)="openCase(c)"
                    class="p-6 rounded-2xl bg-obsidian-850/90 border border-obsidian-750 hover:border-slate-500/50 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:bg-obsidian-800/90"
                  >
                    <div class="space-y-4">
                      <!-- Top Metadata Badges -->
                      <div class="flex items-center justify-between gap-2 border-b border-obsidian-750 pb-3">
                        <div class="flex items-center gap-2">
                          <span class="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-obsidian-800 text-slate-200 border border-obsidian-700 uppercase tracking-wide">
                            {{ c.caseId }}
                          </span>
                          <span class="text-[10px] font-sans px-2 py-0.5 rounded bg-obsidian-900 text-slate-400 border border-obsidian-750 uppercase">
                            {{ c.classification }}
                          </span>
                        </div>
                        <span class="text-[10px] font-sans text-slate-400">{{ c.date }}</span>
                      </div>

                      <!-- Case Title & Badge -->
                      <div>
                        <div class="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 mb-1">
                          {{ c.badge }}
                        </div>
                        <h4 class="text-base font-sans font-bold text-slate-50 group-hover:text-slate-200 transition-colors leading-snug">
                          {{ c.title }}
                        </h4>
                      </div>

                      <!-- Summary Paragraph -->
                      <p class="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans font-normal">
                        {{ c.summary }}
                      </p>

                      <!-- Key Technical Discovery Highlight -->
                      <div class="p-3.5 rounded-xl bg-obsidian-900/90 border border-obsidian-750 space-y-1">
                        <div class="text-[10px] font-sans text-slate-400 uppercase tracking-wider font-semibold">
                          {{ ts.isRomanian ? 'Descoperire Tehnică Cheie' : 'Key Technical Discovery' }}
                        </div>
                        <div class="text-xs font-sans text-slate-300 truncate">
                          {{ c.reverseFindings[1] || c.reverseFindings[0] }}
                        </div>
                      </div>

                      <!-- MITRE ATT&CK Badges -->
                      <div class="flex flex-wrap gap-1.5 font-sans text-[10px]">
                        @for (m of c.mitreAttack; track m) {
                          <span class="px-2 py-0.5 rounded bg-obsidian-900 border border-obsidian-750 text-slate-400">
                            {{ m }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Footer Action -->
                    <div class="mt-5 pt-3 border-t border-obsidian-750 flex items-center justify-between text-xs">
                      <span class="text-slate-400 text-[11px] font-sans">{{ c.status }}</span>
                      <span class="font-sans text-xs font-semibold text-slate-300 group-hover:text-slate-100 flex items-center gap-1 transition-colors">
                        {{ ts.isRomanian ? 'Deschide Dosarul Criminalistic →' : 'Open Forensic Dossier →' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- SUB-SECTION 1.5: CRITICAL WINDOWS CVE ASSESSMENTS & HOMELAB IMPACT -->
          @if (cyberSubSection === 'all' || cyberSubSection === 'cve') {
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <h4 class="text-lg sm:text-xl font-serif font-normal text-slate-100 flex items-center gap-2.5">
                    <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>{{ ts.isRomanian ? '2. Evaluare Vulnerabilități Critice Windows & Impact Homelab (CVE 2026)' : '2. Critical Windows CVE Assessments & Homelab Threat Impact (2026)' }}</span>
                  </h4>
                  <p class="text-xs sm:text-sm text-slate-400 font-sans font-normal leading-relaxed">
                    {{ ts.isRomanian ? 'Analiză tehnică aprofundată a celor 5 vulnerabilități critice Windows (Hyper-V Escape, DNS Server RCE, DHCP Server RCE), corelate cu Domain Controllerele noastre (ad2025_vm, ad2022_vm) și hypervisorul fizic.' : 'In-depth technical analysis of 5 critical Windows CVEs (Hyper-V Escape, DNS Server RCE, DHCP Server RCE) mapped directly to our Domain Controllers (ad2025_vm, ad2022_vm) and physical hypervisor host.' }}
                  </p>
                </div>
                <span class="text-xs font-sans text-rose-400 font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  {{ ts.isRomanian ? '3 Dosare Active (CVSS 8.8 - 9.8)' : '3 Active Dossiers (CVSS 8.8 - 9.8)' }}
                </span>
              </div>

              <!-- CVE Cards Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
                @for (cve of (ts.isRomanian ? cveAssessmentsRo : cveAssessmentsEn); track cve.id) {
                  <div
                    (click)="openCve(cve)"
                    class="p-6 rounded-2xl bg-obsidian-850/90 border border-obsidian-750 hover:border-rose-500/40 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:bg-obsidian-800/90"
                  >
                    <div class="space-y-4">
                      <!-- Top Metadata Badges -->
                      <div class="flex items-center justify-between gap-2 border-b border-obsidian-750 pb-3">
                        <span class="text-[10px] font-sans font-bold px-2 py-0.5 rounded uppercase tracking-wide"
                          [class.bg-rose-500]="cve.cvssSeverity === 'CRITICAL'"
                          [class.text-white]="cve.cvssSeverity === 'CRITICAL'"
                          [class.bg-amber-500]="cve.cvssSeverity === 'HIGH'"
                          [class.text-slate-950]="cve.cvssSeverity === 'HIGH'"
                          [class.bg-sky-500]="cve.cvssSeverity === 'MEDIUM'"
                          [class.text-slate-950]="cve.cvssSeverity === 'MEDIUM'"
                        >
                          CVSS {{ cve.cvssScore }} · {{ cve.cvssSeverity }}
                        </span>
                        <span class="text-[10px] font-sans text-slate-400">{{ cve.date }}</span>
                      </div>

                      <!-- CVE Title & Component -->
                      <div>
                        <div class="text-[10px] font-sans font-bold uppercase tracking-wider text-rose-400 mb-1">
                          {{ cve.cveId }}
                        </div>
                        <h4 class="text-base font-sans font-bold text-slate-50 group-hover:text-slate-200 transition-colors leading-snug">
                          {{ cve.title }}
                        </h4>
                      </div>

                      <!-- Component Badge -->
                      <div class="px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-750 text-[11px] font-mono text-slate-300">
                        {{ cve.component }}
                      </div>

                      <!-- Summary Paragraph -->
                      <p class="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans font-normal">
                        {{ cve.summary }}
                      </p>

                      <!-- Homelab Target Node Exposure -->
                      <div class="p-3.5 rounded-xl bg-obsidian-900/90 border border-obsidian-750 space-y-1.5">
                        <div class="text-[10px] font-sans text-slate-400 uppercase tracking-wider font-semibold">
                          {{ ts.isRomanian ? 'Noduri Afectate în Homelab' : 'Affected Homelab Nodes' }}
                        </div>
                        <div class="flex flex-wrap gap-1 text-[10px] font-mono">
                          @for (node of cve.affectedNodes.slice(0, 2); track node) {
                            <span class="px-1.5 py-0.5 rounded bg-obsidian-800 text-slate-300 border border-obsidian-700 truncate max-w-full">
                              {{ node }}
                            </span>
                          }
                        </div>
                      </div>

                      <!-- MITRE ATT&CK Badges -->
                      <div class="flex flex-wrap gap-1.5 font-sans text-[10px]">
                        @for (m of cve.mitreAttack; track m) {
                          <span class="px-2 py-0.5 rounded bg-obsidian-900 border border-obsidian-750 text-slate-400">
                            {{ m }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Footer Action -->
                    <div class="mt-5 pt-3 border-t border-obsidian-750 flex items-center justify-between text-xs">
                      <span class="text-slate-400 text-[11px] font-sans">{{ cve.status }}</span>
                      <span class="font-sans text-xs font-semibold text-rose-400 group-hover:text-rose-300 flex items-center gap-1 transition-colors">
                        {{ ts.isRomanian ? 'Analiză Tehnică & Raport →' : 'Technical Dossier →' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- SUB-SECTION 2: DUAL-TIER PERIMETER & SOC THREAT CORRELATION -->
          @if (cyberSubSection === 'all' || cyberSubSection === 'perimeter') {
            <div class="space-y-4">
              <div class="space-y-1">
                <h4 class="text-lg sm:text-xl font-serif font-normal text-slate-100 flex items-center gap-2.5">
                  <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>{{ ts.isRomanian ? '2. Arhitectură Perimetrală Dual-Tier & Corelare cu SOC-ul Datacenter' : '2. Dual-Tier Perimeter Architecture & Datacenter SOC Correlation' }}</span>
                </h4>
                <p class="text-xs sm:text-sm text-slate-400 font-sans font-normal leading-relaxed">
                  {{ ts.isRomanian ? 'Flux de filtrare defensivă în profunzime (Defense-in-Depth): de la perimetrul extern la rutare de tranzit BGP și detecție EDR/SIEM.' : 'Defense-in-depth traffic flow: from external frontline perimeter to BGP transit routing and EDR/SIEM detection.' }}
                </p>
              </div>

              <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-6">
                <!-- Visual Pipeline Flow Grid -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 font-sans text-xs">
                  
                  <!-- Tier 1: OPNsense -->
                  <div class="p-4 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-2 flex flex-col justify-between hover:border-slate-500/50 transition-all">
                    <div>
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold font-sans text-slate-400 uppercase tracking-wider">TIER 1 · PERIMETRU EDGE</span>
                        <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                      </div>
                      <h5 class="font-bold text-sm text-slate-100 mt-1 font-sans">OPNsense Gateway</h5>
                      <div class="text-[11px] text-slate-400 font-sans mt-0.5">VM 200 · FreeBSD pf</div>
                      <p class="text-xs text-slate-300 font-sans font-normal mt-2 leading-relaxed">
                        {{ ts.isRomanian ? 'Filtrare stateful L3/L4, Suricata IDS/IPS activ, CrowdSec bouncer L7 și terminare tunel hibrid WireGuard (wg-cloud0).' : 'Stateful L3/L4 filtering, Suricata IDS/IPS, CrowdSec L7 bouncer, and hybrid WireGuard tunnel termination (wg-cloud0).' }}
                      </p>
                    </div>
                    <div class="mt-3 pt-2 border-t border-obsidian-750 text-[11px] text-slate-400 font-sans">
                      IP: 192.168.1.134 / WAN 1.0/24
                    </div>
                  </div>

                  <!-- Transit Link: Bus L3 / VLAN Trunk -->
                  <div class="p-4 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-2 flex flex-col justify-between hover:border-slate-500/50 transition-all">
                    <div>
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold font-sans text-slate-400 uppercase tracking-wider">SEGMENTARE L3 & TRANZIT</span>
                        <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                      </div>
                      <h5 class="font-bold text-sm text-slate-100 mt-1 font-sans">vmbr0 / 802.1Q Trunk</h5>
                      <div class="text-[11px] text-slate-400 font-sans mt-0.5">VLANs 10, 20, 30, 40, 50</div>
                      <p class="text-xs text-slate-300 font-sans font-normal mt-2 leading-relaxed">
                        {{ ts.isRomanian ? 'Trunchi 802.1Q dedicat pe interfețe virtuale Linux Bridge cu izolare strictă L2/L3 între Management, Servicii, Laborator Securitate, DMZ și IoT.' : 'Dedicated 802.1Q trunk on Linux Bridge interfaces with strict L2/L3 isolation across Management, Services, Cyber Lab, DMZ, and IoT.' }}
                      </p>
                    </div>
                    <div class="mt-3 pt-2 border-t border-obsidian-750 text-[11px] text-slate-400 font-sans">
                      Gateway Core: 192.168.1.134
                    </div>
                  </div>

                  <!-- Tier 2: Proxmox VE Defense-in-Depth Firewall -->
                  <div class="p-4 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-2 flex flex-col justify-between hover:border-slate-500/50 transition-all">
                    <div>
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold font-sans text-slate-400 uppercase tracking-wider">TIER 2 · DEFENSE-IN-DEPTH</span>
                        <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                      </div>
                      <h5 class="font-bold text-sm text-slate-100 mt-1 font-sans">Proxmox VE Host Firewall</h5>
                      <div class="text-[11px] text-slate-400 font-sans mt-0.5">Hypervisor Core & eBPF Security</div>
                      <p class="text-xs text-slate-300 font-sans font-normal mt-2 leading-relaxed">
                        {{ ts.isRomanian ? 'Filtrare distribuită pe nod, reguli eBPF / iptables la nivel de vNIC, protecție spoofing MAC/IP și inspecție strictă a fluxurilor East-West.' : 'Distributed host packet filtering, eBPF / iptables per-vNIC security rules, MAC/IP spoofing prevention, and East-West flow policing.' }}
                      </p>
                    </div>
                    <div class="mt-3 pt-2 border-t border-obsidian-750 text-[11px] text-slate-400 font-sans">
                      Politică Zero-Trust Inter-Workload
                    </div>
                  </div>

                  <!-- SOC & Deception -->
                  <div class="p-4 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-2 flex flex-col justify-between hover:border-slate-500/50 transition-all">
                    <div>
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold font-sans text-slate-400 uppercase tracking-wider">SOC & DECEPȚIE DMZ</span>
                        <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                      </div>
                      <h5 class="font-bold text-sm text-slate-100 mt-1 font-sans">Wazuh SIEM & T-Pot</h5>
                      <div class="text-[11px] text-slate-400 font-sans mt-0.5">CT 100 & VM 203 (VLAN 40)</div>
                      <p class="text-xs text-slate-300 font-sans font-normal mt-2 leading-relaxed">
                        {{ ts.isRomanian ? 'Cluster de capcane Cowrie SSH & Dionaea în DMZ izolat; corelare evenimente în Wazuh XDR și analiză dinamică pe REMnux (VM 205).' : 'Cowrie SSH & Dionaea deception cluster in isolated DMZ; event correlation via Wazuh XDR and dynamic triage on REMnux (VM 205).' }}
                      </p>
                    </div>
                    <div class="mt-3 pt-2 border-t border-obsidian-750 text-[11px] text-slate-400 font-sans">
                      Wazuh Manager: 192.168.1.132:1514
                    </div>
                  </div>

                </div>

                <!-- Live Correlation Matrix with the 4 Forensics Investigations -->
                <div class="p-5 rounded-xl bg-obsidian-900/80 border border-obsidian-750 space-y-4">
                  <div class="text-[11px] font-sans text-slate-400 uppercase tracking-wider font-semibold">
                    {{ ts.isRomanian ? 'Cum Alimentează Cele 4 Investigații Apărarea Datacenter-ului' : 'How the 4 Forensic Investigations Directly Feed Datacenter Defense' }}
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div class="flex items-start gap-3">
                      <span class="w-5 h-5 rounded bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-[10px] font-sans text-slate-300 font-bold shrink-0 mt-0.5">1</span>
                      <span class="text-slate-300 leading-relaxed">
                        <strong class="text-slate-100 font-semibold">Task Scam (USDT TRC-20):</strong>
                        {{ ts.isRomanian ? 'Regulile Suricata inspectează JSON-urile ce conțin chei de kill-switch; IP-urile de C2 sunt blocate automat pe OPNsense prin CrowdSec.' : 'Suricata rules inspect JSON bodies for kill-switch attributes; C2 IPs are blacklisted via CrowdSec on OPNsense.' }}
                      </span>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="w-5 h-5 rounded bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-[10px] font-sans text-slate-300 font-bold shrink-0 mt-0.5">2</span>
                      <span class="text-slate-300 leading-relaxed">
                        <strong class="text-slate-100 font-semibold">Revolut Vishing:</strong>
                        {{ ts.isRomanian ? 'Filtrare antete SIP nesecurizate pe Asterisk PBX și blocare directă la nivel DNS a domeniilor nou apărute (NRD &lt; 30 zile).' : 'Unauthenticated SIP header filtering on Asterisk PBX and automated DNS sinkholing of newly registered domains (NRD &lt; 30 days).' }}
                      </span>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="w-5 h-5 rounded bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-[10px] font-sans text-slate-300 font-bold shrink-0 mt-0.5">3</span>
                      <span class="text-slate-300 leading-relaxed">
                        <strong class="text-slate-100 font-semibold">TikTok MRR Pyramids:</strong>
                        {{ ts.isRomanian ? 'Crawler OSINT pe Proxmox pentru identificarea rutelor scurtate de phishing și scoring de reputație al portilor de plată.' : 'Proxmox-hosted OSINT crawler resolving short URL redirects and monitoring high-risk merchant gateway domains.' }}
                      </span>
                    </div>
                    <div class="flex items-start gap-3">
                      <span class="w-5 h-5 rounded bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-[10px] font-sans text-slate-300 font-bold shrink-0 mt-0.5">4</span>
                      <span class="text-slate-300 leading-relaxed">
                        <strong class="text-slate-100 font-semibold">Steam OpenID BitM:</strong>
                        {{ ts.isRomanian ? 'Detecție a structurilor sintetice de ferestre BitM în traficul HTTP și reguli de alertare Wazuh pentru crearea suspectă de chei Web API.' : 'Identification of synthetic BitM in-DOM frames via Suricata and Wazuh alerting on unusual Web API token provisions.' }}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          }

          <!-- SUB-SECTION 3: THE 8 SECURITY PILLARS -->
          @if (cyberSubSection === 'all' || cyberSubSection === 'pillars') {
            <div class="space-y-4">
              <div class="space-y-1">
                <h4 class="text-lg sm:text-xl font-serif font-normal text-slate-100 flex items-center gap-2.5">
                  <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>{{ ts.isRomanian ? '3. Cei 8 Piloni Tehnici ai Securității Datacenter (SOC & Defensivă)' : '3. The 8 Technical Cybersecurity & Defense Pillars (SOC & SecOps)' }}</span>
                </h4>
                <p class="text-xs sm:text-sm text-slate-400 font-sans font-normal leading-relaxed">
                  {{ ts.isRomanian ? 'Stive tehnologice de la virtualizare bare-metal și Active Directory până la analiză de pachete, SIEM și inginerie de detecție.' : 'Full technology stacks spanning bare-metal virtualization, Active Directory, packet inspection, SIEM, and detection engineering.' }}
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans text-xs">
                @for (pillar of (ts.isRomanian ? cyberPillarsRo : cyberPillarsEn); track pillar.title) {
                  <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 hover:border-slate-500/50 shadow-xl space-y-3.5 flex flex-col justify-between transition-all group">
                    <div class="space-y-3">
                      <div class="flex items-center justify-between border-b border-obsidian-750 pb-3">
                        <h3 class="font-sans font-bold text-slate-50 text-base tracking-wide group-hover:text-slate-200 transition-colors">
                          {{ pillar.title }}
                        </h3>
                        <span class="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-obsidian-800 text-slate-300 border border-obsidian-700 uppercase">
                          {{ pillar.badge }}
                        </span>
                      </div>

                      <p class="text-xs text-slate-300 leading-relaxed font-sans font-normal">
                        {{ pillar.description }}
                      </p>

                      <div class="space-y-1.5 pt-1">
                        <div class="text-[10px] font-sans text-slate-400 uppercase tracking-wider">{{ ts.isRomanian ? 'Tehnologii & Unelte' : 'Technologies & Tooling' }}</div>
                        <div class="flex flex-wrap gap-1.5 font-sans text-[11px]">
                          @for (tool of pillar.tools; track tool) {
                            <span class="px-2 py-0.5 rounded bg-obsidian-900 border border-obsidian-750 text-slate-300">
                              {{ tool }}
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- 4. Offensive Security, Red Teaming & Container Escape Audit -->
            <div class="space-y-4 pt-6 border-t border-obsidian-750">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="text-base font-sans font-bold text-slate-100 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>{{ ts.isRomanian ? '4. Securitate Ofensivă, Red Teaming & Audit Container Escape' : '4. Offensive Security, Red Teaming & Container Escape Audit' }}</span>
                  </h3>
                  <p class="text-xs text-slate-400 font-sans mt-0.5">
                    {{ ts.isRomanian 
                      ? 'Simulare automată adversară MITRE ATT&CK, evaluare vectori de evadare din container și măsurare latență detecție în Wazuh SIEM și CrowdSec.' 
                      : 'Automated MITRE ATT&CK adversary simulation, container breakout vector auditing, and defensive detection latency validation in Wazuh SIEM & CrowdSec.' }}
                  </p>
                </div>
                <span class="px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 text-[11px] font-bold self-start sm:self-auto font-sans">RED TEAM SUITE</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
                
                <!-- 1. Container Audit -->
                <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
                  <div class="flex items-center justify-between border-b border-obsidian-750 pb-2">
                    <span class="text-rose-400 font-bold uppercase text-[10px]">{{ ts.isRomanian ? 'Audit Kernel & Izolare' : 'Kernel & Isolation Audit' }}</span>
                    <span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[10px] font-bold">PYTHON 3</span>
                  </div>
                  <h4 class="font-bold text-slate-100 text-sm font-sans">Container Audit</h4>
                  <p class="text-slate-300 font-sans text-xs leading-relaxed">
                    {{ ts.isRomanian 
                      ? 'Scanează capabilitățile (CAP_SYS_ADMIN, CAP_SYS_PTRACE), socket-urile docker.sock expuse, cgroups și namespaces partajate (hostPID).' 
                      : 'Audits capabilities (CAP_SYS_ADMIN, CAP_SYS_PTRACE), exposed docker.sock sockets, cgroups, and shared namespaces (hostPID).' }}
                  </p>
                  <div class="p-2 rounded bg-obsidian-900 border border-obsidian-750 text-[11px] text-slate-300 font-mono">
                    <code>python3 cyber/red-team/container_audit.py</code>
                  </div>
                </div>

                <!-- 2. Security Tests Runner -->
                <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
                  <div class="flex items-center justify-between border-b border-obsidian-750 pb-2">
                    <span class="text-amber-400 font-bold uppercase text-[10px]">{{ ts.isRomanian ? 'Validare Detecție' : 'Detection Tests' }}</span>
                    <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-bold">MITRE ATT&CK</span>
                  </div>
                  <h4 class="font-bold text-slate-100 text-sm font-sans">Security Detection Tests</h4>
                  <p class="text-slate-300 font-sans text-xs leading-relaxed">
                    {{ ts.isRomanian 
                      ? 'Execută tehnici atomice (T1059.004 shell, T1046 port discovery, T1552 canary hunt) pentru a măsura timpii de reacție ai alertelor Wazuh SIEM.' 
                      : 'Executes non-destructive techniques (T1059.004 shell, T1046 port discovery, T1552 canary hunt) measuring alert reaction latency in Wazuh SIEM.' }}
                  </p>
                  <div class="p-2 rounded bg-obsidian-900 border border-obsidian-750 text-[11px] text-slate-300 font-mono">
                    <code>python3 cyber/red-team/sec_tests.py</code>
                  </div>
                </div>

                <!-- 3. Privilege Audit -->
                <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
                  <div class="flex items-center justify-between border-b border-obsidian-750 pb-2">
                    <span class="text-sky-400 font-bold uppercase text-[10px]">{{ ts.isRomanian ? 'Audit Privilegii & Secrete' : 'Privilege & Secrets Audit' }}</span>
                    <span class="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[10px] font-bold">ZERO-TRUST</span>
                  </div>
                  <h4 class="font-bold text-slate-100 text-sm font-sans">Privilege Boundary Audit</h4>
                  <p class="text-slate-300 font-sans text-xs leading-relaxed">
                    {{ ts.isRomanian 
                      ? 'Evaluează vectorii de escaladare locală de privilegii (directoare PATH perisabile, chei SSH cu permisiuni laxe, secrete expuse în variabile de mediu).' 
                      : 'Evaluates local privilege escalation vectors (writable PATH dirs, loose SSH key permissions, unvaulted environment variables).' }}
                  </p>
                  <div class="p-2 rounded bg-obsidian-900 border border-obsidian-750 text-[11px] text-slate-300 font-mono">
                    <code>python3 cyber/red-team/priv_check.py</code>
                  </div>
                </div>

              </div>
            </div>
          }

        </div>
      }

      <!-- TAB: ZERO-TRUST & GITOPS PROVING GROUND -->
      @if (activeTab === 'zerotrust') {
        <div class="space-y-6 font-sans text-xs">
          
          <!-- Grid 1: Vault / OpenBao & WireGuard Key Rotation -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Vault / OpenBao Secret Automation -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-4">
              <div class="flex items-center justify-between border-b border-obsidian-750 pb-3">
                <div>
                  <div class="text-[10px] text-slate-300 font-bold uppercase">{{ ts.isRomanian ? 'Pipeline Injectare Secrete' : 'Secret Injection Pipeline' }}</div>
                  <h3 class="font-bold text-sm text-slate-50 mt-0.5">HashiCorp Vault / OpenBao</h3>
                </div>
                <span class="px-2 py-0.5 rounded bg-slate-400/15 text-slate-300 text-[10px] font-bold">{{ ts.isRomanian ? 'FĂRĂ .ENV PE DISC' : 'ZERO .ENV ON DISK' }}</span>
              </div>
              <p class="text-slate-300 font-sans text-xs leading-relaxed">
                {{ ts.isRomanian 
                  ? 'Motor centralizat de secrete ce furnizează generare dinamică de token-uri și credențiale efemere pentru Terraform, Ansible și Woodpecker CI.' 
                  : 'Centralized secrets engine providing automated dynamic token generation and ephemeral credentials for Terraform, Ansible, and Woodpecker CI runners.' }}
              </p>
              <div class="space-y-2 text-[11px]">
                <div class="p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750 flex justify-between text-slate-200">
                  <span>{{ ts.isRomanian ? 'Backend Secrete KV v2:' : 'KV v2 Secret Backend:' }}</span>
                  <span class="text-slate-300 font-bold">secret/data/homelab/*</span>
                </div>
                <div class="p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750 flex justify-between text-slate-200">
                  <span>{{ ts.isRomanian ? 'Timp Viață Token DB (TTL):' : 'Dynamic DB Credential TTL:' }}</span>
                  <span class="text-slate-100 font-bold">{{ ts.isRomanian ? 'Lease 1 Oră (Auto-Revocare)' : '1 Hour Lease (Auto-Revoke)' }}</span>
                </div>
                <div class="p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750 flex justify-between text-slate-200">
                  <span>{{ ts.isRomanian ? 'Criptare în Tranzit:' : 'Transit Encryption:' }}</span>
                  <span class="text-slate-300 font-bold">AES-256-GCM / Ed25519</span>
                </div>
              </div>
            </div>

            <!-- WireGuard Kernel Key Rotation -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-4">
              <div class="flex items-center justify-between border-b border-obsidian-750 pb-3">
                <div>
                  <div class="text-[10px] text-slate-300 font-bold uppercase">{{ ts.isRomanian ? 'Rotație Criptografică Automată' : 'Automated Cryptographic Rotation' }}</div>
                  <h3 class="font-bold text-sm text-slate-50 mt-0.5">WireGuard Kernel Key Rotator</h3>
                </div>
                <span class="px-2 py-0.5 rounded bg-slate-400/15 text-slate-300 text-[10px] font-bold">{{ ts.isRomanian ? 'FĂRĂ ÎNTRERUPERE' : 'ZERO DOWNTIME' }}</span>
              </div>
              <p class="text-slate-300 font-sans text-xs leading-relaxed">
                {{ ts.isRomanian 
                  ? 'Rotație periodică automată a perechilor de chei Curve25519 și cheilor pre-partajate (PSK) direct în modulul kernel WireGuard din OPNsense.' 
                  : 'Automated periodic rotation of Curve25519 keypairs and pre-shared keys (PSK) directly on the OPNsense WireGuard kernel module.' }}
              </p>
              <div class="space-y-2 text-[11px]">
                <div class="p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750 flex justify-between text-slate-200">
                  <span>{{ ts.isRomanian ? 'Program Rotație:' : 'Rotation Schedule:' }}</span>
                  <span class="text-slate-300 font-bold">{{ ts.isRomanian ? 'Cron Automat Săptămânal' : 'Weekly Automated Cron' }}</span>
                </div>
                <div class="p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750 flex justify-between text-slate-200">
                  <span>{{ ts.isRomanian ? 'Algoritm Chei:' : 'Key Algorithm:' }}</span>
                  <span class="text-slate-100 font-bold">Curve25519 + ChaCha20-Poly1305</span>
                </div>
                <div class="p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750 flex justify-between text-slate-200">
                  <span>{{ ts.isRomanian ? 'Status Handshake Peer:' : 'Peer Handshake Status:' }}</span>
                  <span class="text-slate-300 font-bold">{{ ts.isRomanian ? 'Sincronizat via API Vault' : 'Synchronized via Vault API' }}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Grid 2: mTLS & Canary Honeytokens & RenovateBot -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- mTLS Inter-Service -->
            <div class="p-5 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
              <div class="flex items-center justify-between border-b border-obsidian-750 pb-2">
                <h4 class="font-bold text-sm text-slate-50">{{ ts.isRomanian ? 'Gateway Inter-Servicii mTLS' : 'mTLS Inter-Service Gateway' }}</h4>
                <span class="text-[10px] text-slate-300 font-bold">VLAN 20</span>
              </div>
              <p class="text-slate-300 font-sans text-xs">
                {{ ts.isRomanian 
                  ? 'Verificare obligatorie mutuală a certificatelor client între proxy-urile ingress și bazele de date sau stocarea de secrete.' 
                  : 'Mandatory mutual client certificate verification between ingress proxies and backend databases or secret stores.' }}
              </p>
              <div class="text-[11px] p-2 rounded bg-obsidian-900 border border-obsidian-750 text-slate-200 space-y-1">
                <div>• Mode: <span class="text-slate-300 font-bold">require_and_verify</span></div>
                <div>• Root CA: <span class="text-slate-100">Step-CA Automated PKI</span></div>
                <div>• Cipher: <span class="text-slate-100">TLS_AES_256_GCM_SHA384</span></div>
              </div>
            </div>

            <!-- Canary Honeytokens -->
            <div class="p-5 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
              <div class="flex items-center justify-between border-b border-obsidian-750 pb-2">
                <h4 class="font-bold text-sm text-slate-50">Canary Honeytokens</h4>
                <span class="text-[10px] text-rose-400 font-bold">{{ ts.isRomanian ? 'DECEPȚIE' : 'DECEPTION' }}</span>
              </div>
              <p class="text-slate-300 font-sans text-xs">
                {{ ts.isRomanian 
                  ? 'Fișiere-capcană deceptive (passwords.csv, aws_keys.env) în DMZ și partajări SMB ce declanșează alerte instantanee la accesare.' 
                  : 'Deceptive honeypot files in DMZ and SMB shares that trigger instant alerts when accessed.' }}
              </p>
              <div class="text-[11px] p-2 rounded bg-obsidian-900 border border-obsidian-750 text-slate-200 space-y-1">
                <div>• Trigger: <span class="text-rose-400 font-bold">Linux Inotify + Webhook</span></div>
                <div>• Alert: <span class="text-slate-100">Telegram & ntfy Push</span></div>
                <div>• Response: <span class="text-slate-300 font-bold">{{ ts.isRomanian ? 'Banare IP Automată via CrowdSec' : 'Automatic IP Ban via CrowdSec' }}</span></div>
              </div>
            </div>

            <!-- RenovateBot GitOps -->
            <div class="p-5 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
              <div class="flex items-center justify-between border-b border-obsidian-750 pb-2">
                <h4 class="font-bold text-sm text-slate-50">RenovateBot GitOps</h4>
                <span class="text-[10px] text-sky-400 font-bold">{{ ts.isRomanian ? 'AUTOMATIZARE' : 'AUTOMATION' }}</span>
              </div>
              <p class="text-slate-300 font-sans text-xs">
                {{ ts.isRomanian 
                  ? 'Motor de scanare a dependențelor on-premise ce inspectează repo-urile interne Gitea și deschide Pull Requests automate.' 
                  : 'On-premise dependency scanning engine inspecting internal Gitea repositories and filing automated Pull Requests.' }}
              </p>
              <div class="text-[11px] p-2 rounded bg-obsidian-900 border border-obsidian-750 text-slate-200 space-y-1">
                <div>• Target: <span class="text-sky-400 font-bold">Docker, Terraform & Go</span></div>
                <div>• Forge: <span class="text-slate-100">Gitea Internal API v1</span></div>
                <div>• CI: <span class="text-slate-300 font-bold">Woodpecker CI Automated Test</span></div>
              </div>
            </div>

          </div>

          <!-- Grid 3: ZRAM & VirtIO Dynamic Memory Ballooning Engine -->
          <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-4">
            <div class="flex items-center justify-between border-b border-obsidian-750 pb-3">
              <div>
                <div class="text-[10px] text-slate-300 font-bold uppercase">{{ ts.isRomanian ? 'Accelerare Memorie & Protecție SSD' : 'Memory Acceleration & Lifespan Protection' }}</div>
                <h3 class="font-bold text-sm text-slate-50 mt-0.5">{{ ts.isRomanian ? 'Compresie Hardware ZRAM & Balonare Dinamică VirtIO' : 'ZRAM Hardware Compression & Dynamic Ballooning Engine' }}</h3>
              </div>
              <span class="px-2 py-0.5 rounded bg-slate-400/15 text-slate-300 text-[10px] font-bold">{{ ts.isRomanian ? 'COMPRESIE LZ4 ACTIVĂ' : 'LZ4 COMPRESSION ACTIVE' }}</span>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3 text-[11px]">
              <div class="p-3 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                <div class="text-[9px] text-slate-400 uppercase">Node 1 (x86_64) ZRAM</div>
                <div class="font-bold text-slate-300 text-sm">6.0 GB /dev/zram0</div>
                <div class="text-[10px] text-slate-400">ALGO=lz4 · Swappiness 60</div>
              </div>
              <div class="p-3 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                <div class="text-[9px] text-slate-400 uppercase">{{ ts.isRomanian ? 'Protecție Durată Viață NVMe' : 'NVMe Lifespan Protection' }}</div>
                <div class="font-bold text-slate-100 text-sm">99.1% {{ ts.isRomanian ? 'Rămas' : 'Remaining' }}</div>
                <div class="text-[10px] text-slate-300">{{ ts.isRomanian ? 'Zero Uzură Swap pe SSD' : 'Zero SSD Swap Wear' }}</div>
              </div>
              <div class="p-3 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-1">
                <div class="text-[9px] text-slate-400 uppercase">{{ ts.isRomanian ? 'VM-uri Balonare VirtIO' : 'VirtIO Ballooning VMs' }}</div>
                <div class="font-bold text-slate-100 text-sm">6 QEMU VMs</div>
                <div class="text-[10px] text-slate-300">Dynamic 512MB → 8192MB</div>
              </div>
            </div>
          </div>

          <!-- Grid 4: Cilium Strict mTLS, OPA Policy-as-Code & Remote Encrypted Terraform S3 State -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Cilium Strict mTLS -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
              <div class="flex items-center justify-between border-b border-obsidian-750 pb-2">
                <span class="text-cyan-400 font-bold uppercase text-[10px]">{{ ts.isRomanian ? 'Service Mesh eBPF' : 'eBPF Service Mesh' }}</span>
                <span class="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-bold">mTLS L7</span>
              </div>
              <h4 class="font-bold text-slate-100 text-sm">Cilium SPIFFE / SPIRE mTLS</h4>
              <p class="text-slate-300 font-sans text-xs leading-relaxed">
                {{ ts.isRomanian 
                  ? 'Forțează criptarea mutuală L7 (CiliumNetworkPolicy) între podurile Talos K8s și microserviciile din VLAN 20, blocând traficul text-clar inter-container.' 
                  : 'Enforces strict L7 mutual TLS (CiliumNetworkPolicy) between Talos K8s pods and VLAN 20 microservices, eliminating cleartext inter-container traffic.' }}
              </p>
              <div class="p-2 rounded bg-obsidian-900 border border-obsidian-750 text-[11px] text-slate-300 font-mono">
                <code>authentication.mode: required</code>
              </div>
            </div>

            <!-- OPA / Conftest Policy-as-Code -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
              <div class="flex items-center justify-between border-b border-obsidian-750 pb-2">
                <span class="text-emerald-400 font-bold uppercase text-[10px]">{{ ts.isRomanian ? 'Securitate Declarativă' : 'Declarative Security' }}</span>
                <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-bold">OPA / REGO</span>
              </div>
              <h4 class="font-bold text-slate-100 text-sm">Policy-as-Code (Conftest)</h4>
              <p class="text-slate-300 font-sans text-xs leading-relaxed">
                {{ ts.isRomanian 
                  ? 'Porți de validare în CI/CD ce blochează automat containerele cu runAsNonRoot: false, tag-uri unpinned :latest și porturi host-mapped neautorizate.' 
                  : 'CI/CD policy gate blocking workloads with runAsNonRoot: false, unpinned :latest image tags, and unauthorized host-mapped network ports.' }}
              </p>
              <div class="p-2 rounded bg-obsidian-900 border border-obsidian-750 text-[11px] text-slate-300 font-mono">
                <code>conftest test -p policy/ ...</code>
              </div>
            </div>

            <!-- Terraform Remote Encrypted S3 Backend -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
              <div class="flex items-center justify-between border-b border-obsidian-750 pb-2">
                <span class="text-amber-400 font-bold uppercase text-[10px]">{{ ts.isRomanian ? 'Stare Imutabilă & Locking' : 'Immutable State & Locking' }}</span>
                <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-bold">S3 + DYNAMODB</span>
              </div>
              <h4 class="font-bold text-slate-100 text-sm">Remote Encrypted Terraform State</h4>
              <p class="text-slate-300 font-sans text-xs leading-relaxed">
                {{ ts.isRomanian 
                  ? 'Stare centralizată pe bucket MinIO S3 intern (CT 161) cu criptare AES-256 și blocare concurențială prin DynamoDB API compatibil.' 
                  : 'Centralized state on internal MinIO S3 bucket (CT 161) with AES-256 encryption and concurrent state locking via DynamoDB-compatible API.' }}
              </p>
              <div class="p-2 rounded bg-obsidian-900 border border-obsidian-750 text-[11px] text-slate-300 font-mono">
                <code>backend "s3" + dynamodb_locks</code>
              </div>
            </div>

          </div>

        </div>
      }

      <!-- TAB 5: IAC GENERATOR & RUNBOOKS -->
      @if (activeTab === 'generator') {
        <div class="space-y-6 font-sans text-xs">
          <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-4">
            <h3 class="font-bold text-sm text-slate-50 font-sans">
              {{ ts.isRomanian ? 'Generator Declarativ Module Terraform & Proxmox LXC' : 'Declarative Terraform & Proxmox LXC Module Generator' }}
            </h3>
            <p class="text-slate-300 font-sans text-xs">
              {{ ts.isRomanian ? 'Selectează parametrii de alocare compute pentru generarea instantanee a codului HCL Terraform:' : 'Select compute allocation parameters to generate instant HCL Terraform module code:' }}
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="text-[10px] text-slate-400 uppercase block mb-1">{{ ts.isRomanian ? 'Nume Gazdă (Hostname)' : 'Hostname' }}</label>
                <input type="text" [(ngModel)]="genHostname" class="w-full p-2.5 rounded-xl bg-obsidian-900 border border-obsidian-700 text-slate-100 outline-none focus:border-slate-500" />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 uppercase block mb-1">{{ ts.isRomanian ? 'ID Container (VMID)' : 'Container VMID' }}</label>
                <input type="number" [(ngModel)]="genVmid" class="w-full p-2.5 rounded-xl bg-obsidian-900 border border-obsidian-700 text-slate-100 outline-none focus:border-slate-500" />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 uppercase block mb-1">{{ ts.isRomanian ? 'Memorie RAM (MB)' : 'RAM Ceiling (MB)' }}</label>
                <input type="number" [(ngModel)]="genRam" class="w-full p-2.5 rounded-xl bg-obsidian-900 border border-obsidian-700 text-slate-100 outline-none focus:border-slate-500" />
              </div>
            </div>

            <div class="relative mt-4">
              <pre class="p-4 rounded-xl bg-obsidian-950 border border-obsidian-750 text-slate-300 overflow-x-auto text-[11px] leading-relaxed font-mono"><code>{{ generatedTerraformCode }}</code></pre>
              <button
                (click)="copyGen()"
                class="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-400 text-slate-950 font-bold text-xs hover:bg-slate-400 transition-colors shadow"
              >
                {{ isGenCopied ? (ts.isRomanian ? 'COPIAT!' : 'COPIED!') : (ts.isRomanian ? 'COPIAZĂ HCL' : 'COPY HCL') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- TAB 6: CHAOS ENGINEERING & RESILIENCY -->
      @if (activeTab === 'chaos') {
        <div class="space-y-6 font-sans text-xs">
          
          <!-- Banner: Scheduled CI/CD Automation -->
          <div class="p-4 rounded-xl bg-obsidian-850 border border-obsidian-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <div>
                <span class="font-bold text-slate-100 text-sm">{{ ts.isRomanian ? 'Automatizare Chaos Engineering în CI/CD' : 'Automated CI/CD Chaos Engineering' }}</span>
                <span class="text-slate-400 text-xs block font-sans">{{ ts.isRomanian ? 'Programat săptămânal prin cron: "0 3 * * 0" (duminică noaptea la 03:00 UTC) în .github/workflows/chaos-scheduled.yml' : 'Scheduled weekly via cron: "0 3 * * 0" (Sunday night 03:00 UTC) in .github/workflows/chaos-scheduled.yml' }}</span>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded bg-slate-400/15 text-slate-200 text-[11px] font-bold whitespace-nowrap">CRON 0 3 * * 0</span>
          </div>

          <!-- 4-Grid Chaos Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- 1. CPU & RAM Stress -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
              <span class="text-rose-400 font-bold uppercase text-[10px]">{{ ts.isRomanian ? '1. Saturație CPU & RAM' : '1. CPU & RAM Saturation' }}</span>
              <h4 class="font-bold text-slate-100">{{ ts.isRomanian ? 'Validare Limite Cgroup & Izolare Resurse' : 'Cgroup Limits & Resource Throttling' }}</h4>
              <p class="text-slate-300 font-sans text-xs">
                {{ ts.isRomanian ? 'Injectare încărcare 100% CPU și 80% RAM pentru validarea mecanismului de limitare cgroup și prevenirea epuizării resurselor hypervisor-ului.' : 'Injecting 100% CPU and 80% RAM load to ensure cgroup limits prevent hypervisor starvation.' }}
              </p>
              <div class="p-2 rounded bg-obsidian-900 border border-obsidian-750 text-[11px] text-slate-300 font-mono">
                <code>./scripts/chaos/chaos_runner.sh cpu-stress 30 && ./scripts/chaos/chaos_runner.sh ram-pressure 30</code>
              </div>
            </div>

            <!-- 2. Service Kill & Auto-Healing -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
              <span class="text-amber-400 font-bold uppercase text-[10px]">{{ ts.isRomanian ? '2. Injectare Pană Serviciu (SIGKILL)' : '2. Service Fault Injection (SIGKILL)' }}</span>
              <h4 class="font-bold text-slate-100">{{ ts.isRomanian ? 'Validare Auto-Healing fără Intervenție Umană' : 'Automated Self-Healing Validation' }}</h4>
              <p class="text-slate-300 font-sans text-xs">
                {{ ts.isRomanian ? 'Terminare forțată a containerului/pod-ului țintă și monitorizare activă până la auto-restart complet și revenire la starea Healthy în sub 15 secunde.' : 'Force-terminating target container/pod and verifying automatic container restart to Healthy status in under 15s without human intervention.' }}
              </p>
              <div class="p-2 rounded bg-obsidian-900 border border-obsidian-750 text-[11px] text-slate-300 font-mono">
                <code>./scripts/chaos/chaos_runner.sh service-kill 5 staging-workload && ./scripts/chaos/chaos_runner.sh auto-healing-check 30</code>
              </div>
            </div>

            <!-- 3. Network Latency & Packet Loss -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
              <span class="text-sky-400 font-bold uppercase text-[10px]">{{ ts.isRomanian ? '3. Degradare Rețea & Jitter' : '3. Network Latency & Packet Loss' }}</span>
              <h4 class="font-bold text-slate-100">{{ ts.isRomanian ? 'Simulare Latență Artificială (tc netem)' : 'Traffic Control Netem Emulation' }}</h4>
              <p class="text-slate-300 font-sans text-xs">
                {{ ts.isRomanian ? 'Injectare latență de 150ms și pierdere 15% pachete la nivel de kernel pe interfața de ingress pentru testarea retransmisiilor TCP și timeout-urilor gRPC.' : 'Injecting 150ms artificial delay and 15% packet drop to stress TCP retransmissions, gRPC deadlines, and split-horizon DNS failover.' }}
              </p>
              <div class="p-2 rounded bg-obsidian-900 border border-obsidian-750 text-[11px] text-slate-300 font-mono">
                <code>./scripts/chaos/chaos_runner.sh network-latency 30 eth0 150ms</code>
              </div>
            </div>

            <!-- 4. Uptime Kuma & Ntfy/Telegram Alerts -->
            <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-3">
              <span class="text-emerald-400 font-bold uppercase text-[10px]">{{ ts.isRomanian ? '4. Validare Notificări & Alerte' : '4. Uptime Kuma & Alerting Pipeline' }}</span>
              <h4 class="font-bold text-slate-100">{{ ts.isRomanian ? 'Verificare Alertare Automată (Uptime Kuma, Ntfy, Telegram)' : 'Incident Webhooks & Automated Dispatch' }}</h4>
              <p class="text-slate-300 font-sans text-xs">
                {{ ts.isRomanian ? 'Validare automată a receptorilor de incidente: heartbeat către Uptime Kuma, notificare instantanee pe canalul Ntfy dedicat și dispatch Telegram bot.' : 'Validating automated incident alert channels: Uptime Kuma push monitor heartbeat, Ntfy topic notification, and Telegram Bot dispatch.' }}
              </p>
              <div class="p-2 rounded bg-obsidian-900 border border-obsidian-750 text-[11px] text-slate-300 font-mono">
                <code>./scripts/chaos/chaos_runner.sh alert-webhook-validate</code>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- TAB 7: OBSERVABILITY & SLO METRICS -->
      @if (activeTab === 'observability') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
          <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-4">
            <h3 class="font-bold text-sm text-slate-50">{{ ts.isRomanian ? 'Obiective la Nivel de Serviciu (SLO Cluster)' : 'Cluster Service Level Objectives (SLO)' }}</h3>
            <div class="space-y-2 text-slate-300">
              <div class="flex justify-between p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750">
                <span>{{ ts.isRomanian ? 'Disponibilitate Servicii Core:' : 'Core Service Uptime:' }}</span>
                <span class="text-slate-300 font-bold">99.9% (SLO)</span>
              </div>
              <div class="flex justify-between p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750">
                <span>{{ ts.isRomanian ? 'Latență Ingress P95:' : 'P95 Ingress Latency:' }}</span>
                <span class="text-slate-300 font-bold">&lt; 45 ms</span>
              </div>
              <div class="flex justify-between p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750">
                <span>{{ ts.isRomanian ? 'Rată Erori HTTP 5xx:' : 'HTTP 5xx Error Budget:' }}</span>
                <span class="text-slate-300 font-bold">&lt; 0.05%</span>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-obsidian-850 border border-obsidian-750 shadow-xl space-y-4">
            <h3 class="font-bold text-sm text-slate-50">{{ ts.isRomanian ? 'Pipeline Telemetrie LGTM OpenTelemetry' : 'LGTM OpenTelemetry Telemetry Pipeline' }}</h3>
            <div class="space-y-2 text-slate-300">
              <div class="p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750 flex justify-between">
                <span>Prometheus TSDB</span>
                <span class="text-slate-300 font-bold">:9090</span>
              </div>
              <div class="p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750 flex justify-between">
                <span>Grafana Loki Log Streams</span>
                <span class="text-slate-300 font-bold">:3100</span>
              </div>
              <div class="p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-750 flex justify-between">
                <span>Grafana Tempo Distributed Tracing</span>
                <span class="text-slate-300 font-bold">:3200 (OTLP :4317/:4318)</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 8: TECHNICAL GLOSSARY -->
      @if (activeTab === 'glossary') {
        <div class="space-y-4 font-sans text-xs">
          <input
            type="text"
            [(ngModel)]="glossarySearch"
            [placeholder]="ts.isRomanian ? 'Filtrează termenii din glosar (ex: ZFS, eBPF, Passkeys, NUT)...' : 'Filter glossary terms (e.g. ZFS, eBPF, Passkeys, NUT)...'"
            class="w-full p-3 rounded-xl bg-obsidian-900 border border-obsidian-700 text-slate-100 text-xs font-sans outline-none focus:border-slate-500"
          />

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (g of (ts.isRomanian ? filteredGlossaryRo : filteredGlossaryEn); track g.term) {
              <div class="p-4 rounded-xl bg-obsidian-850 border border-obsidian-750 space-y-1.5 shadow-md">
                <div class="font-bold text-slate-50 font-sans text-sm text-slate-300">{{ g.term }}</div>
                <p class="text-slate-300 font-sans leading-relaxed">{{ g.def }}</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- MODAL: FORENSIC INVESTIGATION DOSSIER -->
      @if (selectedCase) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto" (click)="closeCase()">
          <div
            class="relative w-full max-w-4xl max-h-[90vh] bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-200 font-sans my-auto"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
            <div class="flex items-start justify-between border-b border-obsidian-750 pb-4 gap-4">
              <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs font-sans font-bold px-2.5 py-0.5 rounded bg-obsidian-800 text-slate-200 border border-obsidian-700">
                    {{ selectedCase.caseId }}
                  </span>
                  <span class="text-xs font-sans px-2 py-0.5 rounded bg-obsidian-800 text-slate-300 border border-obsidian-700">
                    {{ selectedCase.classification }}
                  </span>
                  <span class="text-xs font-sans px-2 py-0.5 rounded bg-obsidian-850 text-slate-400 border border-obsidian-800">
                    {{ selectedCase.date }} · {{ selectedCase.author }}
                  </span>
                  <span class="text-xs font-sans px-2 py-0.5 rounded bg-obsidian-800 text-slate-200 border border-obsidian-700 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {{ selectedCase.status }}
                  </span>
                </div>
                <h3 class="text-xl sm:text-2xl font-serif font-normal text-slate-50 leading-tight tracking-tight">
                  {{ selectedCase.title }}
                </h3>
                <div class="text-xs font-sans text-slate-400">
                  {{ ts.isRomanian ? 'Director Proiect:' : 'Project Directory:' }} <span class="text-slate-300">{{ selectedCase.repoPath }}</span>
                </div>
              </div>

              <!-- Close Button -->
              <button
                (click)="closeCase()"
                class="p-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 hover:text-slate-100 transition-colors border border-obsidian-700 shrink-0"
                aria-label="Close modal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Modal Body Sections -->
            <div class="space-y-6 text-xs sm:text-sm">

              <!-- 1. Executive Summary -->
              <div class="space-y-2">
                <h5 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  {{ ts.isRomanian ? '1. Rezumat Executiv & Context Incident' : '1. Executive Summary & Incident Context' }}
                </h5>
                <p class="text-slate-300 leading-relaxed bg-obsidian-850 p-4 rounded-xl border border-obsidian-750 font-sans font-normal">
                  {{ selectedCase.summary }}
                </p>
              </div>

              <!-- 2. Attack Vector & Pretext -->
              <div class="space-y-2">
                <h5 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  {{ ts.isRomanian ? '2. Vector de Atac & Psihologie / Pretext' : '2. Attack Vector & Pretext Engineering' }}
                </h5>
                <div class="bg-obsidian-850 p-4 rounded-xl border border-obsidian-750 text-slate-300 leading-relaxed font-sans text-xs sm:text-sm font-normal">
                  {{ selectedCase.attackVector }}
                </div>
              </div>

              <!-- 3. Reverse Engineering Findings -->
              <div class="space-y-2">
                <h5 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  {{ ts.isRomanian ? '3. Descoperiri Criminalistice & Decompilare Backend' : '3. Forensic Discoveries & Backend Decompilation' }}
                </h5>
                <div class="space-y-2 bg-obsidian-850 p-4 rounded-xl border border-obsidian-750">
                  @for (finding of selectedCase.reverseFindings; track finding) {
                    <div class="flex items-start gap-2.5">
                      <span class="text-slate-400 font-sans mt-0.5 font-bold">›</span>
                      <span class="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">{{ finding }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- 4. Financial Trapping & Post-Exploitation -->
              <div class="space-y-2">
                <h5 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  {{ ts.isRomanian ? '4. Drenaj Financiar & Post-Exploatare' : '4. Financial Drain & Post-Exploitation Mechanics' }}
                </h5>
                <p class="text-slate-300 leading-relaxed bg-obsidian-850 p-4 rounded-xl border border-obsidian-750 text-xs sm:text-sm font-sans font-normal">
                  {{ selectedCase.financialFlow }}
                </p>
              </div>

              <!-- 5. Indicators of Compromise (IoCs) -->
              <div class="space-y-2">
                <h5 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  {{ ts.isRomanian ? '5. Indicatori Tehnici de Compromitere (IoCs)' : '5. Technical Indicators of Compromise (IoCs)' }}
                </h5>
                <div class="overflow-x-auto rounded-xl border border-obsidian-750">
                  <table class="w-full font-sans text-xs text-left bg-obsidian-850">
                    <thead class="bg-obsidian-900 text-slate-400 border-b border-obsidian-750 text-[11px] uppercase">
                      <tr>
                        <th class="py-2.5 px-4">{{ ts.isRomanian ? 'Tip Indicator' : 'Indicator Type' }}</th>
                        <th class="py-2.5 px-4">{{ ts.isRomanian ? 'Valoare / Artefact Identificat' : 'Identified Value / Artifact' }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-obsidian-750 text-slate-300">
                      @for (ioc of selectedCase.iocs; track ioc.value) {
                        <tr>
                          <td class="py-2.5 px-4 font-bold text-slate-400">{{ ioc.type }}</td>
                          <td class="py-2.5 px-4 text-slate-200">{{ ioc.value }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 6. Datacenter Defense & Detection -->
              <div class="space-y-2">
                <h5 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  {{ ts.isRomanian ? '6. Implementare în Datacenter & Detecție Runtime' : '6. Datacenter Implementation & Runtime Detection' }}
                </h5>
                <div class="p-4 rounded-xl bg-obsidian-850 border border-obsidian-750 text-slate-300 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                  {{ selectedCase.datacenterDefense }}
                </div>
              </div>

              <!-- 7. MITRE ATT&CK Mapping -->
              <div class="space-y-2">
                <h5 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  {{ ts.isRomanian ? '7. Mapare MITRE ATT&CK' : '7. MITRE ATT&CK Framework Mapping' }}
                </h5>
                <div class="flex flex-wrap gap-2 font-sans text-xs">
                  @for (m of selectedCase.mitreAttack; track m) {
                    <span class="px-3 py-1 rounded-lg bg-obsidian-800 border border-obsidian-700 text-slate-300">
                      {{ m }}
                    </span>
                  }
                </div>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="border-t border-obsidian-750 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="text-xs font-sans text-slate-400">
                {{ ts.isRomanian ? 'Dosar arhivat în repozitoriu: ' : 'Case archived in repo: ' }}
                <code class="text-slate-300 bg-obsidian-800 px-2 py-0.5 rounded border border-obsidian-750 font-mono">{{ selectedCase.repoPath }}/case_study.md</code>
              </div>
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <a
                  [href]="selectedCase.githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-200 hover:bg-white text-slate-950 font-bold text-xs font-sans text-center transition-all shadow-lg"
                >
                  {{ ts.isRomanian ? 'Vezi Studiul de Caz pe GitHub ↗' : 'View Full Case Study on GitHub ↗' }}
                </a>
                <button
                  (click)="closeCase()"
                  class="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 hover:text-slate-100 text-xs font-sans transition-all border border-obsidian-700"
                >
                  {{ ts.isRomanian ? 'Închide' : 'Close' }}
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- MODAL DIALOG: SELECTED WINDOWS CVE DOSSIER -->
      @if (selectedCve) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto" (click)="closeCve()">
          <div
            class="relative w-full max-w-4xl max-h-[90vh] bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-200 font-sans my-auto"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
            <div class="flex items-start justify-between border-b border-obsidian-750 pb-4 gap-4">
              <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs font-sans font-bold px-2.5 py-0.5 rounded uppercase"
                    [class.bg-rose-500]="selectedCve.cvssSeverity === 'CRITICAL'"
                    [class.text-white]="selectedCve.cvssSeverity === 'CRITICAL'"
                    [class.bg-amber-500]="selectedCve.cvssSeverity === 'HIGH'"
                    [class.text-slate-950]="selectedCve.cvssSeverity === 'HIGH'"
                    [class.bg-sky-500]="selectedCve.cvssSeverity === 'MEDIUM'"
                    [class.text-slate-950]="selectedCve.cvssSeverity === 'MEDIUM'"
                  >
                    CVSS {{ selectedCve.cvssScore }} · {{ selectedCve.cvssSeverity }}
                  </span>
                  <span class="text-xs font-mono px-2 py-0.5 rounded bg-obsidian-800 text-rose-300 border border-obsidian-700">
                    {{ selectedCve.cveId }}
                  </span>
                  <span class="text-xs font-sans px-2 py-0.5 rounded bg-obsidian-850 text-slate-400 border border-obsidian-800">
                    {{ selectedCve.date }}
                  </span>
                  <span class="text-xs font-sans px-2 py-0.5 rounded bg-obsidian-800 text-slate-200 border border-obsidian-700 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    {{ selectedCve.status }}
                  </span>
                </div>
                <h3 class="text-xl sm:text-2xl font-serif font-normal text-slate-50 leading-tight tracking-tight">
                  {{ selectedCve.title }}
                </h3>
                <div class="text-xs font-mono text-slate-400">
                  <span class="text-slate-500">Vector:</span> <span class="text-slate-300">{{ selectedCve.cvssVector }}</span>
                </div>
              </div>

              <!-- Close Button -->
              <button
                (click)="closeCve()"
                class="p-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 hover:text-slate-100 transition-colors border border-obsidian-700 shrink-0"
                aria-label="Close modal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="space-y-6 text-xs sm:text-sm">
              <!-- 1. Executive Summary -->
              <div class="space-y-2">
                <h4 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  {{ ts.isRomanian ? '1. Sumar Executiv & Clasificare Amenințare' : '1. Executive Summary & Threat Classification' }}
                </h4>
                <p class="text-slate-300 leading-relaxed font-sans font-normal">
                  {{ selectedCve.summary }}
                </p>
              </div>

              <!-- 2. Root Cause Analysis -->
              <div class="space-y-2">
                <h4 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  {{ ts.isRomanian ? '2. Cauza Primară & Mecanismul de Memorie (Root Cause)' : '2. Root Cause Analysis & Memory Flaw Mechanism' }}
                </h4>
                <div class="p-4 rounded-xl bg-obsidian-950/80 border border-obsidian-750 text-slate-300 leading-relaxed font-sans text-xs">
                  {{ selectedCve.rootCause }}
                </div>
              </div>

              <!-- 3. Impact on Our Homelab Infrastructure -->
              <div class="space-y-2">
                <h4 class="text-xs font-sans font-bold uppercase tracking-wider text-rose-400">
                  {{ ts.isRomanian ? '3. Impact Specific pe Arhitectura Noastră (hosts.yml & Hyper-V)' : '3. Specific Impact on Our Homelab Architecture (hosts.yml & Hyper-V)' }}
                </h4>
                <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-slate-200 leading-relaxed font-sans text-xs">
                  {{ selectedCve.homelabImpact }}
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                  @for (node of selectedCve.affectedNodes; track node) {
                    <span class="px-2 py-1 rounded bg-obsidian-800 border border-obsidian-700 text-slate-300 text-xs font-mono">
                      {{ node }}
                    </span>
                  }
                </div>
              </div>

              <!-- 4. Attack Kill Chain -->
              <div class="space-y-2">
                <h4 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                  {{ ts.isRomanian ? '4. Lanțul de Exploatare (Kill Chain Step-by-Step)' : '4. Exploitation Kill Chain Step-by-Step' }}
                </h4>
                <div class="space-y-2 p-4 rounded-xl bg-obsidian-950/80 border border-obsidian-750">
                  @for (step of selectedCve.attackChain; track step; let idx = $index) {
                    <div class="flex items-start gap-2.5 text-xs font-sans">
                      <span class="px-1.5 py-0.5 rounded bg-obsidian-800 text-slate-300 border border-obsidian-700 font-mono text-[10px] font-bold">{{ idx + 1 }}</span>
                      <span class="text-slate-300 leading-relaxed">{{ step }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- 5. Remediation Playbook -->
              <div class="space-y-2">
                <h4 class="text-xs font-sans font-bold uppercase tracking-wider text-emerald-400">
                  {{ ts.isRomanian ? '5. Plan de Remediere & Hardening' : '5. Remediation & Hardening Playbook' }}
                </h4>
                <div class="space-y-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-200 text-xs">
                  @for (rem of selectedCve.remediationSteps; track rem) {
                    <div class="flex items-start gap-2">
                      <span class="text-emerald-400 font-bold">✓</span>
                      <span class="leading-relaxed">{{ rem }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- 6. Sigma Detection Rule -->
              @if (selectedCve.sigmaRule) {
                <div class="space-y-2">
                  <h4 class="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                    {{ ts.isRomanian ? '6. Regulă de Detecție SIEM (Sigma Rule)' : '6. SIEM Detection Signature (Sigma Rule)' }}
                  </h4>
                  <pre class="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-800 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-tight">{{ selectedCve.sigmaRule }}</pre>
                </div>
              }
            </div>

            <!-- Modal Footer -->
            <div class="border-t border-obsidian-750 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="text-xs font-sans text-slate-400 space-y-1">
                <div>
                  {{ ts.isRomanian ? 'Raport tehnic: ' : 'Technical report: ' }}
                  <code class="text-slate-300 bg-obsidian-800 px-2 py-0.5 rounded border border-obsidian-750 font-mono">{{ selectedCve.repoPath }}/report.md</code>
                </div>
                <div>
                  {{ ts.isRomanian ? 'Ghid remediere: ' : 'Fix playbook: ' }}
                  <code class="text-emerald-300 bg-obsidian-800 px-2 py-0.5 rounded border border-obsidian-750 font-mono">{{ selectedCve.repoPath }}/fix.md</code>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <a
                  [href]="selectedCve.fixGithubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-sans text-center transition-all shadow-lg flex items-center justify-center gap-1.5"
                >
                  <span>🛠️</span>
                  <span>{{ ts.isRomanian ? 'Ghid Rezolvare (fix.md) ↗' : 'Fix Guide (fix.md) ↗' }}</span>
                </a>
                <a
                  [href]="selectedCve.githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-sans text-center transition-all shadow-lg flex items-center justify-center gap-1.5"
                >
                  <span>📄</span>
                  <span>{{ ts.isRomanian ? 'Raport (report.md) ↗' : 'Report (report.md) ↗' }}</span>
                </a>
                <button
                  (click)="closeCve()"
                  class="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 hover:text-slate-100 text-xs font-sans transition-all border border-obsidian-700"
                >
                  {{ ts.isRomanian ? 'Închide' : 'Close' }}
                </button>
              </div>
            </div>

          </div>
        </div>
      }

    </section>
  `
})
export class ArchitectureBlueprintComponent implements OnInit {
  ts = inject(TranslationService);
  activeTab: 'cloud' | 'vlan' | 'power' | 'storage' | 'cyber' | 'zerotrust' | 'generator' | 'chaos' | 'observability' | 'glossary' = 'cloud';
  cyberSubSection: 'all' | 'cases' | 'cve' | 'perimeter' | 'pillars' = 'all';
  selectedCase: ForensicCase | null = null;
  selectedCve: CveAssessment | null = null;

  cveAssessmentsRo = CVE_ASSESSMENTS_RO;
  cveAssessmentsEn = CVE_ASSESSMENTS_EN;

  openCve(c: CveAssessment) {
    this.selectedCve = c;
  }

  closeCve() {
    this.selectedCve = null;
  }

  ngOnInit() {
    this.checkHash();
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => this.checkHash());
    }
  }

  checkHash() {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#cyber' || hash === '#cybersecurity' || hash === '#dfir' || hash === '#forensics') {
        this.activeTab = 'cyber';
      } else if (hash === '#cve' || hash.startsWith('#cve-')) {
        this.activeTab = 'cyber';
        this.cyberSubSection = 'cve';
        if (hash.startsWith('#cve-')) {
          const cveId = hash.replace('#cve-', '');
          const list = this.ts.isRomanian ? this.cveAssessmentsRo : this.cveAssessmentsEn;
          const found = list.find(c =>
            c.id.toLowerCase().includes(cveId) ||
            c.cveId.toLowerCase().includes(cveId) ||
            cveId.includes(c.id.toLowerCase())
          );
          if (found) {
            this.openCve(found);
          }
        }
      } else if (hash.startsWith('#case-')) {
        this.activeTab = 'cyber';
        const caseSlug = hash.replace('#case-', '');
        const found = this.forensicCasesEn.find(c => c.id.includes(caseSlug));
        if (found) {
          this.openCase(found);
        }
      }
    }
  }

  openCase(c: ForensicCase) {
    this.selectedCase = c;
  }

  closeCase() {
    this.selectedCase = null;
  }

  forensicCasesEn: ForensicCase[] = [
    {
      id: 'task-scam',
      caseId: 'SEC-2026-TASK-001',
      title: 'Forensic Deconstruction: Fraudulent Task Scam & USDT TRC-20 Drainage Platform',
      badge: 'Pig Butchering & Crypto Drainage',
      classification: 'TLP:CLEAR',
      date: '17 April 2026',
      author: '@stefanutc1',
      status: 'Completed & Documented',
      summary: 'Forensic teardown of a global Task Scam (hybrid Pig Butchering) infrastructure recruiting victims via WhatsApp/Telegram under the pretext of rating products on major e-commerce platforms. Traffic interception via Burp Suite and backend route discovery revealed technical proof of premeditated financial theft.',
      attackVector: 'Telegram/WhatsApp recruitment -> Access to Vue.js web app via exclusive invite code -> Fictitious balance generation in UI -> Mandatory USDT TRC-20 deposits for VIP levels -> Indefinite withdrawal blocking citing fabricated compliance taxes.',
      reverseFindings: [
        'Unauthenticated /api/v1/site/config endpoint disclosing operational campaign parameters in plain JSON.',
        'Hardcoded withdrawal kill-switch: withdrawMethodBank: false, withdrawMethodRevolut: false proving fiat withdrawal buttons were non-functional decoys.',
        'Geographic targeting lock: defaultCountryCode: "+40" restricting campaign intake exclusively to Romanian phone numbers.',
        'Severe SQL Injection surface across /api/v1/user/auth/* via invite_code and username parameters.'
      ],
      financialFlow: 'USDT TRC-20 deposits to attacker addresses. Funds are routed instantly through crypto mixers and consolidation clusters. Withdrawals are perpetually blocked demanding continuous "security audit unlock" fees.',
      iocs: [
        { type: 'API Route', value: '/api/v1/site/config' },
        { type: 'Auth Route', value: '/api/v1/user/auth/login & /register' },
        { type: 'Target Scope', value: 'Country Code +40 (Romania Lock)' },
        { type: 'TRC-20 Wallet', value: 'TLyG...x89W (Consolidation Node)' }
      ],
      datacenterDefense: 'Suricata IDS signature on OPNsense inspecting and blocking payloads containing withdrawMethodBank:false. Attacker IPs banned via CrowdSec and correlated in Wazuh SIEM on Proxmox.',
      repoPath: 'cyber/task-scam-infrastructure-analysis',
      githubUrl: 'https://github.com/stefanutc1/datacenter/blob/main/cyber/task-scam-infrastructure-analysis/case_study.md',
      mitreAttack: ['T1566 (Phishing)', 'T1589 (Gather Victim Info)', 'T1190 (Exploit Public App)', 'T1539 (Steal Web Session)']
    },
    {
      id: 'revolut-vishing',
      caseId: 'SEC-2026-VISH-002',
      title: 'Advanced Voice Phishing (Vishing) & Real-Time Credential Relay Targeting FinTech (Revolut)',
      badge: 'Telephony Fraud & Reverse Proxy Relay',
      classification: 'TLP:CLEAR',
      date: '10 August 2026',
      author: '@stefanutc1',
      status: 'Completed & Documented',
      summary: 'Forensic teardown of an aggressive Voice Phishing (Vishing) campaign weaponizing SIP VoIP Caller ID Spoofing to impersonate Revolut anti-fraud personnel. Victims were lured into cloned portals that harvested card details, 3D Secure SMS codes, and in-app biometric approvals in real time.',
      attackVector: 'Phone call with spoofed Caller ID (0749-XXX-XXX) -> Urgency manufacture ("unauthorized 1,850 RON charge") -> SMS shortener link to cloned portal -> Real-time PAN, CVV, expiry capture -> Synchronous bank API injection -> Biometric push approval coercion.',
      reverseFindings: [
        'Manipulation of SIP "From" and "P-Asserted-Identity" headers on insecure VoIP trunks to spoof legitimate corporate CLI.',
        'Cloned bank landing portal deployed on disposable TLDs (.xyz, .online) using free Let\'s Encrypt TLS certs.',
        'Real-time C2 reverse proxy piping victim-submitted credentials synchronously into the legitimate banking API.',
        'Synchronous coercion technique: operator maintains active voice call while compelling victim to tap in-app biometric approvals.'
      ],
      financialFlow: 'Instant exfiltration via SEPA Instant Transfers to mule accounts opened with synthetic identities or immediate crypto liquidation on P2P exchanges.',
      iocs: [
        { type: 'VoIP Spoofed CLI', value: '0749-XXX-XXX (Telekom/Orange Spoof)' },
        { type: 'Phishing Domain', value: 'revolut-security-auth[.]xyz' },
        { type: 'Relay Protocol', value: 'WSS / HTTPS reverse proxy relay' },
        { type: 'Exfiltration', value: 'SEPA Instant Mule IBANs' }
      ],
      datacenterDefense: 'OPNsense & Proxmox VE defense-in-depth blocking Newly Registered Domains (NRD < 30 days), SIP header inspection on Asterisk PBX, and automated takedown reporting playbooks.',
      repoPath: 'cyber/revolut-vishing-forensics',
      githubUrl: 'https://github.com/stefanutc1/datacenter/blob/main/cyber/revolut-vishing-forensics/case_study.md',
      mitreAttack: ['T1566.002 (Spearphishing Link)', 'T1056.003 (Web Portal Harvesting)', 'T1539 (Steal Web Session)', 'T1656 (Impersonation)']
    },
    {
      id: 'tiktok-mrr',
      caseId: 'SEC-2025-MRR-001',
      title: 'Forensic Investigation: TikTok Marketing Funnels & Recursive Master Resell Rights (MRR) Schemes',
      badge: 'Algorithmic Funnel & Payment Abuse',
      classification: 'TLP:CLEAR',
      date: '14 June 2025 - 18 April 2026',
      author: '@stefanutc1',
      status: 'Reported & Documented',
      summary: 'Forensic examination of automated "faceless" marketing funnels on TikTok targeting Eastern European users. Documented a $497 "Digital Wealth Accelerator" transaction on stan.store. The delivered package contained purely ChatGPT-generated e-books coupled with a Master Resell Rights license mandating the buyer to replicate the funnel and resell the same course, constituting a recursive pyramid scheme.',
      attackVector: 'Viral TikTok clips -> Synthetic AI voiceovers (ElevenLabs / CapCut) -> Link-in-Bio redirect to stan.store / Beacons -> $497 course payment via Stripe/PayPal -> Delivery of AI-synthesized PDF + mandatory MRR resale license.',
      reverseFindings: [
        'Stylometric textual analysis: 99.4% match with raw GPT-3.5/GPT-4 prompts, confirming absence of original research.',
        'MRR license prohibits altering core content while mandating fixed $497 resale price, meeting FTC definition of recursive pyramid schemes.',
        'Abuse of Stripe Connect merchant infrastructure on Stan.store to circumvent underwriting scrutiny.',
        'Formal abuse notices submitted to abuse@stan.store, compliance@stan.store, Stripe Legal, and FTC.'
      ],
      financialFlow: 'Settlement via Stripe Connect directly to merchant bank accounts. Funds are rapidly withdrawn to avert chargeback clawbacks. Victim\'s sole financial recovery route is recruiting secondary buyers.',
      iocs: [
        { type: 'Target Platform', value: 'TikTok In-App Browser & Feed' },
        { type: 'Landing Host', value: '*.stan.store merchant subdomains' },
        { type: 'Payment Gateways', value: 'Stripe Connect API, PayPal Checkout' },
        { type: 'Evidence Hash', value: '4b91f0c2a83e... (SHA-256)' }
      ],
      datacenterDefense: 'Proxmox-hosted OSINT scraping worker mapping URL shortener redirect hops, risk scoring domains, and enforcing DNS sinkholing via OPNsense Unbound.',
      repoPath: 'cyber/tiktok-mrr-scam-infrastructure',
      githubUrl: 'https://github.com/stefanutc1/datacenter/blob/main/cyber/tiktok-mrr-scam-infrastructure/case_study.md',
      mitreAttack: ['T1584 (Compromise Infrastructure)', 'T1566.002 (Spearphishing Link)', 'T1598 (Phishing for Information)']
    },
    {
      id: 'openid-mitm',
      caseId: 'SEC-2025-BITM-003',
      title: 'Forensic Analysis: Adversary-in-the-Middle (AiTM) on Steam OpenID 2.0 Authentication',
      badge: 'AiTM & Session Token Hijacking',
      classification: 'TLP:CLEAR',
      date: '22 November 2025',
      author: '@stefanutc1',
      status: 'Completed & Documented',
      summary: 'Forensic investigation into an advanced Browser-in-the-Middle (BitM) campaign targeting esports players (CS2, Dota 2). Threat actors used an in-DOM synthetic window with fake SSL address bar to harvest OpenID 2.0 credentials, immediately locking accounts via Family View PIN and hijacking trade offers via Web API.',
      attackVector: 'Tournament voting portal -> Click "Sign in through Steam" -> Synthetic in-DOM BitM window with simulated SSL address bar -> Input credentials and Steam Guard TOTP -> Real-time C2 relay to Valve -> Immediate 4-digit Family View PIN lock -> Steam Web API key generation for trade hijacking.',
      reverseFindings: [
        'Simulated browser popup drawn via styled DOM container with draggable titlebar and simulated SSL padlock to bypass native browser security sandbox boundaries.',
        'Harvest script main.bundle.js intercepts form submission and transmits credentials via fetch() to /api/v2/auth/steam_callback.',
        'C2 reverse proxy initiates live authentication handshake with Valve servers, capturing steamLoginSecure and sessionid cookies.',
        'Automated post-exploitation bot: immediately sets a 4-digit Family View PIN (freezing victim out of account recovery) and provisions a Steam Web API Key to hijack trade offers in real time.',
      ],
      financialFlow: 'Adversary bot cancels legitimate trade offers and substitutes identical offers directed to clone accounts, draining high-value weapon skins and virtual inventory assets.',
      iocs: [
        { type: 'AiTM Callback', value: '/api/v2/auth/steam_callback' },
        { type: 'Phishing Bundle', value: 'main.bundle.js (obfuscated BitM engine)' },
        { type: 'Extracted Cookies', value: 'steamLoginSecure, sessionid' },
        { type: 'Post-Exploit Action', value: 'Family View PIN Lock + Web API Provisioning' }
      ],
      datacenterDefense: 'Suricata IDS rule on VM 200 flagging simulated BitM window canvas structures, T-Pot HTTP event correlation, and Wazuh alerts on suspicious API token activity.',
      repoPath: 'cyber/openid-mitm-phishing-forensics',
      githubUrl: 'https://github.com/stefanutc1/datacenter/blob/main/cyber/openid-mitm-phishing-forensics/case_study.md',
      mitreAttack: ['T1566.002 (Spearphishing Link)', 'T1539 (Steal Web Session Cookie)', 'T1078 (Valid Accounts)', 'T1056.003 (Web Portal Harvesting)']
    }
  ];

  forensicCasesRo: ForensicCase[] = [
    {
      id: 'mediagalaxy-fraud',
      caseId: 'SEC-2026-ECOM-005',
      title: 'Deconstrucție Forensic: Clonare Retailer E-Commerce & Infrastructură SaaS Chineză (Clonă Media Galaxy pe TikTok)',
      badge: 'Phishing Reclame Sociale & Pivot C2 Cloudflare',
      classification: 'TLP:CLEAR',
      date: '16 Septembrie 2026',
      author: '@stefanutc1',
      status: 'Mitigat & Izolat prin Sinkhole',
      summary: 'Analiză criminalistică completă a unei campanii agresive de inginerie socială derulată prin reclame plătite pe TikTok, ce clona identitatea vizuală a retailerului Media Galaxy (Altex România). Atacatorii au direcționat utilizatorii către un subdomeniu compromis conectat la o platformă de phishing SaaS din China (yiyangsaas.com), tranzacționând fraudulos fonduri de pe un card virtual Revolut și lansând capcane secundare de preluare de cont (ATO).',
      attackVector: 'Reclamă video sponsorizată TikTok -> Browser in-app -> Subdomeniu de phishing (mediagalaxy.voetbalshop-nlco.com) -> Pagină clonată de checkout -> Furt date card (PAN/CVV) și date personale -> Afișare pagină falsă de "Mentenanță" -> Trimitere automată confirmare falsă de comandă [229942-177457] și tentativă resetare parolă (586571).',
      reverseFindings: [
        'Codul sursă DOM declară explicit <html lang="zh-CN"> cu module CSS specifice platformelor de fraudă din China (#module_login.module_login_default, window._CEDDE_ET).',
        'Scanarea directă pe porturile SSL 443/8443 ale IP-ului Cloudflare (104.16.145.247) a dezvăluit certificatul cu CN: yiyangsaas.com, înregistrat prin eName Technology Co. în Yunnan, China.',
        'Arhitectură duală de releu e-mail: info.mailapp-fly.com (cu semnătură DKIM validă) și domeniul paravan worvixglobal.com (înregistrat la NameSilo în Feb 2025 cu servere MX Zoho Mail).',
        'Adrese drop de recepție configurate în antetul Reply-To: MaryxBeckb96@gmail.com și brekerfurught@outlook.com.'
      ],
      financialFlow: 'Tranzacție neautorizată de ~21 EUR (~105 RON) pe card virtual Revolut alimentat din cont BCR, sub descrierea de comerciant fictiv "morvethemi london". Cardul a fost șters imediat; procedură de refuz la plată (chargeback) inițiată conform Visa/Mastercard Rule 4853 / Condition 13.1.',
      iocs: [
        { type: 'FQDN Phishing', value: 'mediagalaxy.voetbalshop-nlco.com' },
        { type: 'Backend C2 SaaS', value: 'yiyangsaas.com (Yunnan, China)' },
        { type: 'Releu E-mail FQDN', value: 'email.worvixglobal.com & info.mailapp-fly.com' },
        { type: 'Adrese Drop', value: 'MaryxBeckb96@gmail.com / brekerfurught@outlook.com' },
        { type: 'IP-uri Proxy', value: '104.16.145.247 / 104.21.14.99' },
        { type: 'Token Fraudă', value: 'Comandă [229942-177457] / Cod OTP 586571' }
      ],
      datacenterDefense: 'Sinkhole Unbound DNS (0.0.0.0) pe gateway OPNsense (192.168.1.1), reguli Suricata IDS personalizate (sid:1000951-1000956), reguli plutitoare de respingere firewall L3/L4 și corelare în Wazuh SIEM.',
      repoPath: 'cyber/mediagalaxy-ecommerce-fraud-forensics',
      githubUrl: 'https://github.com/stefanutc1/datacenter/blob/main/cyber/mediagalaxy-ecommerce-fraud-forensics/case_study.md',
      mitreAttack: ['T1566.002 (Link Spearphishing)', 'T1056.003 (Recoltare Credențiale Web)', 'T1584.001 (Compromitere Domeniu)', 'T1071.001 (Protocoale Web)', 'T1657 (Furt Financiar)']
    },
    {
      id: 'task-scam',
      caseId: 'SEC-2026-TASK-001',
      title: 'Deconstrucție Forensic: Platformă Frauduloasă de Task Scam & Drenaj USDT TRC-20',
      badge: 'Pig Butchering & Drenaj Cripto',
      classification: 'TLP:CLEAR',
      date: '17 Aprilie 2026',
      author: '@stefanutc1',
      status: 'Finalizat & Documentat',
      summary: 'Dezasamblarea criminalistică a unei infrastructuri globale de Task Scam (hibrid Pig Butchering) ce recruta utilizatori pe WhatsApp/Telegram promițând comisioane pentru evaluarea produselor pe platforme e-commerce. Interceptarea traficului prin Burp Suite a expus un kill-switch hardcodat pentru retrageri și filtrare geografică strictă pe numere românești.',
      attackVector: 'Recrutare Telegram/WhatsApp -> Aplicație web Vue.js cu link de invitație -> Generare balanțe fictive în UI -> Cerință de depunere USDT TRC-20 pentru niveluri VIP -> Blocare permanentă a retragerilor sub pretextul plății unor taxe suplimentare.',
      reverseFindings: [
        'Endpoint /api/v1/site/config neautentificat ce dezvăluie parametrii interni ai campaniei în format JSON curat.',
        'Kill-Switch hardcodat pentru retrageri: withdrawMethodBank: false, withdrawMethodRevolut: false — butoanele de retragere erau pure elemente decorative.',
        'Blocare geografică: defaultCountryCode: "+40" restricționează înregistrarea victimelor exclusiv la numere din România.',
        'Suprafață SQLi critică pe rutele /api/v1/user/auth/* prin parametrii invite_code și username.'
      ],
      financialFlow: 'Depozite în USDT TRC-20 către adresa atacatorului. Fondurile sunt redirecționate instantaneu către mixere și portofele de consolidare. Retragerile sunt blocate sub cererea unor plăți continue de "deblocare audit".',
      iocs: [
        { type: 'Rută API', value: '/api/v1/site/config' },
        { type: 'Rută Autentificare', value: '/api/v1/user/auth/login & /register' },
        { type: 'Target Geografic', value: 'Prefix +40 (România Lock)' },
        { type: 'Portofel TRC-20', value: 'TLyG...x89W (Nod Consolidare)' }
      ],
      datacenterDefense: 'Semnătură Suricata IDS pe OPNsense ce blochează payload-urile cu parametrul withdrawMethodBank:false. IP-uri blocate automat prin CrowdSec și corelate în Wazuh SIEM pe Proxmox.',
      repoPath: 'cyber/task-scam-infrastructure-analysis',
      githubUrl: 'https://github.com/stefanutc1/datacenter/blob/main/cyber/task-scam-infrastructure-analysis/case_study.md',
      mitreAttack: ['T1566 (Phishing)', 'T1589 (Colectare Date Victime)', 'T1190 (Exploatare Aplicație Web)', 'T1539 (Furt Sesiune Web)']
    },
    {
      id: 'revolut-vishing',
      caseId: 'SEC-2026-VISH-002',
      title: 'Vishing Avansat & Relay de Credențiale în Timp Real Vizând Utilizatorii FinTech (Revolut)',
      badge: 'Fraudă Telefonică & Proxy Relay',
      classification: 'TLP:CLEAR',
      date: '10 August 2026',
      author: '@stefanutc1',
      status: 'Finalizat & Documentat',
      summary: 'Deconstrucția criminalistică a unei campanii de Voice Phishing (Vishing) ce a utilizat spoofing al Caller ID-ului prin trunchiuri SIP VoIP pentru a impersona echipa antifraudă Revolut. Victimele erau direcționate către clone web ce interceptau datele de card, codurile SMS 3DS și aprobările biometrice în timp real.',
      attackVector: 'Apel telefonic cu Caller ID falsificat (0749-XXX-XXX) -> Creare stare de urgență ("plată neautorizată de 1.850 RON") -> SMS cu link scurtat către portal clonă -> Recoltare PAN, CVV, Dată expirare -> Injectare imediată prin API bancar -> Forțare aprobare push biometrică la telefon.',
      reverseFindings: [
        'Manipularea antetelor SIP "From" și "P-Asserted-Identity" pe gateway-uri VoIP neautentificate pentru falsificarea numărului de apelant.',
        'Portal clonă găzduit pe TLD-uri efemere (.xyz / .online) securizat prin certificate Let\'s Encrypt gratuite.',
        'C2 reverse proxy în timp real ce conectează sesiunea victimei direct cu API-ul bancar legitim pentru tranzacții imediate.',
        'Tehnică de "coerciție sincronă" prin menținerea victimei în apel vocal până la finalizarea autorizării 3D Secure.'
      ],
      financialFlow: 'Transferuri instantanee prin SEPA Instant către conturi cărăuș (mule IBAN) deschise cu identități furate sau achiziții rapide de monedă virtuală pe burse peer-to-peer.',
      iocs: [
        { type: 'CLI VoIP Spoofat', value: '0749-XXX-XXX (Telekom/Orange Spoof)' },
        { type: 'Domeniu Phishing', value: 'revolut-security-auth[.]xyz' },
        { type: 'Protocol Releu', value: 'WSS / HTTPS reverse proxy relay' },
        { type: 'Exfiltrare', value: 'IBAN-uri Cărăuș SEPA Instant' }
      ],
      datacenterDefense: 'Filtrare OPNsense & Proxmox VE a domeniilor nou create (NRD < 30 zile), reguli de inspecție antet SIP pe Asterisk PBX și automatizare transmitere notificări de takedown.',
      repoPath: 'cyber/revolut-vishing-forensics',
      githubUrl: 'https://github.com/stefanutc1/datacenter/blob/main/cyber/revolut-vishing-forensics/case_study.md',
      mitreAttack: ['T1566.002 (Link Spearphishing)', 'T1056.003 (Recoltare Credențiale Web)', 'T1539 (Furt Sesiune Web)', 'T1656 (Impersonare)']
    },
    {
      id: 'tiktok-mrr',
      caseId: 'SEC-2025-MRR-001',
      title: 'Investigație Forensică: Pâlnii Algoritmice TikTok & Scheme Recursive Master Resell Rights (MRR)',
      badge: 'Pâlnie Algoritmică & Abuz Plăți',
      classification: 'TLP:CLEAR',
      date: '14 Iunie 2025 - 18 Aprilie 2026',
      author: '@stefanutc1',
      status: 'Raportat & Documentat',
      summary: 'Analiză tehnică a pâlniilor automate de "faceless marketing" pe TikTok vizând utilizatori din România și Europa de Est. Cazul a investigat achiziția unui curs de $497 denumit "Digital Wealth Accelerator" pe stan.store. Conținutul livrat s-a dovedit a fi 100% text generat de ChatGPT cu licență MRR ce obliga victima să cloneze pâlnia și să revândă cursul altor cumpărători (schemă piramidală recursivă).',
      attackVector: 'Clipuri scurte virale pe TikTok -> Voci sintetice AI (ElevenLabs / CapCut) -> Link în Bio către stan.store / Beacons -> Plată curs $497 prin Stripe/PayPal -> Descărcare PDF sintetic + Licență MRR de revânzare forțată.',
      reverseFindings: [
        'Analiză stilometrică: similaritate de 99.4% cu prompt-uri brute GPT-3.5/GPT-4, demonstrând absența oricărei expertize proprii.',
        'Contractul MRR interzice modificarea conținutului dar impune revânzarea la preț identic ($497), încadrându-se strict în definiția FTC a schemelor piramidale.',
        'Abuzul conturilor comerciale Stripe Connect pe Stan.store pentru eludarea evaluării de risc merchant.',
        'Transmiterea de rapoarte formale de abuz către abuse@stan.store, conformitate Stripe și FTC.'
      ],
      financialFlow: 'Tranzacțiile se decontează prin Stripe Connect către contul bancar al comerciantului. Fondurile sunt retrase rapid pentru prevenirea refuzurilor de plată (chargebacks). Singura cale de amortizare a victimei este recrutarea altor cumpărători.',
      iocs: [
        { type: 'Platformă Țintă', value: 'TikTok In-App Browser & Feed' },
        { type: 'Găzduire Pagină', value: 'Subdomenii comerciale *.stan.store' },
        { type: 'Procesatori Plăți', value: 'Stripe Connect API, PayPal Checkout' },
        { type: 'Hash Probatoriu', value: '4b91f0c2a83e... (SHA-256)' }
      ],
      datacenterDefense: 'Crawler OSINT găzduit pe Proxmox pentru trasarea lanțurilor de redirectare scurtate (URL hops), scoring de reputație pe domenii și blocare DNS prin OPNsense Unbound.',
      repoPath: 'cyber/tiktok-mrr-scam-infrastructure',
      githubUrl: 'https://github.com/stefanutc1/datacenter/blob/main/cyber/tiktok-mrr-scam-infrastructure/case_study.md',
      mitreAttack: ['T1584 (Compromitere Infrastructură)', 'T1566.002 (Link Spearphishing)', 'T1598 (Phishing pentru Informații)']
    },
    {
      id: 'openid-mitm',
      caseId: 'SEC-2025-BITM-003',
      title: 'Analiză Forensică: Atac Adversary-in-the-Middle (AiTM) pe Autentificarea Steam OpenID 2.0',
      badge: 'AiTM & Deturnare Sesiune',
      classification: 'TLP:CLEAR',
      date: '22 Noiembrie 2025',
      author: '@stefanutc1',
      status: 'Finalizat & Documentat',
      summary: 'Investigația unei campanii avansate de Browser-in-the-Middle (BitM) vizând ecosistemul de esports (CS2, Dota 2). Atacatorii au utilizat un popup sintetic simulat în DOM cu bară SSL falsă pentru a intercepta autentificarea OpenID 2.0, urmată de blocarea contului prin Family View PIN și furtul schimburilor de inventar prin Web API.',
      attackVector: 'Portal de votare pentru turnee CS2 -> Clic pe "Sign in through Steam" -> Afișare fereastră BitM simulată în DOM cu adresă SSL steamcommunity.com -> Introducere credențiale și cod TOTP Steam Guard -> Releu C2 către Valve -> Blocare Family View PIN (4 cifre) -> Creare cheie Steam Web API pentru deturnare trade-uri.',
      reverseFindings: [
        'Fereastră de popup falsă randată printr-un div absolut în DOM cu bară de titlu mobilă, lacăt SSL verde și titlu identic ferestrei Valve pentru a ocoli izolarea sandbox a browserului.',
        'Fișierul JavaScript main.bundle.js interceptează formularul de login și transmite credențialele prin fetch() către /api/v2/auth/steam_callback.',
        'Releul C2 execută handshake-ul de autentificare cu Valve și extrage cookie-urile de sesiune critică steamLoginSecure și sessionid.',
        'Post-exploatare automată: botul setează instantaneu un cod PIN pe Steam Family View (blocând accesul victimei la setările de securitate) și generează o cheie Steam Web API pentru a intercepta și deturna automat schimburile de iteme.'
      ],
      financialFlow: 'Botul atacatorului anulează instantaneu ofertele legitime de schimb din inventar și generează oferte identice către un profil clonă, deturnând skin-uri și iteme de mare valoare către rețele clandestine de vânzare.',
      iocs: [
        { type: 'Callback AiTM', value: '/api/v2/auth/steam_callback' },
        { type: 'Fișier Phishing', value: 'main.bundle.js (motor BitM ofuscat)' },
        { type: 'Cookie-uri Extrase', value: 'steamLoginSecure, sessionid' },
        { type: 'Acțiune Post-Exploatare', value: 'Blocare PIN Family View + Generare Web API' }
      ],
      datacenterDefense: 'Regulă Suricata IDS pe VM 200 ce identifică șabloanele DOM specifice ferestrelor BitM simulate, monitorizare evenimente HTTP pe T-Pot și alertare Wazuh la generare neobișnuită de chei API.',
      repoPath: 'cyber/openid-mitm-phishing-forensics',
      githubUrl: 'https://github.com/stefanutc1/datacenter/blob/main/cyber/openid-mitm-phishing-forensics/case_study.md',
      mitreAttack: ['T1566.002 (Link Spearphishing)', 'T1539 (Furt Cookie Sesiune)', 'T1078 (Conturi Valide)', 'T1056.003 (Recoltare Credențiale Web)']
    }
  ];

  genHostname = 'custom-app';
  genVmid = 120;
  genRam = 512;
  isGenCopied = false;
  glossarySearch = '';

  get generatedTerraformCode(): string {
    return `module "lxc_${this.genHostname}" {
  source       = "../modules/proxmox_lxc"
  target_node  = "proxmox"
  vmid         = ${this.genVmid}
  hostname     = "${this.genHostname}"
  cores        = 2
  memory       = ${this.genRam}
  disk_size    = "8G"
  ip_address   = "192.168.1.${this.genVmid}/24"
  gateway      = "192.168.1.1"
  vlan_tag     = 20
  unprivileged = true
  tags         = ["terraform", "custom", "homelab"]
}`;
  }

  copyGen() {
    navigator.clipboard.writeText(this.generatedTerraformCode);
    this.isGenCopied = true;
    setTimeout(() => this.isGenCopied = false, 2000);
  }

  vlanMatrixEn = [
    {
      id: 'VLAN 10',
      name: 'Management & Storage Subnet',
      subnet: '192.168.1.0/24',
      gateway: '192.168.1.1',
      nodes: 'Proxmox Core (x86_64), OMV NAS, Managed Switches',
      firewallPolicy: 'Isolated from IoT & Guest subnets'
    },
    {
      id: 'VLAN 20',
      name: 'Core Microservices & Applications',
      subnet: '192.168.1.0/24',
      gateway: '192.168.1.134 (OPNsense)',
      nodes: 'NPM Ingress, Vaultwarden, Immich, Nextcloud, Home Assistant, Gitea, Ollama (CT 110)',
      firewallPolicy: 'Strict forward authentication via Authentik (CT 108)'
    },
    {
      id: 'VLAN 30',
      name: 'Cyber Security & Sandboxes (CyberLab)',
      subnet: '192.168.30.0/24',
      gateway: '192.168.1.134:8443',
      nodes: 'Wazuh XDR SIEM (1514), Suricata IDS, Atomic Red Team, CAPEv2 / Cuckoo Sandbox (Win10 + INetSim)',
      firewallPolicy: 'Promiscuous SPAN mirror port, no outbound WAN access for sandboxes'
    },
    {
      id: 'VLAN 40',
      name: 'DMZ Deception & Honeypots',
      subnet: '192.168.40.0/24',
      gateway: '192.168.1.134 (OPNsense)',
      nodes: 'T-Pot Cluster (Cowrie SSH, Dionaea, RDP honeypot, Honeytrap)',
      firewallPolicy: 'Completely isolated DMZ; automated AbuseIPDB firewall blocking'
    },
    {
      id: 'VLAN 50',
      name: 'IoT & Physical Edge Devices',
      subnet: '192.168.50.0/24',
      gateway: '192.168.1.134',
      nodes: 'ESP32 mmWave Radar, ESP32 Irrigation Relays, Zigbee Gateway',
      firewallPolicy: 'MQTT communication strictly restricted to Home Assistant (CT 106)'
    }
  ];

  vlanMatrixRo = [
    {
      id: 'VLAN 10',
      name: 'Management & Storage Subnet',
      subnet: '192.168.1.0/24',
      gateway: '192.168.1.1',
      nodes: 'Proxmox Core (x86_64), OMV NAS, Switch-uri Administrabile',
      firewallPolicy: 'Izolat strict de subrețelele IoT și Guest'
    },
    {
      id: 'VLAN 20',
      name: 'Microservicii Core & Aplicații',
      subnet: '192.168.1.0/24',
      gateway: '192.168.1.134 (OPNsense)',
      nodes: 'NPM Ingress, Vaultwarden, Immich, Nextcloud, Home Assistant, Gitea, Ollama (CT 110)',
      firewallPolicy: 'Autentificare strictă înainte de acces via Authentik (CT 108)'
    },
    {
      id: 'VLAN 30',
      name: 'Securitate Cibernetică & Sandboxes (CyberLab)',
      subnet: '192.168.30.0/24',
      gateway: '192.168.1.134:8443',
      nodes: 'Wazuh XDR SIEM (1514), Suricata IDS, Atomic Red Team, CAPEv2 / Cuckoo Sandbox (Win10 + INetSim)',
      firewallPolicy: 'Port mirror SPAN promiscuu, fără acces WAN outbound pentru sandbox-uri'
    },
    {
      id: 'VLAN 40',
      name: 'DMZ Decepție & Honeypots',
      subnet: '192.168.40.0/24',
      gateway: '192.168.1.134 (OPNsense)',
      nodes: 'Cluster T-Pot (Cowrie SSH, Dionaea, RDP honeypot, Honeytrap)',
      firewallPolicy: 'DMZ complet izolat; blocare automată a atacatorilor prin AbuseIPDB'
    },
    {
      id: 'VLAN 50',
      name: 'IoT & Dispozitive Fizice Edge',
      subnet: '192.168.50.0/24',
      gateway: '192.168.1.134',
      nodes: 'Radar mmWave ESP32, Relee Irigații ESP32, Gateway Zigbee',
      firewallPolicy: 'Comunicație MQTT restricționată strict la Home Assistant (CT 106)'
    }
  ];

  cyberPillarsEn = [
    {
      title: 'Operating Systems & Virtualization',
      badge: 'Compute & AD',
      description: 'Bare-metal virtualization and isolated testbeds hosting enterprise domain infrastructure and offensive/defensive virtual machines.',
      tools: ['Windows Server 2025 Datacenter', 'Active Directory (AD DS)', 'Group Policy (GPO)', 'Linux (Debian / Ubuntu / Alpine / Talos)', 'Virtual Machines (KVM / Proxmox / UTM)']
    },
    {
      title: 'Networking & Packet Analysis',
      badge: 'Network & DPI',
      description: 'L2/L3 segmentation, stateful traffic filtering, promiscuous port mirroring, packet inspection, and protocol analysis.',
      tools: ['Networking TCP/IP', 'Wireshark', 'tcpdump', 'VLAN 802.1Q', 'WireGuard VPN', 'OPNsense Firewall']
    },
    {
      title: 'SIEM, Deception & Honeypots',
      badge: 'SOC & Honeynet',
      description: 'Centralized security event ingestion, real-time alert correlation, compliance monitoring, and T-Pot multi-honeypot deployment.',
      tools: ['Wazuh Manager (SIEM/XDR)', 'T-Pot (Cowrie / Dionaea / RDP)', 'Splunk', 'Elastic (ELK Stack)', 'Microsoft Sentinel', 'Grafana Loki']
    },
    {
      title: 'Endpoint & Perimeter Defense',
      badge: 'EDR / IDS / IPS',
      description: 'Host-based monitoring, process creation tracking, deep packet inspection, and real-time network anomaly blocking.',
      tools: ['EDR Telemetry', 'Suricata IDS/IPS', 'Snort', 'Sysmon (Windows)', 'CrowdSec Agent', 'Auditd FIM', 'Falco / Tetragon eBPF']
    },
    {
      title: 'Vulnerability & Adversary Emulation',
      badge: 'Offensive Testing',
      description: 'Port scanning, network vulnerability identification, web application penetration testing, and automated adversary simulation.',
      tools: ['Atomic Red Team (MITRE ATT&CK)', 'Nmap', 'Nessus', 'OpenVAS', 'Burp Suite', 'BloodHound']
    },
    {
      title: 'Threat Intel & Detection Rules',
      badge: 'Detection Eng.',
      description: 'Structured threat sharing, automated indicator of compromise (IoC) extraction, and vendor-agnostic detection signatures.',
      tools: ['Sigma Rules', 'YARA Rules', 'MISP Threat Sharing', 'Snort Rulesets', 'CyberChef', 'OPNsense IoC Exporter']
    },
    {
      title: 'Digital Forensics & Malware Analysis',
      badge: 'DFIR & Reverse Eng.',
      description: 'Air-gapped triage environment for memory acquisition, disk artifact analysis, binary disassembly, and dynamic sandbox debugging.',
      tools: ['CAPEv2 / Cuckoo (Win10 + INetSim)', 'Volatility (Memory Triage)', 'Autopsy (Disk Forensics)', 'Ghidra (NSA Decompiler)', 'IDA Pro', 'x64dbg']
    },
    {
      title: 'Automation, Scripting & SCM',
      badge: 'SecOps & DevSecOps',
      description: 'Automated threat hunting agents, incident response playbooks, triage collectors, and version-controlled configuration.',
      tools: ['PowerShell Core', 'Python 3.12 (FastAPI / Scapy)', 'Git', 'Ansible Hardening Playbooks', 'Woodpecker CI', 'Shuffle / n8n SOAR']
    }
  ];

  cyberPillarsRo = [
    {
      title: 'Sisteme de Operare & Virtualizare',
      badge: 'Compute & AD',
      description: 'Virtualizare bare-metal și medii izolate de test ce găzduiesc infrastructură Active Directory și mașini virtuale ofensive/defensive.',
      tools: ['Windows Server 2025 Datacenter', 'Active Directory (AD DS)', 'Politici de Grup (GPO)', 'Linux (Debian / Ubuntu / Alpine / Talos)', 'Mașini Virtuale (KVM / Proxmox / UTM)']
    },
    {
      title: 'Rețelistică & Analiză de Pachete',
      badge: 'Rețea & DPI',
      description: 'Segmentare L2/L3, filtrare stateful de trafic, port mirroring promiscuu SPAN, inspecție de pachete și analiză de protocoale.',
      tools: ['Rețelistică TCP/IP', 'Wireshark', 'tcpdump', 'VLAN 802.1Q', 'WireGuard VPN', 'Firewall OPNsense']
    },
    {
      title: 'SIEM, Decepție & Honeypots',
      badge: 'SOC & Honeynet',
      description: 'Ingestie centralizată de evenimente de securitate, corelare alerte în timp real, monitorizare conformitate și cluster multi-honeypot T-Pot.',
      tools: ['Wazuh Manager (SIEM/XDR)', 'T-Pot (Cowrie / Dionaea / RDP)', 'Splunk', 'Elastic (ELK Stack)', 'Microsoft Sentinel', 'Grafana Loki']
    },
    {
      title: 'Securitate Endpoint & Apărare Perimetrală',
      badge: 'EDR / IDS / IPS',
      description: 'Monitorizare la nivel de gazdă, trasare creare procese, inspecție profundă de pachete (DPI) și blocare anomalii în timp real.',
      tools: ['Telemetrie EDR', 'Suricata IDS/IPS', 'Snort', 'Sysmon (Windows)', 'Agent CrowdSec', 'Auditd FIM', 'Falco / Tetragon eBPF']
    },
    {
      title: 'Vulnerabilități & Emulare Adversari',
      badge: 'Testare Ofensivă',
      description: 'Scanare de porturi, identificare vulnerabilități în rețea, teste de penetrare pentru aplicații web și simulare automată de atacuri.',
      tools: ['Atomic Red Team (MITRE ATT&CK)', 'Nmap', 'Nessus', 'OpenVAS', 'Burp Suite', 'BloodHound']
    },
    {
      title: 'Threat Intel & Reguli de Detecție',
      badge: 'Inginerie Detecție',
      description: 'Schimb structurat de informații despre amenințări, extragere automată a indicatorilor de compromitere (IoC) și semnături agnostice de detecție.',
      tools: ['Reguli Sigma', 'Reguli YARA', 'Partajare MISP', 'Seturi de Reguli Snort', 'CyberChef', 'Exportator IoC OPNsense']
    },
    {
      title: 'Digital Forensics & Analiză Malware',
      badge: 'DFIR & Reverse Eng.',
      description: 'Mediu izolat de triaj pentru achiziție memorie RAM, analiză artefacte disc, dezasamblare binare și depanare dinamică în sandbox.',
      tools: ['CAPEv2 / Cuckoo (Win10 + INetSim)', 'Volatility (Triaj Memorie)', 'Autopsy (Criminalistică Disc)', 'Ghidra (Decompilator NSA)', 'IDA Pro', 'x64dbg']
    },
    {
      title: 'Automatizare, Scripting & SCM',
      badge: 'SecOps & DevSecOps',
      description: 'Agenți automați de threat hunting, playbook-uri de răspuns la incidente, colectoare de triaj și configurație versionată prin Git.',
      tools: ['PowerShell Core', 'Python 3.12 (FastAPI / Scapy)', 'Git', 'Playbook-uri Ansible Hardening', 'Woodpecker CI', 'Shuffle / n8n SOAR']
    }
  ];

  glossaryEn = [
    { term: 'ZFS', def: 'Advanced 128-bit file system and logical volume manager with native checksums, copy-on-write, and ZSTD compression.' },
    { term: 'eBPF', def: 'Extended Berkeley Packet Filter allowing safe kernel-level observability (Tetragon & Falco) without modifying kernel source.' },
    { term: 'Passkeys', def: 'FIDO2 / WebAuthn cryptographic credentials providing passwordless and phishing-resistant zero-trust authentication.' },
    { term: 'NUT', def: 'Network UPS Tools providing continuous monitoring and graceful sequential shutdown for Coldex UPS batteries.' },
    { term: 'Ollama', def: 'Lightweight GPU LLM execution engine serving models like Qwen2.5-Coder and Llama-3.2 locally on GTX 1050 Ti.' },
    { term: 'Talos Linux', def: 'Immutable, zero-SSH, API-managed minimal Linux operating system designed strictly for running Kubernetes.' },
    { term: 'T-Pot', def: 'Multi-honeypot platform deploying honeypots (Cowrie, Dionaea, RDP) in an isolated DMZ with automated threat feeds.' },
    { term: 'CrowdSec', def: 'Collaborative open-source security engine analyzing logs to automatically ban malicious IPs across all ingress routes.' }
  ];

  glossaryRo = [
    { term: 'ZFS', def: 'Sistem de fișiere avansat pe 128 de biți și manager de volume logice cu sume de control native, copy-on-write și compresie ZSTD.' },
    { term: 'eBPF', def: 'Extended Berkeley Packet Filter ce permite observabilitate sigură la nivel de kernel (Tetragon & Falco) fără modificarea nucleului Linux.' },
    { term: 'Passkeys', def: 'Credențiale criptografice FIDO2 / WebAuthn ce oferă autentificare fără parolă, rezistentă la phishing și zero-trust.' },
    { term: 'NUT', def: 'Network UPS Tools ce oferă monitorizare continuă și oprire secvențială controlată a alimentării pentru UPS-ul Coldex.' },
    { term: 'Ollama', def: 'Motor compact de execuție LLM pe GPU ce rulează modele precum Qwen2.5-Coder și Llama-3.2 local pe placa video GTX 1050 Ti.' },
    { term: 'Talos Linux', def: 'Sistem de operare Linux minimal, imutabil, fără acces SSH, gestionat exclusiv prin API, proiectat dedicat pentru Kubernetes.' },
    { term: 'T-Pot', def: 'Platformă modulară de decepție ce rulează honeypot-uri (Cowrie, Dionaea, RDP) într-un DMZ complet izolat cu fluxuri automate de threat intel.' },
    { term: 'CrowdSec', def: 'Motor colaborativ open-source de securitate ce analizează logurile pentru blocarea automată a IP-urilor malițioase pe toate rutele de ingress.' }
  ];

  get filteredGlossaryEn() {
    const q = this.glossarySearch.toLowerCase().trim();
    if (!q) return this.glossaryEn;
    return this.glossaryEn.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q));
  }

  get filteredGlossaryRo() {
    const q = this.glossarySearch.toLowerCase().trim();
    if (!q) return this.glossaryRo;
    return this.glossaryRo.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q));
  }
}
