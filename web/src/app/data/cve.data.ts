export interface CveAssessment {
  id: string;
  cveId: string;
  title: string;
  component: string;
  cvssScore: string;
  cvssSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
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
  fixGithubUrl: string;
  sigmaRule?: string;
  powershellAudit?: string;
}

export const CVE_ASSESSMENTS_RO: CveAssessment[] = [
  {
    id: 'pve-auth-bypass',
    cveId: 'CVE-2023-54391',
    title: 'Proxmox VE: Ocolire Critică a Autentificării prin Parametrul tfa-challenge (Root Takeover)',
    component: 'Proxmox VE libpve-access-control (< 8.0.4) / PVE::AccessControl',
    cvssScore: '9.8',
    cvssSeverity: 'CRITICAL',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / HYPERVISOR-EXPLOIT',
    date: '13 Septembrie 2026',
    status: 'Remediat & Documentat',
    summary: 'Vulnerabilitate critică de ocolire a autentificării în Proxmox VE ce permite oricărui atacator din rețea să obțină un tichet complet de sesiune root@pam fără a introduce vreo parolă, prin simpla trimitere a parametrului tfa-challenge în cererea POST către /api2/json/access/ticket.',
    rootCause: 'Eroare gravă de logică în subrutina verify_user_auth din modulul Perl libpve-access-control: prezența parametrului tfa-challenge determină sistemul să presupună eronat că verificarea primară a parolei a avut deja loc. Dacă utilizatorul vizat nu are configurat TFA (starea implicită a root@pam), serverul emite tichetul de sesiune PVEAuthCookie fără nicio verificare de credențiale.',
    homelabImpact: 'Direct și devastator pe hypervisorul bare-metal pve_primary_x64 (192.168.1.132). Un atacator din rețea preia controlul absolut al nodului fizic Intel Core i3-10100F, are acces la consolele tuturor VM-urilor (ad2025_vm, opnsense_vm, tpot_vm), poate opri firewall-ul și poate monta discurile ZFS (rpool și datapool) pentru a extrage fișierele ntds.dit din Active Directory.',
    affectedNodes: [
      'pve_primary_x64 (192.168.1.132 - Proxmox Hypervisor)',
      'ad2025_vm (VMID 400 - Active Directory DC 2025)',
      'ad2022_vm (VMID 401 - Active Directory DC 2022)',
      'opnsense_vm (VMID 200 - Core Firewall & Ingress)',
      'ZFS Pools: rpool (NVMe) & datapool (Mirror OMV)'
    ],
    attackChain: [
      'Scanare de rețea pe portul 8006/TCP și identificarea instanței Proxmox VE vulnerabile (versiuni < 8.0.4).',
      'Construirea unei cereri HTTP POST către /api2/json/access/ticket specificând username=root@pam și tfa-challenge=bypass cu parola vidă.',
      'Modulul Perl sare peste validarea PAM și constată lipsa configurației TFA pentru utilizator.',
      'Serverul răspunde cu 200 OK, emițând un cookie PVEAuthCookie valid și un token CSRF.',
      'Atacatorul preia controlul complet al hypervisorului, al mașinilor virtuale și al pool-urilor ZFS.'
    ],
    remediationSteps: [
      'Actualizarea imediată a pachetului: apt update && apt install --only-upgrade libpve-access-control pve-manager.',
      'Repornirea daemonilor API: systemctl restart pvedaemon.service pveproxy.service.',
      'Mitigare fără downtime: Activarea obligatorie a 2FA (TOTP/WebAuthn) pe root@pam via pveum user tfa add root@pam totp.',
      'Izolare rețea: Restricționarea portului 8006 doar pentru adresa IP de management autorizată via pve-firewall.'
    ],
    mitreAttack: ['T1078.001 - Default Accounts', 'T1190 - Exploit Public-Facing Application', 'T1556 - Modify Authentication Process'],
    repoPath: 'cyber/cve/CVE-2023-54391',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2023-54391/report.md',
    fixGithubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2023-54391/fix.md',
    sigmaRule: `title: Proxmox VE Authentication Bypass Attempt (CVE-2023-54391)
status: critical
logsource:
  category: webserver
  product: proxmox
detection:
  selection:
    c-method: 'POST'
    cs-uri-stem: '/api2/json/access/ticket'
    cs-uri-query|contains: 'tfa-challenge'
  condition: selection`
  },
  {
    id: 'pve-stored-xss',
    cveId: 'CVE-2025-57539',
    title: 'Proxmox VE: Stored XSS în Câmpul U2F Origin din Configurația Datacenter',
    component: 'Proxmox VE 8.4 (pve-manager / Interfața Web ExtJS · PVE.dc.OptionView)',
    cvssScore: '5.4',
    cvssSeverity: 'MEDIUM',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N',
    classification: 'TLP:CLEAR / WEB-EXPLOIT',
    date: '13 Septembrie 2026',
    status: 'Remediat & Documentat',
    summary: 'Vulnerabilitate de tip Stored Cross-Site Scripting (XSS) în interfața web Proxmox VE 8.4. Permite unui utilizator cu privilegii de configurare a clusterului (sau prin token API delegat) să injecteze scripturi JavaScript malițioase în câmpul U2F Origin din /etc/pve/datacenter.cfg, executate ulterior în contextul browserului administratorului root@pam.',
    rootCause: 'Lipsa funcției de filtrare și codare HTML (Ext.String.htmlEncode) la randarea valorilor opțiunii U2F Origin în componenta ExtJS PVE.dc.OptionView. Parametrii stocați sunt inserați direct în DOM ca elemente HTML active.',
    homelabImpact: 'Escaladare silențioasă de privilegii la root@pam. Dacă un cont delegat sau un token REST este compromis, atacatorul injectează un payload XSS. Când administratorul legitim vizitează secțiunea Datacenter -> Options din GUI, payload-ul rulează silențios apeluri REST API pentru a adăuga o cheie SSH a atacatorului în /root/.ssh/authorized_keys sau pentru a emite un token de root permanent.',
    affectedNodes: [
      'pve_primary_x64 (192.168.1.132 - Consola Web PVE)',
      'Browser Administrator Superuser (Sesiunea activă root@pam)',
      'Fișierul sincronizat de cluster /etc/pve/datacenter.cfg'
    ],
    attackChain: [
      'Operatorul cu rol delegat trimite o cerere PUT către /api2/json/cluster/options inserând payload-ul XSS în câmpul u2f: origin.',
      'Proxmox salvează șirul nesanitizat în fișierul /etc/pve/datacenter.cfg.',
      'Administratorul root@pam deschide opțiunile datacenter-ului în interfața web.',
      'Browserul administratorului execută scriptul JavaScript în contextul sesiunii root active.',
      'Scriptul apelează API-ul Proxmox pentru a genera un token API secret și a-l exfiltra către atacator.'
    ],
    remediationSteps: [
      'Audit și curățare manuală imediată a fișierului /etc/pve/datacenter.cfg: eliminare directive u2f malițioase.',
      'Actualizare la versiunea remediată: apt update && apt install --only-upgrade pve-manager.',
      'Implementare Content Security Policy (CSP) prin reverse proxy (OPNsense / Caddy) pentru a interzice scripturile inline.',
      'Audit post-incident al token-urilor API: pveum user token list root@pam și al fișierului /root/.ssh/authorized_keys.'
    ],
    mitreAttack: ['T1059.007 - JavaScript', 'T1189 - Drive-by Compromise', 'T1098.004 - SSH Authorized Keys'],
    repoPath: 'cyber/cve/CVE-2025-57539',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2025-57539/report.md',
    fixGithubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2025-57539/fix.md',
    sigmaRule: `title: Proxmox VE Stored XSS Attempt in Datacenter Options (CVE-2025-57539)
status: high
logsource:
  category: webserver
  product: proxmox
detection:
  selection:
    c-method: ['PUT', 'POST']
    cs-uri-stem|contains: '/api2/json/cluster/options'
    cs-uri-query|contains: ['<script', 'onerror=', 'onload=', '<svg', '<img']
  condition: selection`
  },
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
    fixGithubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69603-CVE-2026-80083/fix.md',
    sigmaRule: `title: Suspicious Hyper-V Child Process Spawned by vmwp.exe
status: critical
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith: '\\vmwp.exe'
    Image|endswith:
      - '\\cmd.exe'
      - '\\powershell.exe'
      - '\\pwsh.exe'
  condition: selection`
  },
  {
    id: 'dns-rce',
    cveId: 'CVE-2026-69730',
    title: 'Windows DNS Server: Execuție de Cod de la Distanță (RCE Wormable)',
    component: 'Windows DNS Server Service (dns.exe / Răspunsuri DNS & EDNS0 Parsing)',
    cvssScore: '9.8',
    cvssSeverity: 'CRITICAL',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: '13 Septembrie 2026',
    status: 'Evaluat & Documentat',
    summary: 'Vulnerabilitate critică RCE (Wormable) în serviciul Windows DNS Server, exploatabilă de la distanță fără autentificare. Permite unui atacator să trimită cereri sau răspunsuri DNS malformate pe portul 53 (UDP/TCP) care declanșează execuția de cod cu drepturi depline NT AUTHORITY\\SYSTEM.',
    rootCause: 'Trunchiere de întreg (Integer Truncation) și alocare insuficientă a memoriei la parsarea opțiunilor extinse EDNS0 și a înregistrărilor de resurse de tip SIG/RRSIG în funcția de reasamblare a pachetelor DNS TCP din dns.exe.',
    homelabImpact: 'Severitate maximă pentru Active Directory Domain Controller (ad2025_vm 192.168.1.225 și ad2022_vm 192.168.1.222). Un atacator din rețea sau un container compromis poate prelua controlul complet al controllerului de domeniu, extrăgând fișierul NTDS.dit (hash-urile Kerberos) și generând Golden Tickets.',
    affectedNodes: [
      'ad2025_vm (192.168.1.225 - Windows Server 2025 DC)',
      'ad2022_vm (192.168.1.222 - Windows Server 2022 DC)',
      'ad2019_vm (192.168.1.219 - Windows Server 2019 DC)',
      'ad2016_vm (192.168.1.216 - Windows Server 2016 DC)'
    ],
    attackChain: [
      'Atacatorul interoghează portul 53 pe ad2025_vm sau configurează un server DNS extern malițios către care serverul Windows trimite cereri recursive.',
      'Serverul malițios returnează un pachet de răspuns de peste 64KB conținând o opțiune EDNS0 supradimensionată.',
      'Rutina din dns.exe trunchează lungimea pe 16 biți și alocă un buffer heap insuficient.',
      'Copierea datelor suprascrie structura internă DNS_DISPATCH_TABLE.',
      'Următorul apel de rezoluție execută shellcode-ul atacatorului ca NT AUTHORITY\\SYSTEM.'
    ],
    remediationSteps: [
      'Aplicarea patch-ului de urgență KB5058825 pe toate controllerele Active Directory.',
      'Workaround fără restart: reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\DNS\\Parameters" /v "MaxFieldLength" /t REG_DWORD /d "0xFF00" /f && net stop dns && net start dns.',
      'Decuplare recursivă: Redirecționarea rezoluției externe prin instanța securizată OPNsense Unbound (192.168.1.134:53 DoT) în loc de rezoluție directă root hints.',
      'Reguli de firewall pentru blocarea portului 53 din segmentele DMZ și honeypot.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1203 - Exploitation for Client Execution', 'T1068 - Exploitation for Privilege Escalation'],
    repoPath: 'cyber/cve/CVE-2026-69730',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69730/report.md',
    fixGithubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69730/fix.md',
    sigmaRule: `title: Windows DNS Server Crash or Memory Anomaly
status: critical
logsource:
  product: windows
  service: dns-server
detection:
  selection:
    EventID:
      - 4015
      - 7034
  condition: selection`
  },
  {
    id: 'dhcp-rce',
    cveId: 'CVE-2026-69845 & CVE-2026-72979',
    title: 'Windows DHCP Server: Execuție de Cod de la Distanță (Heap Overflow & UAF)',
    component: 'Windows DHCP Server Service (dhcpssvc.dll / Procesare Opțiuni Vendor & Relay)',
    cvssScore: '9.8',
    cvssSeverity: 'CRITICAL',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: '13 Septembrie 2026',
    status: 'Evaluat & Documentat',
    summary: 'Vulnerabilități critice de tip Heap-based Buffer Overflow și Use-After-Free în serviciul Windows DHCP Server. Permit execuție de cod arbitrar la nivel de SYSTEM prin transmiterea de pachete UDP forjate către portul 67.',
    rootCause: 'Parsare deficitară a opțiunilor specifice producătorului (Vendor-Specific Option 43) și a opțiunilor de agent relay (Option 82) în biblioteca dhcpssvc.dll, generând alocări asimetrice și eliberări duble de memorie.',
    homelabImpact: 'Afectează orice server Windows cu rolul DHCP Server activat în subrețeaua LAN/VLAN 10/VLAN 20. Permite unui dispozitiv neautentificat din rețea să preia controlul serverului DHCP, să otrăvească rutele implicite (default gateway) și să intercepteze traficul.',
    affectedNodes: [
      'ad2025_vm (Dacă are rolul DHCP activat)',
      'Subrețeaua LAN 192.168.1.0/24 (VLAN 10, 20)',
      'Clienții ce primesc configurare IP dinamică'
    ],
    attackChain: [
      'Atacatorul trimite un pachet DHCPDISCOVER pe UDP port 67 cu Option 43 malformat.',
      'Funcția DhcpProcessVendorSpecificInfo() calculează eronat lungimea bufferului de destinație.',
      'Are loc suprascrierea heap-ului procesului svchost.exe (găzduind dhcpssvc.dll).',
      'Atacatorul injectează shellcode și obține privilegii NT AUTHORITY\\SYSTEM.',
      'Atacatorul modifică setările de gateway și DNS transmise celorlalte noduri din rețea.'
    ],
    remediationSteps: [
      'MIGRARE RECOMANDATĂ: Dezafectarea rolului DHCP de pe Windows Server și utilizarea exclusivă a serviciului OPNsense Kea DHCP (192.168.1.134).',
      'Oprirea imediată a serviciului pe Windows: Stop-Service DHCPServer -PassThru && Set-Service DHCPServer -StartupType Disabled.',
      'Dacă serviciul este obligatoriu: Aplicarea patch-ului cumulativ Microsoft septembrie 2026.',
      'Activarea DHCP Snooping și Dynamic ARP Inspection (DAI) pe switch-urile administrate.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1557 - Adversary-in-the-Middle', 'T1068 - Exploitation for Privilege Escalation'],
    repoPath: 'cyber/cve/CVE-2026-69845-CVE-2026-72979',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69845-CVE-2026-72979/report.md',
    fixGithubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69845-CVE-2026-72979/fix.md',
    sigmaRule: `title: Unusual svchost DHCP Service Crash or Memory Corruption
status: critical
logsource:
  product: windows
  service: system
detection:
  selection:
    Source: 'Service Control Manager'
    EventID: 7031
    Message|contains: 'DHCP Server'
  condition: selection`
  }
];

