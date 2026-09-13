export interface CveAssessment {
  id: string;
  cveId: string;
  title: string;
  component: string;
  cvssScore: string;
  cvssSeverity: 'CRITICAL' | 'HIGH';
  cvssVector: string;
  classification: string;
  date: string;
  status: string;
  summary: string;
  rootCause: string;
  homelabImpact: string;
  affectedNodes: string[];
  attackChain: string[];
  remediationSteps: string[];
  mitreAttack: string[];
  repoPath: string;
  githubUrl: string;
  sigmaRule?: string;
  powershellAudit?: string;
}

export const CVE_ASSESSMENTS_RO: CveAssessment[] = [
  {
    id: 'hyperv-escape',
    cveId: 'CVE-2026-69603 & CVE-2026-80083',
    title: 'Windows Hyper-V: Evadare din Mașina Virtuală în Host (Guest-to-Host Escape)',
    component: 'Hyper-V VMBus / SCSI & Net Synthetic Drivers (vmwp.exe, storvsp.sys, vmswitch.sys)',
    cvssScore: '8.8',
    cvssSeverity: 'HIGH',
    cvssVector: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: '13 Septembrie 2026',
    status: 'Evaluat & Documentat',
    summary: 'Vulnerabilități critice în stiva de virtualizare Microsoft Hyper-V ce permit unui atacator autentificat într-o mașină virtuală guest să spargă complet izolarea hypervisorului (Ring -1 / Ring 0) și să execute cod arbitrar ca NT AUTHORITY\\SYSTEM pe mașina fizică gazdă.',
    rootCause: 'Out-of-Bounds Write în emulatorul SCSI storvsp.sys prin liste de dispersie/colectare (SGL) malformate trimise prin VMBus (CVE-2026-69603) și Use-After-Free în vmswitch.sys la renegocierea concurentă a MTU și eliberarea cozilor de pachete (CVE-2026-80083).',
    homelabImpact: 'Direct și sever pe mașina gazdă fizică Hyper-V configurată în hypervisors/hyperv/main.tf (hlextswitch). Dacă un atacator compromite o mașină de test sau honeypot (metasploitable_vm VMID 202, metasploitable_licenta_vm VMID 301, tpot_vm VMID 203), poate evada pe host-ul Windows fizic. Odată pe host, obține acces la toate discurile VHDX și poate extrage memoria RAM a Domain Controller-ului (ad2025_vm) și a firewall-ului OPNsense.',
    affectedNodes: [
      'Physical Hyper-V Host (hypervisors/hyperv/main.tf)',
      'metasploitable_vm (192.168.1.202 - VMID 202)',
      'metasploitable_licenta_vm (192.168.1.211 - VMID 301)',
      'tpot_vm (192.168.1.203 - VMID 203)',
      'ad2025_vm & ad2022_vm (Co-located VM exposure)'
    ],
    attackChain: [
      'Atacatorul obține privilegii locale în mașina virtuală guest (ex: prin metasploitable sau exploit web).',
      'Guest-ul alocă o pagină de memorie fizică (GPA) și construiește un descriptor VMBus de tip VMBUS_CHANNEL_PACKET_MULIT_PAGE_BUFFER.',
      'Sunt trimise dimensiuni corupte (ByteCount = 0xFFFF) apelând hypercall-ul HvSignalEvent.',
      'Procesul vmwp.exe de pe host alocă un buffer insuficient și efectuează un memcpy fără validare de limită.',
      'Pointerii vtable sunt suprascriși, redirecționând fluxul de execuție către shellcode sub NT AUTHORITY\\SYSTEM pe host.'
    ],
    remediationSteps: [
      'Instalarea imediată a actualizărilor cumulative Microsoft septembrie 2026 (KB5058825 / KB5058822).',
      'Dezactivarea serviciilor de integrare neesențiale pe VM-urile de test: Disable-VMIntegrationService -VMName "metasploitable" -Name "Guest Service Interface".',
      'Activarea securității bazate pe virtualizare (VBS) și a integrității codului (HVCI) pe host.',
      'Dezactivarea extensiilor de virtualizare imbricată (nested virtualization) pentru nodurile nesigure.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1068 - Exploitation for Privilege Escalation', 'T1211 - Exploitation for Defense Evasion'],
    repoPath: 'cyber/cve/CVE-2026-69603-CVE-2026-80083',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69603-CVE-2026-80083/report.md',
    sigmaRule: `title: Hyper-V Worker Process Abnormal Crash or Child Process Spawn
id: cve-2026-69603-hyperv-escape
logsource:
  category: process_creation
  product: windows
detection:
  selection_parent:
    ParentImage|endswith: '\\vmwp.exe'
  selection_suspicious_children:
    Image|endswith:
      - '\\cmd.exe'
      - '\\powershell.exe'
      - '\\rundll32.exe'
  condition: selection_parent and selection_suspicious_children
level: critical`,
    powershellAudit: `Get-VM | Get-VMIntegrationService | Where-Object { $_.Name -eq "Guest Service Interface" -and $_.Enabled -eq $true }`
  },
  {
    id: 'dns-rce',
    cveId: 'CVE-2026-69730',
    title: 'Windows DNS Server: Execuție de Cod Arbitrar la Distanță (Wormable RCE)',
    component: 'Windows DNS Server Service (dns.exe : Port 53 UDP/TCP)',
    cvssScore: '9.8',
    cvssSeverity: 'CRITICAL',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: '13 Septembrie 2026',
    status: 'Evaluat & Documentat',
    summary: 'Vulnerabilitate critică de tip Remote Code Execution (RCE) exploatabilă fără autentificare și fără interacțiunea utilizatorului prin transmiterea de pachete DNS malițioase către portul 53. Permite preluarea completă a Domain Controller-ului cu drepturi SYSTEM și compromiterea instantă a pădurii Active Directory.',
    rootCause: 'Eroare de tip Buffer Overflow / Integer Underflow în dns.exe la parsarea pointerilor de compresie din interogările DNS, pachetele de actualizare dinamică și semnăturile DNSSEC. Copierea memoriei în heap fără validarea limitei superioare duce la executarea shellcode-ului injectat.',
    homelabImpact: 'Risc critic pe toate Domain Controllerele noastre din inventory/hosts.yml: ad2025_vm (192.168.1.225), ad2022_vm (192.168.1.222) și ad2019_vm (192.168.1.219). Orice dispozitiv din rețea (sau un container/LXC compromis) poate trimite un pachet UDP/TCP 53 pentru a obține shell ca SYSTEM pe Domain Controller, a descărca ntds.dit și a forja Kerberos Golden Tickets.',
    affectedNodes: [
      'ad2025_vm (192.168.1.225 - Windows Server 2025 DC)',
      'ad2022_vm (192.168.1.222 - Windows Server 2022 DC)',
      'ad2019_vm (192.168.1.219 - Windows Server 2019 DC)',
      'adwin11_vm & adwin10_vm (Toate stațiile dependente de DNS-ul intern)',
      'Toate serviciile ce rezolvă prin ad2025.lan'
    ],
    attackChain: [
      'Atacatorul din rețea trimite un pachet DNS de mari dimensiuni către 192.168.1.225:53.',
      'Serviciul dns.exe primește pachetul și apelează rutina de decodare a înregistrărilor de resurse.',
      'Calculul lungimii suferă un integer underflow ce alocă un buffer prea mic în Process Heap.',
      'Payload-ul suprascrie adresa de retur și lansează un lanț ROP urmat de shellcode.',
      'Shellcode-ul rulează ca NT AUTHORITY\\SYSTEM, deschide un reverse shell și exportă baza ntds.dit.'
    ],
    remediationSteps: [
      'Aplicarea actualizării KB5058825 pe ad2025_vm și KB5058822 pe ad2022_vm.',
      'Workaround temporar prin registry dacă reboot-ul nu este imediat: reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\DNS\\Parameters" /v "TcpReceivePacketSize" /t REG_DWORD /d 0xFF00 /f urmat de Restart-Service DNS.',
      'Izolarea portului 53 în firewall-ul OPNsense (192.168.1.134) – blocarea interogărilor directe din VLAN-urile de oaspeți/test.',
      'Forțarea setării Secure-Only Dynamic Updates pe toate zonele DNS integrate în Active Directory.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1059 - Command and Scripting Interpreter', 'T1003.003 - OS Credential Dumping: NTDS'],
    repoPath: 'cyber/cve/CVE-2026-69730',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69730/report.md',
    sigmaRule: `title: Suspicious Child Process Spawned by Windows DNS Server (CVE-2026-69730)
id: cve-2026-69730-dns-rce
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith: '\\dns.exe'
    Image|endswith:
      - '\\cmd.exe'
      - '\\powershell.exe'
      - '\\certutil.exe'
      - '\\vssadmin.exe'
  condition: selection
level: critical`,
    powershellAudit: `Get-Service -Name DNS; (Get-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\DNS\\Parameters" -ErrorAction SilentlyContinue).TcpReceivePacketSize`
  },
  {
    id: 'dhcp-rce',
    cveId: 'CVE-2026-69845 & CVE-2026-72979',
    title: 'Windows DHCP Server: Execuție de Cod Arbitrar prin Buffer Overflow & UAF',
    component: 'Windows DHCP Server Service (dhcpssvc.dll : Port 67 UDP)',
    cvssScore: '9.8',
    cvssSeverity: 'CRITICAL',
    cvssVector: 'CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: '13 Septembrie 2026',
    status: 'Evaluat & Documentat',
    summary: 'Vulnerabilități critice în serviciul DHCP Server de pe Windows Server generate de un Heap Buffer Overflow la procesarea opțiunilor imbricate (Option 43/82) și un Use-After-Free la concurența pachetelor DHCPDECLINE/DHCPREQUEST, permițând RCE neautentificat pe LAN.',
    rootCause: 'În CVE-2026-69845, DhcpExtractSubOptions() adună lungimile opțiunilor fără verificare de overflow pe 16 biți, provocând alocare trunchiată și depășire de heap. În CVE-2026-72979, eliberarea prematură a contextului DHCP_CLIENT_RECORD lasă un pointer dangling accesat de un thread paralel.',
    homelabImpact: 'Afectează serverele de domeniu Windows pe care este activ rolul DHCP (ad2025_vm, ad2022_vm). Orice echipament conectat pe subnetul 192.168.1.0/24 poate transmite un broadcast malițios pe UDP 67 și prelua controlul serverului ca SYSTEM. De asemenea, atacatorul poate otrăvi lease-urile DHCP (Option 3 Gateway, Option 6 DNS), realizând Man-in-the-Middle transparent pentru tot traficul local.',
    affectedNodes: [
      'ad2025_vm (192.168.1.225 - Windows Server 2025)',
      'ad2022_vm (192.168.1.222 - Windows Server 2022)',
      'adwin11_vm & adwin10_vm (Clienți DHCP)',
      'k8s_node_04 (192.168.1.18 - IP dinamic)',
      'opnsense_vm (192.168.1.134 - Gateway alternativ recomandat)'
    ],
    attackChain: [
      'Atacatorul de pe LAN emite un broadcast DHCPREQUEST special formatat către 255.255.255.255:67.',
      'Pachetul conține opțiunea 43 (Vendor-Specific) supradimensionată cu sub-opțiuni duplicate.',
      'Serviciul dhcpssvc.dll calculează greșit lungimea și alocă un chunk de heap insuficient.',
      'Copierea în memorie suprascrie metadatele de heap și pointerii de apel asincron.',
      'Controlul este preluat sub contul NT AUTHORITY\\SYSTEM, permițând poisoning de rețea sau shell la distanță.'
    ],
    remediationSteps: [
      'Arhitectură Recomandată (Best Practice): Decomisionarea DHCP de pe Domain Controllere și migrarea exclusivă pe OPNsense (192.168.1.134 - Kea DHCP / Dnsmasq).',
      'Dezactivarea serviciului Windows DHCP: Stop-Service DHCPServer -Force; Set-Service DHCPServer -StartupType Disabled.',
      'Aplicarea actualizărilor de securitate Microsoft (KB5058825 / KB5058822).',
      'Activarea DHCP Snooping pe switch-urile fizice și virtuale pentru filtrarea pachetelor de răspuns neautorizate.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1557.001 - Adversary-in-the-Middle: LLMNR/NBT-NS Poisoning and Relay', 'T1068 - Exploitation for Privilege Escalation'],
    repoPath: 'cyber/cve/CVE-2026-69845-CVE-2026-72979',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69845-CVE-2026-72979/report.md',
    sigmaRule: `title: Suspicious Process Spawned by Windows DHCP Server (CVE-2026-69845)
id: cve-2026-69845-dhcp-rce
logsource:
  category: process_creation
  product: windows
detection:
  selection_parent:
    ParentCommandLine|contains: 'Dhcpsvc'
  selection_children:
    Image|endswith:
      - '\\cmd.exe'
      - '\\powershell.exe'
      - '\\whoami.exe'
  condition: selection_parent and selection_children
level: critical`,
    powershellAudit: `Get-Service -Name DHCPServer -ErrorAction SilentlyContinue | Select-Object Name, Status, StartType`
  }
];