export const CVE_ASSESSMENTS_EN: CveAssessment[] = [
  {
    id: 'pve-auth-bypass',
    cveId: 'CVE-2023-54391',
    title: 'Proxmox VE: Critical Authentication Bypass via tfa-challenge Parameter (Root Takeover)',
    component: 'Proxmox VE libpve-access-control (< 8.0.4) / PVE::AccessControl',
    cvssScore: '9.8',
    cvssSeverity: 'CRITICAL',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / HYPERVISOR-EXPLOIT',
    date: 'September 13, 2026',
    status: 'Remediated & Documented',
    summary: 'Critical authentication bypass in Proxmox VE libpve-access-control allowing unauthenticated network attackers to obtain full root@pam session tickets and CSRF tokens without password verification by supplying a tfa-challenge parameter in POST /api2/json/access/ticket.',
    rootCause: 'Severe logical flaw in verify_user_auth: presence of tfa-challenge parameter causes code to assume Phase 1 password verification already passed. If targeted account lacks TFA configuration (default state of root@pam), server issues valid PVEAuthCookie immediately.',
    homelabImpact: 'Direct and catastrophic on bare-metal hypervisor pve_primary_x64 (192.168.1.132). Attacker gains complete root access to host, full console control of all VMs (ad2025_vm, opnsense_vm, tpot_vm), ability to stop firewalls, and direct read/write access to ZFS pools (rpool, datapool) to extract Active Directory ntds.dit.',
    affectedNodes: [
      'pve_primary_x64 (192.168.1.132 - Proxmox Hypervisor)',
      'ad2025_vm (VMID 400 - Active Directory DC 2025)',
      'ad2022_vm (VMID 401 - Active Directory DC 2022)',
      'opnsense_vm (VMID 200 - Core Firewall & Ingress)',
      'ZFS Pools: rpool (NVMe) & datapool (Mirror OMV)'
    ],
    attackChain: [
      'Network scan on port 8006/TCP identifying vulnerable Proxmox VE release (< 8.0.4).',
      'Crafting HTTP POST request to /api2/json/access/ticket with username=root@pam and tfa-challenge=bypass.',
      'Perl module skips PAM authentication and observes no TFA record in user.cfg.',
      'Server returns 200 OK with valid PVEAuthCookie ticket and CSRF token.',
      'Attacker gains absolute hypervisor root privileges, dumping VM disks and memory.'
    ],
    remediationSteps: [
      'Immediate package update: apt update && apt install --only-upgrade libpve-access-control pve-manager.',
      'Restart API services: systemctl restart pvedaemon.service pveproxy.service.',
      'Zero-downtime mitigation: Enforce 2FA (TOTP/WebAuthn) on root@pam via pveum user tfa add root@pam totp.',
      'Network isolation: Restrict port 8006 strictly to authorized management IP via pve-firewall.'
    ],
    mitreAttack: ['T1078.001 - Default Accounts', 'T1190 - Exploit Public-Facing Application', 'T1556 - Modify Authentication Process'],
    repoPath: 'cyber/cve/CVE-2023-54391',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2023-54391/report.md',
    fixGithubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2023-54391/fix.md',
    sigmaRule: `title: Proxmox VE Authentication Bypass Attempt (CVE-2023-54391)
status: critical
logsource:
  category: webserver
  product: proxmox
detection:
  selection:
    c-method: 'POST'
    cs-uri-stem: '/api2/json/access/ticket'
    cs-uri-query|contains: 'tfa-challenge'
  condition: selection`
  },
  {
    id: 'pve-stored-xss',
    cveId: 'CVE-2025-57539',
    title: 'Proxmox VE: Stored XSS in Datacenter Configuration U2F Origin Field',
    component: 'Proxmox VE 8.4 (pve-manager / ExtJS Web GUI · PVE.dc.OptionView)',
    cvssScore: '5.4',
    cvssSeverity: 'MEDIUM',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N',
    classification: 'TLP:CLEAR / WEB-EXPLOIT',
    date: 'September 13, 2026',
    status: 'Remediated & Documented',
    summary: 'Stored Cross-Site Scripting (XSS) vulnerability in Proxmox VE 8.4 web UI. Allows authenticated users with cluster configuration permissions (or via compromised API tokens) to inject malicious JavaScript into the U2F Origin field of /etc/pve/datacenter.cfg, executing in the root@pam administrator browser session.',
    rootCause: 'Missing HTML encoding (Ext.String.htmlEncode) when rendering the U2F Origin option in ExtJS PVE.dc.OptionView. Stored configuration values are inserted unsafely into the DOM.',
    homelabImpact: 'Stealth privilege escalation to root@pam. When the administrator navigates to Datacenter -> Options in the GUI, the script executes API calls to add attacker public keys to /root/.ssh/authorized_keys or generate persistent root API tokens.',
    affectedNodes: [
      'pve_primary_x64 (192.168.1.132 - Proxmox Web GUI)',
      'Root Administrator Browser Session (root@pam)',
      'Cluster Configuration File /etc/pve/datacenter.cfg'
    ],
    attackChain: [
      'Delegated operator sends PUT /api2/json/cluster/options injecting XSS payload into u2f: origin.',
      'Proxmox saves unescaped string into /etc/pve/datacenter.cfg.',
      'Administrator logs in and opens Datacenter Options in the Web GUI.',
      'Browser executes JavaScript with active root session cookies.',
      'Script calls Proxmox API to create persistent backdoor and exfiltrate credentials.'
    ],
    remediationSteps: [
      'Audit and manually sanitize /etc/pve/datacenter.cfg removing malicious u2f directives.',
      'Upgrade to patched version: apt update && apt install --only-upgrade pve-manager.',
      'Enforce strict Content Security Policy (CSP) via reverse proxy (OPNsense / Caddy) to prohibit inline scripts.',
      'Audit existing API tokens (pveum user token list root@pam) and /root/.ssh/authorized_keys.'
    ],
    mitreAttack: ['T1059.007 - JavaScript', 'T1189 - Drive-by Compromise', 'T1098.004 - SSH Authorized Keys'],
    repoPath: 'cyber/cve/CVE-2025-57539',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2025-57539/report.md',
    fixGithubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2025-57539/fix.md',
    sigmaRule: `title: Proxmox VE Stored XSS Attempt in Datacenter Options (CVE-2025-57539)
status: high
logsource:
  category: webserver
  product: proxmox
detection:
  selection:
    c-method: ['PUT', 'POST']
    cs-uri-stem|contains: '/api2/json/cluster/options'
    cs-uri-query|contains: ['<script', 'onerror=', 'onload=', '<svg', '<img']
  condition: selection`
  },
  {
    id: 'hyperv-escape',
    cveId: 'CVE-2026-69603 & CVE-2026-80083',
    title: 'Windows Hyper-V: Virtual Machine Guest-to-Host Escape',
    component: 'Hyper-V VMBus / SCSI & Net Synthetic Drivers (vmwp.exe, storvsp.sys, vmswitch.sys)',
    cvssScore: '8.8',
    cvssSeverity: 'HIGH',
    cvssVector: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: 'September 13, 2026',
    status: 'Assessed & Documented',
    summary: 'Critical virtualization escape vulnerabilities in Microsoft Hyper-V allowing an attacker operating inside a guest VM to break hypervisor boundaries and execute code as NT AUTHORITY\\SYSTEM on the physical host machine.',
    rootCause: 'Out-of-Bounds Write in storvsp.sys SCSI emulator via malformed Scatter/Gather Lists sent over VMBus (CVE-2026-69603) and Use-After-Free in vmswitch.sys during concurrent MTU renegotiation (CVE-2026-80083).',
    homelabImpact: 'Direct and severe impact on physical Hyper-V host running hlextswitch. An attacker breaking a test VM (metasploitable_vm VMID 202 or tpot_vm VMID 203) escapes to the physical Windows host, granting unrestricted access to memory and VHDX disks of Active Directory (ad2025_vm) and OPNsense firewall.',
    affectedNodes: [
      'Physical Hyper-V Host (hypervisors/hyperv/main.tf)',
      'metasploitable_vm (192.168.1.202 - VMID 202)',
      'metasploitable_licenta_vm (192.168.1.211 - VMID 301)',
      'tpot_vm (192.168.1.203 - VMID 203)',
      'ad2025_vm & ad2022_vm (Co-located VM exposure)'
    ],
    attackChain: [
      'Attacker obtains local execution inside guest VM (e.g. via web vulnerability or vulnerable service).',
      'Guest allocates Guest Physical Address (GPA) and crafts VMBUS_CHANNEL_PACKET_MULIT_PAGE_BUFFER descriptor.',
      'Corrupt buffer dimensions are signaled via HvSignalEvent hypercall.',
      'Host worker process vmwp.exe performs unbounded memory copy into heap.',
      'Overwritten vtable pointers divert execution flow into NT AUTHORITY\\SYSTEM shellcode on host.'
    ],
    remediationSteps: [
      'Deploy September 2026 Microsoft Cumulative Security Updates (KB5058825 / KB5058822).',
      'Disable unnecessary guest integration services: Disable-VMIntegrationService -VMName "metasploitable" -Name "Guest Service Interface".',
      'Enable Virtualization-Based Security (VBS) and Hypervisor-Protected Code Integrity (HVCI) on host.',
      'Disable nested virtualization extensions for untrusted workloads.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1068 - Exploitation for Privilege Escalation', 'T1211 - Exploitation for Defense Evasion'],
    repoPath: 'cyber/cve/CVE-2026-69603-CVE-2026-80083',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69603-CVE-2026-80083/report.md',
    fixGithubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69603-CVE-2026-80083/fix.md',
    sigmaRule: `title: Suspicious Hyper-V Child Process Spawned by vmwp.exe
status: critical
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith: '\\vmwp.exe'
    Image|endswith:
      - '\\cmd.exe'
      - '\\powershell.exe'
      - '\\pwsh.exe'
  condition: selection`
  },
  {
    id: 'dns-rce',
    cveId: 'CVE-2026-69730',
    title: 'Windows DNS Server: Remote Code Execution (Wormable RCE)',
    component: 'Windows DNS Server Service (dns.exe / DNS Responses & EDNS0 Parsing)',
    cvssScore: '9.8',
    cvssSeverity: 'CRITICAL',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: 'September 13, 2026',
    status: 'Assessed & Documented',
    summary: 'Critical unauthenticated wormable remote code execution vulnerability in Windows DNS Server service. Allows remote attackers to trigger SYSTEM code execution by sending malformed DNS packets on port 53 (UDP/TCP).',
    rootCause: 'Integer truncation and heap buffer overflow when handling oversized EDNS0 option records and SIG/RRSIG resource signatures in dns.exe TCP reassembly routine.',
    homelabImpact: 'Severe threat to Active Directory Domain Controllers (ad2025_vm 192.168.1.225 and ad2022_vm 192.168.1.222). Allows complete takeover of the domain controller, granting access to NTDS.dit and Active Directory credentials.',
    affectedNodes: [
      'ad2025_vm (192.168.1.225 - Windows Server 2025 DC)',
      'ad2022_vm (192.168.1.222 - Windows Server 2022 DC)',
      'ad2019_vm (192.168.1.219 - Windows Server 2019 DC)',
      'ad2016_vm (192.168.1.216 - Windows Server 2016 DC)'
    ],
    attackChain: [
      'Attacker sends unauthenticated crafted DNS query to port 53 or lures server into recursive query to malicious authoritative nameserver.',
      'Upstream responses exceeding 64KB with crafted EDNS0 headers are returned.',
      'Integer truncation in dns.exe causes undersized heap buffer allocation.',
      'Copy routine overwrites DNS_DISPATCH_TABLE in heap memory.',
      'Subsequent DNS lookup branches directly into attacker payload executing as SYSTEM.'
    ],
    remediationSteps: [
      'Apply urgent security patch KB5058825 across all Active Directory Domain Controllers.',
      'Zero-reboot workaround: reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\DNS\\Parameters" /v "MaxFieldLength" /t REG_DWORD /d "0xFF00" /f && net stop dns && net start dns.',
      'Forwarder decoupling: Enforce DNS forwarding exclusively through OPNsense Unbound (192.168.1.134:53 DoT) and disable public root hints.',
      'Inbound firewall rules blocking port 53 access from DMZ, testing subnets, and guest VLANs.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1203 - Exploitation for Client Execution', 'T1068 - Exploitation for Privilege Escalation'],
    repoPath: 'cyber/cve/CVE-2026-69730',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69730/report.md',
    fixGithubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69730/fix.md',
    sigmaRule: `title: Windows DNS Server Crash or Memory Anomaly
status: critical
logsource:
  product: windows
  service: dns-server
detection:
  selection:
    EventID:
      - 4015
      - 7034
  condition: selection`
  },
  {
    id: 'dhcp-rce',
    cveId: 'CVE-2026-69845 & CVE-2026-72979',
    title: 'Windows DHCP Server: Remote Code Execution (Heap Overflow & UAF)',
    component: 'Windows DHCP Server Service (dhcpssvc.dll / Option 43 & 82 Parsing)',
    cvssScore: '9.8',
    cvssSeverity: 'CRITICAL',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    classification: 'TLP:CLEAR / VULN-RESEARCH',
    date: 'September 13, 2026',
    status: 'Assessed & Documented',
    summary: 'Critical remote code execution vulnerabilities in Windows DHCP Server service caused by heap buffer overflow and use-after-free conditions during vendor option and relay agent processing.',
    rootCause: 'Flawed parsing of Vendor-Specific Option 43 and Relay Agent Option 82 in dhcpssvc.dll resulting in corrupted pointer calculations and subsequent double-free.',
    homelabImpact: 'Enables any unauthenticated device on the local network or VLAN 10/20 to execute arbitrary code as NT AUTHORITY\\SYSTEM on the DHCP server, poisoning default gateways and DNS servers for all network endpoints.',
    affectedNodes: [
      'ad2025_vm (When running DHCP Server role)',
      'LAN 192.168.1.0/24 Subnet (VLAN 10, 20)',
      'All dynamically addressed client endpoints'
    ],
    attackChain: [
      'Attacker transmits crafted DHCPDISCOVER broadcast to UDP port 67 containing malformed Option 43.',
      'DhcpProcessVendorSpecificInfo() calculates invalid destination buffer offset.',
      'Heap memory of hosting svchost.exe process is corrupted.',
      'Attacker hijacks execution thread under NT AUTHORITY\\SYSTEM privileges.',
      'Attacker alters DHCP leases to redirect default route and DNS traffic through malicious rogue node.'
    ],
    remediationSteps: [
      'RECOMMENDED ARCHITECTURE: Decommission Windows DHCP role and migrate all scopes to OPNsense Kea DHCP (192.168.1.134).',
      'Immediate service disable: Stop-Service DHCPServer -PassThru && Set-Service DHCPServer -StartupType Disabled.',
      'If Windows DHCP must be retained: Apply September 2026 Microsoft cumulative updates.',
      'Enable DHCP Snooping and Dynamic ARP Inspection (DAI) on managed switches.'
    ],
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1557 - Adversary-in-the-Middle', 'T1068 - Exploitation for Privilege Escalation'],
    repoPath: 'cyber/cve/CVE-2026-69845-CVE-2026-72979',
    githubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69845-CVE-2026-72979/report.md',
    fixGithubUrl: 'https://github.com/stefanutc1/infrastructure/blob/main/cyber/cve/CVE-2026-69845-CVE-2026-72979/fix.md',
    sigmaRule: `title: Unusual svchost DHCP Service Crash or Memory Corruption
status: critical
logsource:
  product: windows
  service: system
detection:
  selection:
    Source: 'Service Control Manager'
    EventID: 7031
    Message|contains: 'DHCP Server'
  condition: selection`
  }
];