export const CVE_ASSESSMENTS_EN: CveAssessment[] = [
  {
    id: 'hyperv-escape',
    cveId: 'CVE-2026-69603 & CVE-2026-80083',
    title: 'Windows Hyper-V: Virtual Machine Guest-to-Host Sandbox Escape',
    component: 'Hyper-V VMBus / SCSI & Net Synthetic Drivers (vmwp.exe, storvsp.sys, vmswitch.sys)',
    cvssScore: '8.8',
    cvssSeverity: 'HIGH',
    cvssVector: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: '13 September 2026',
    status: 'Assessed & Documented',
    summary: 'Critical security flaws within the Microsoft Windows Hyper-V virtualization stack allowing an authenticated adversary inside a guest virtual machine to break hypervisor isolation (Ring -1 / Ring 0) and execute arbitrary code as NT AUTHORITY\\SYSTEM on the physical host hypervisor.',
    rootCause: 'Out-of-Bounds Write in storvsp.sys via malformed scatter/gather list (SGL) descriptors sent over VMBus (CVE-2026-69603) and Use-After-Free in vmswitch.sys during concurrent MTU renegotiation and packet queue deallocation (CVE-2026-80083).',
    homelabImpact: 'Severe direct impact on our physical Hyper-V host defined in hypervisors/hyperv/main.tf (hlextswitch). An adversary compromising any lab or honeypot VM (metasploitable_vm VMID 202, metasploitable_licenta_vm VMID 301, tpot_vm VMID 203) can escape the sandbox into the physical Windows host, acquiring direct read/write access to all VHDX disks and memory of co-located Domain Controllers (ad2025_vm) and OPNsense firewall.',
    affectedNodes: [
      'Physical Hyper-V Host (hypervisors/hyperv/main.tf)',
      'metasploitable_vm (192.168.1.202 - VMID 202)',
      'metasploitable_licenta_vm (192.168.1.211 - VMID 301)',
      'tpot_vm (192.168.1.203 - VMID 203)',
      'ad2025_vm & ad2022_vm (Co-located VM exposure)'
    ],
    attackChain: [
      'Attacker obtains low-privileged or root shell inside guest VM.',
      'Guest allocates contiguous physical memory page (GPA) and crafts synthetic SCSI VMBUS_CHANNEL_PACKET_MULIT_PAGE_BUFFER descriptor.',
      'Malformed ByteCount (0xFFFF) is dispatched via HvSignalEvent hypercall.',
      'Host worker process vmwp.exe ingests payload into undersized heap buffer without bounds enforcement.',
      'Host heap corruption hijacks execution control flow, executing payload as SYSTEM on physical host.'
    ],
    remediationSteps: [
      'Deploy September 2026 Cumulative Updates on physical Hyper-V hosts (KB5058825 / KB5058822).',
      'Disable unnecessary integration services on untrusted VMs: Disable-VMIntegrationService -VMName "metasploitable" -Name "Guest Service Interface".',
      'Enable Virtualization-Based Security (VBS) and Hypervisor-Protected Code Integrity (HVCI) on host.',
      'Disable nested virtualization extensions on non-essential guest workloads.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1068 - Exploitation for Privilege Escalation', 'T1211 - Exploitation for Defense Evasion'],
    repoPath: 'cyber/cve/CVE-2026-69603-CVE-2026-80083',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69603-CVE-2026-80083/report.md',
    sigmaRule: `title: Hyper-V Worker Process Abnormal Crash or Child Process Spawn
id: cve-2026-69603-hyperv-escape
logsource:
  category: process_creation
  product: windows
detection:
  selection_parent:
    ParentImage|endswith: '\\vmwp.exe'
  selection_suspicious_children:
    Image|endswith:
      - '\\cmd.exe'
      - '\\powershell.exe'
      - '\\rundll32.exe'
  condition: selection_parent and selection_suspicious_children
level: critical`,
    powershellAudit: `Get-VM | Get-VMIntegrationService | Where-Object { $_.Name -eq "Guest Service Interface" -and $_.Enabled -eq $true }`
  },
  {
    id: 'dns-rce',
    cveId: 'CVE-2026-69730',
    title: 'Windows DNS Server: Critical Remote Code Execution (Wormable)',
    component: 'Windows DNS Server Service (dns.exe : Port 53 UDP/TCP)',
    cvssScore: '9.8',
    cvssSeverity: 'CRITICAL',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: '13 September 2026',
    status: 'Assessed & Documented',
    summary: 'Unauthenticated, zero-click Remote Code Execution vulnerability in Windows DNS Server triggered by crafted network packets to port 53. Grants instant NT AUTHORITY\\SYSTEM code execution on Active Directory Domain Controllers, facilitating forest-wide takeover and automated worm propagation.',
    rootCause: 'Heap Buffer Overflow / Integer Underflow in dns.exe during decompression pointer and dynamic update / DNSSEC signature record ingestion. Memory copy exceeds allocated buffer bounds, overwriting return addresses with shellcode.',
    homelabImpact: 'Critical risk for all Domain Controllers in inventory/hosts.yml: ad2025_vm (192.168.1.225), ad2022_vm (192.168.1.222), and ad2019_vm (192.168.1.219). Any compromised device on the subnet can fire a single UDP/TCP packet to port 53, seize the Domain Controller, dump ntds.dit, and mint Kerberos Golden Tickets.',
    affectedNodes: [
      'ad2025_vm (192.168.1.225 - Windows Server 2025 DC)',
      'ad2022_vm (192.168.1.222 - Windows Server 2022 DC)',
      'ad2019_vm (192.168.1.219 - Windows Server 2019 DC)',
      'adwin11_vm & adwin10_vm (Member Workstations)',
      'All services resolving via ad2025.lan'
    ],
    attackChain: [
      'Attacker dispatches crafted DNS packet to 192.168.1.225:53.',
      'dns.exe receives packet and invokes resource record decoding routines.',
      'Integer underflow in length calculation allocates truncated memory buffer on heap.',
      'Unchecked copy operation corrupts heap structures and injects ROP chain.',
      'Shellcode executes under NT AUTHORITY\\SYSTEM, dumping NTDS credentials.'
    ],
    remediationSteps: [
      'Apply security update KB5058825 (Server 2025) or KB5058822 (Server 2022).',
      'Emergency registry workaround: reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\DNS\\Parameters" /v "TcpReceivePacketSize" /t REG_DWORD /d 0xFF00 /f and restart DNS service.',
      'Enforce port 53 isolation on OPNsense firewall (192.168.1.134), blocking direct DNS access from untrusted VLANs.',
      'Require Secure-Only dynamic DNS updates on all Active Directory integrated zones.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1059 - Command and Scripting Interpreter', 'T1003.003 - OS Credential Dumping: NTDS'],
    repoPath: 'cyber/cve/CVE-2026-69730',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69730/report.md',
    sigmaRule: `title: Suspicious Child Process Spawned by Windows DNS Server (CVE-2026-69730)
id: cve-2026-69730-dns-rce
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith: '\\dns.exe'
    Image|endswith:
      - '\\cmd.exe'
      - '\\powershell.exe'
      - '\\certutil.exe'
      - '\\vssadmin.exe'
  condition: selection
level: critical`,
    powershellAudit: `Get-Service -Name DNS; (Get-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\DNS\\Parameters" -ErrorAction SilentlyContinue).TcpReceivePacketSize`
  },
  {
    id: 'dhcp-rce',
    cveId: 'CVE-2026-69845 & CVE-2026-72979',
    title: 'Windows DHCP Server: Critical Remote Code Execution via Buffer Overflow & UAF',
    component: 'Windows DHCP Server Service (dhcpssvc.dll : Port 67 UDP)',
    cvssScore: '9.8',
    cvssSeverity: 'CRITICAL',
    cvssVector: 'CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: '13 September 2026',
    status: 'Assessed & Documented',
    summary: 'Critical unauthenticated RCE vulnerabilities in Windows DHCP Server service caused by heap overflow in Option 43/82 decoding (CVE-2026-69845) and a Use-After-Free race condition during lease deallocation (CVE-2026-72979).',
    rootCause: 'DhcpExtractSubOptions() computes option block size without 16-bit integer overflow checks, causing truncated heap allocation and memory overwrite. DhcpProcessDecline() frees lease client structures prematurely while parallel threads hold active references.',
    homelabImpact: 'Threatens Domain Controllers running the Windows DHCP Server role (ad2025_vm, ad2022_vm). Rogue devices on the 192.168.1.0/24 subnet can send broadcast UDP 67 packets to seize the server as SYSTEM or poison client leases (Gateway, DNS, WPAD) for transparent Man-in-the-Middle.',
    affectedNodes: [
      'ad2025_vm (192.168.1.225 - Windows Server 2025)',
      'ad2022_vm (192.168.1.222 - Windows Server 2022)',
      'adwin11_vm & adwin10_vm (DHCP Clients)',
      'k8s_node_04 (192.168.1.18 - Dynamic IP node)',
      'opnsense_vm (192.168.1.134 - Recommended authoritative DHCP gateway)'
    ],
    attackChain: [
      'Attacker transmits broadcast DHCPREQUEST to 255.255.255.255:67.',
      'Packet contains oversized Option 43 with concatenated sub-options exceeding 65KB.',
      'dhcpssvc.dll integer wrap allocates undersized heap memory chunk.',
      'Subsequent memcpy overwrites adjacent memory structures and vtable pointers.',
      'Execution control is redirected to shellcode executing as NT AUTHORITY\\SYSTEM.'
    ],
    remediationSteps: [
      'Architectural Best Practice: Migrate DHCP service entirely to OPNsense (192.168.1.134 - Kea DHCP) and disable Windows DHCP Server role.',
      'Disable Windows DHCP Server: Stop-Service DHCPServer -Force; Set-Service DHCPServer -StartupType Disabled.',
      'Apply Microsoft Cumulative Updates (KB5058825 / KB5058822).',
      'Enable DHCP Snooping on physical and virtual switches to drop unauthorized DHCP responses.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1557.001 - Adversary-in-the-Middle: LLMNR/NBT-NS Poisoning and Relay', 'T1068 - Exploitation for Privilege Escalation'],
    repoPath: 'cyber/cve/CVE-2026-69845-CVE-2026-72979',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69845-CVE-2026-72979/report.md',
    sigmaRule: `title: Suspicious Process Spawned by Windows DHCP Server (CVE-2026-69845)
id: cve-2026-69845-dhcp-rce
logsource:
  category: process_creation
  product: windows
detection:
  selection_parent:
    ParentCommandLine|contains: 'Dhcpsvc'
  selection_children:
    Image|endswith:
      - '\\cmd.exe'
      - '\\powershell.exe'
      - '\\whoami.exe'
  condition: selection_parent and selection_children
level: critical`,
    powershellAudit: `Get-Service -Name DHCPServer -ErrorAction SilentlyContinue | Select-Object Name, Status, StartType`
  }
];
