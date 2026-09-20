#!/usr/bin/env bash
# ==============================================================================
# Datacenter Fleet Automation: Provision all Virtual Machines on Node 1 (x86_64)
# Target Host: Node 1 Primary Proxmox VE (x86_64 / amd64)
# Inventory: Enterprise Virtual Machines (VMs 200-205, 301, 302, 400-408)
# ==============================================================================
set -euo pipefail

# Visual styling
C_RESET="\033[0m"
C_BOLD="\033[1m"
C_GREEN="\033[32m"
C_YELLOW="\033[33m"
C_BLUE="\033[34m"
C_CYAN="\033[36m"
C_RED="\033[31m"

log_info()    { echo -e "${C_BLUE}${C_BOLD}[INFO]${C_RESET} $*"; }
log_success() { echo -e "${C_GREEN}${C_BOLD}[SUCCESS]${C_RESET} $*"; }
log_warn()    { echo -e "${C_YELLOW}${C_BOLD}[WARN]${C_RESET} $*"; }
log_error()   { echo -e "${C_RED}${C_BOLD}[ERROR]${C_RESET} $*" >&2; }

if [[ $EUID -ne 0 ]]; then
  log_error "This script must be executed as root on Proxmox VE (Node 1)."
  exit 1
fi

if ! command -v qm >/dev/null 2>&1; then
  log_error "Proxmox QEMU Manager (qm) command not found. Run this directly on Proxmox VE."
  exit 1
fi

STORAGE="${STORAGE:-local-lvm}"
BRIDGE="${BRIDGE:-vmbr0}"
ISO_STORAGE="${ISO_STORAGE:-local:iso}"
FORCE="${FORCE:-false}"

if [[ "${1:-}" == "--force" ]]; then
  FORCE="true"
fi

echo -e "${C_CYAN}${C_BOLD}"
echo "======================================================================"
echo "    PROXMOX VE NODE 1 (x86_64): VIRTUAL MACHINE PROVISIONER           "
echo "======================================================================"
echo -e "${C_RESET}"
log_info "Storage Pool : $STORAGE"
log_info "Bridge       : $BRIDGE"
log_info "ISO Storage  : $ISO_STORAGE"
log_info "Force Mode   : $FORCE"
echo ""

create_or_skip_vm() {
  local vmid="$1"
  local name="$2"
  shift 2
  local args=("$@")

  if qm status "$vmid" >/dev/null 2>&1; then
    if [[ "$FORCE" == "true" ]]; then
      log_warn "VM $vmid ($name) already exists. Force mode enabled: stopping and destroying..."
      qm stop "$vmid" >/dev/null 2>&1 || true
      sleep 2
      qm destroy "$vmid" --purge >/dev/null 2>&1 || true
    else
      log_warn "[SKIP] VM $vmid ($name) already exists. Use --force to recreate."
      return 0
    fi
  fi

  log_info "Provisioning VM $vmid: ${C_BOLD}$name${C_RESET}..."
  qm create "$vmid" "${args[@]}"
  log_success "VM $vmid ($name) provisioned successfully."
}

# ------------------------------------------------------------------------------
# VM 200: opnsense
# ------------------------------------------------------------------------------
create_or_skip_vm 200 "opnsense" \
  --name "opnsense" \
  --memory 2048 \
  --balloon 1024 \
  --cores 2 \
  --cpu host \
  --scsihw virtio-scsi-pci \
  --scsi0 "$STORAGE:16,discard=on,ssd=1" \
  --net0 "virtio,bridge=$BRIDGE,firewall=0" \
  --ide2 "$ISO_STORAGE/OPNsense-dvd-amd64.iso,media=cdrom" \
  --boot "order=scsi0;ide2;net0" \
  --ostype other \
  --tags "firewall;freebsd;kvm;router;stefanut"

# ------------------------------------------------------------------------------
# VM 201: openstack
# ------------------------------------------------------------------------------
create_or_skip_vm 201 "openstack" \
  --name "openstack" \
  --memory 4096 \
  --balloon 2048 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:32,discard=on,ssd=1" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;net0" \
  --ostype l26 \
  --tags "cloud;horizon;iaas;neutron;node1;nova;openstack;vm201"

# ------------------------------------------------------------------------------
# VM 202: Metasploitable2
# ------------------------------------------------------------------------------
create_or_skip_vm 202 "Metasploitable2" \
  --name "Metasploitable2" \
  --memory 512 \
  --cores 1 \
  --cpu x86-64-v2-AES \
  --ide0 "$STORAGE:8" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=ide0;net0" \
  --ostype l26 \
  --tags "cyber;metasploit;metasploitable2;penetration-testing;red-team;vm202"

# ------------------------------------------------------------------------------
# VM 203: tpot-honeypot
# ------------------------------------------------------------------------------
create_or_skip_vm 203 "tpot-honeypot" \
  --name "tpot-honeypot" \
  --memory 8192 \
  --balloon 4096 \
  --cores 4 \
  --scsihw virtio-scsi-pci \
  --scsi0 "$STORAGE:60" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --ide2 "$ISO_STORAGE/debian-netinst.iso,media=cdrom" \
  --boot "order=scsi0;ide2" \
  --ostype l26 \
  --tags "cyber;honeypot;tpot;vm203"

# ------------------------------------------------------------------------------
# VM 204: securityonion
# ------------------------------------------------------------------------------
create_or_skip_vm 204 "securityonion" \
  --name "securityonion" \
  --memory 8192 \
  --balloon 4096 \
  --cores 4 \
  --cpu x86-64-v2-AES \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:50" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --ide2 "$ISO_STORAGE/securityonion.iso,media=cdrom" \
  --boot "order=scsi0;ide2;net0" \
  --ostype l26 \
  --tags "blue-team;hids;log-analysis;security-onion;siem;vm204;wazuh"

# ------------------------------------------------------------------------------
# VM 205: remnux
# ------------------------------------------------------------------------------
create_or_skip_vm 205 "remnux" \
  --name "remnux" \
  --memory 4096 \
  --balloon 2048 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:40" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --ide2 "$ISO_STORAGE/remnux-installer.iso,media=cdrom" \
  --boot "order=scsi0;ide2;net0" \
  --ostype l26 \
  --tags "cyber;dfir;malware-analysis;remnux;reverse-engineering;vm205"

# ------------------------------------------------------------------------------
# VM 301: metasploitable-licenta (Bachelor Thesis / Lucrare de Licenta)
# ------------------------------------------------------------------------------
create_or_skip_vm 301 "metasploitable-licenta" \
  --name "metasploitable-licenta" \
  --description "Bachelor Thesis Lab (Lucrare de Licenta) - Metasploitable Linux Target (Penetration Testing, Red Teaming & Suricata/Wazuh Vulnerability Lab)" \
  --memory 2048 \
  --balloon 1024 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:20,discard=on,ssd=1" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;net0" \
  --ostype l26 \
  --tags "cyber;licenta;bachelor-thesis;metasploit;metasploitable;pentest;red-team;vm301"

# ------------------------------------------------------------------------------
# VM 302: kali-licenta (Bachelor Thesis / Lucrare de Licenta)
# ------------------------------------------------------------------------------
create_or_skip_vm 302 "kali-licenta" \
  --name "kali-licenta" \
  --description "Bachelor Thesis Lab (Lucrare de Licenta) - Kali Linux Offensive Security & Red Team Pentest Workstation" \
  --memory 4096 \
  --balloon 2048 \
  --cores 2 \
  --cpu host \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:30,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/kali-linux-2026.2-installer-netinst-amd64.iso,media=cdrom" \
  --net0 "virtio,bridge=vmbr1,firewall=1,tag=30" \
  --boot "order=scsi0;ide2;net0" \
  --ostype l26 \
  --tags "cyber;licenta;bachelor-thesis;kali;pentest;red-team;vm302"

# ------------------------------------------------------------------------------
# VM 310: core-banking-licenta (Bachelor Thesis / Lucrare de Licenta)
# ------------------------------------------------------------------------------
create_or_skip_vm 310 "core-banking-licenta" \
  --name "core-banking-licenta" \
  --description "Bachelor Thesis Lab (Lucrare de Licenta) - Core-Banking System (Apache Fineract / Mifos X Engine, Double-Entry Ledger, VLAN 20 Services)" \
  --memory 4096 \
  --balloon 2048 \
  --cores 2 \
  --cpu host \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:40,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/debian-netinst.iso,media=cdrom" \
  --net0 "virtio,bridge=vmbr1,firewall=1,tag=20" \
  --boot "order=scsi0;ide2;net0" \
  --ostype l26 \
  --onboot 0 \
  --tags "cyber;licenta;bachelor-thesis;core-banking;fineract;vlan20;vm310"

# ------------------------------------------------------------------------------
# VM 311: fin-db-licenta (Bachelor Thesis / Lucrare de Licenta)
# ------------------------------------------------------------------------------
create_or_skip_vm 311 "fin-db-licenta" \
  --name "fin-db-licenta" \
  --description "Bachelor Thesis Lab (Lucrare de Licenta) - Financial Database Server (PostgreSQL Isolated Ledger DB & Wazuh HIDS/SIEM Audit)" \
  --memory 4096 \
  --balloon 2048 \
  --cores 2 \
  --cpu host \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:50,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/debian-netinst.iso,media=cdrom" \
  --net0 "virtio,bridge=vmbr1,firewall=1,tag=20" \
  --boot "order=scsi0;ide2;net0" \
  --ostype l26 \
  --onboot 0 \
  --tags "cyber;licenta;bachelor-thesis;database;postgresql;wazuh-audit;vlan20;vm311"

# ------------------------------------------------------------------------------
# VM 313: swift-jumpbox-licenta (Bachelor Thesis / Lucrare de Licenta)
# ------------------------------------------------------------------------------
create_or_skip_vm 313 "swift-jumpbox-licenta" \
  --name "swift-jumpbox-licenta" \
  --description "Bachelor Thesis Lab (Lucrare de Licenta) - Hardened Bastion Host / Jump-Box (SSH ed25519 & MFA, Central Audit, Credential Isolation)" \
  --memory 2048 \
  --balloon 1024 \
  --cores 2 \
  --cpu host \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:25,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/debian-netinst.iso,media=cdrom" \
  --net0 "virtio,bridge=vmbr1,firewall=1,tag=10" \
  --boot "order=scsi0;ide2;net0" \
  --ostype l26 \
  --onboot 0 \
  --tags "cyber;licenta;bachelor-thesis;bastion;jump-box;ssh-mfa;hardened;vm313"

# ==============================================================================
# ACTIVE DIRECTORY ENTERPRISE LAB FLEET (400 - 408)
# Massgrave Genuine Media · Multi-Generation Windows Active Directory Domain Lab
# ==============================================================================

# ------------------------------------------------------------------------------
# VM 400: ad2025 (Windows Server 2025 Domain Controller)
# ------------------------------------------------------------------------------
create_or_skip_vm 400 "ad2025" \
  --name "ad2025" \
  --description "Active Directory Lab - Windows Server 2025 Standard/Datacenter Domain Controller (GTX 1050 Ti PCIe Passthrough)" \
  --memory 8192 \
  --cores 6 \
  --cpu host \
  --machine q35 \
  --bios ovmf \
  --efidisk0 "$STORAGE:1,efitype=4m,pre-enrolled-keys=1" \
  --hostpci0 "mapping=gtx1050ti,pcie=1,x-vga=1" \
  --args "-cpu host,kvm=off,hv_vendor_id=proxmox" \
  --ide0 "$STORAGE:256" \
  --ide2 "$ISO_STORAGE/en-us_windows_server_2025_updated_aug_2026_x64_dvd_b0833651.iso,media=cdrom" \
  --ide1 "$ISO_STORAGE/virtio-win.iso,media=cdrom" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=ide0;ide2;net0;ide1" \
  --ostype win11 \
  --tags "active-directory;ad2025;domain-controller;gtx1050ti;microsoft;server2025;vm400;windows"

# ------------------------------------------------------------------------------
# VM 401: ad2022 (Windows Server 2022 Domain Controller)
# ------------------------------------------------------------------------------
create_or_skip_vm 401 "ad2022" \
  --name "ad2022" \
  --description "Active Directory Lab - Windows Server 2022 Standard/Datacenter Domain Controller" \
  --memory 4096 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --machine q35 \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:60,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/windows_server_2022_x64.iso,media=cdrom" \
  --ide0 "$ISO_STORAGE/virtio-win.iso,media=cdrom" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;ide2;ide0;net0" \
  --ostype win11 \
  --tags "active-directory;ad2022;domain-controller;microsoft;server2022;vm401;windows"

# ------------------------------------------------------------------------------
# VM 402: ad2019 (Windows Server 2019 Domain Controller)
# ------------------------------------------------------------------------------
create_or_skip_vm 402 "ad2019" \
  --name "ad2019" \
  --description "Active Directory Lab - Windows Server 2019 Standard Domain Controller" \
  --memory 2048 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --machine q35 \
  --bios ovmf \
  --efidisk0 "$STORAGE:1,efitype=4m,pre-enrolled-keys=1" \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:128,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/windows_server_2019_x64.iso,media=cdrom" \
  --ide0 "$ISO_STORAGE/virtio-win.iso,media=cdrom" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;ide2;ide0;net0" \
  --ostype win10 \
  --tags "active-directory;ad2019;domain-controller;microsoft;server2019;vm402;windows"

# ------------------------------------------------------------------------------
# VM 403: ad2016 (Windows Server 2016 Domain Controller)
# ------------------------------------------------------------------------------
create_or_skip_vm 403 "ad2016" \
  --name "ad2016" \
  --description "Active Directory Lab - Windows Server 2016 Standard Domain Controller" \
  --memory 3072 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --machine q35 \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:50,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/en_windows_server_2016_vl_x64_dvd_11636701.iso,media=cdrom" \
  --ide0 "$ISO_STORAGE/virtio-win.iso,media=cdrom" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;ide2;ide0;net0" \
  --ostype win10 \
  --tags "active-directory;ad2016;domain-controller;microsoft;server2016;vm403;windows"

# ------------------------------------------------------------------------------
# VM 404: ad2012 (Windows Server 2012 R2 Domain Controller)
# ------------------------------------------------------------------------------
create_or_skip_vm 404 "ad2012" \
  --name "ad2012" \
  --description "Active Directory Lab - Windows Server 2012 R2 Standard Domain Controller" \
  --memory 2048 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --machine pc-i440fx-11.0+pve2 \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:40,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/windows_server_2012_r2_x64.iso,media=cdrom" \
  --ide0 "$ISO_STORAGE/virtioVECHI.iso,media=cdrom" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;ide2;ide0;net0" \
  --ostype win8 \
  --tags "active-directory;ad2012;domain-controller;microsoft;server2012r2;vm404;windows"

# ------------------------------------------------------------------------------
# VM 405: ad2008 (Windows Server 2008 R2 SP1 Domain Controller)
# ------------------------------------------------------------------------------
create_or_skip_vm 405 "ad2008" \
  --name "ad2008" \
  --description "Active Directory Lab - Windows Server 2008 R2 SP1 Standard Domain Controller" \
  --memory 2048 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --machine pc-i440fx-11.0+pve2 \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:40,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/windows_server_2008_r2_x64.iso,media=cdrom" \
  --ide0 "$ISO_STORAGE/virtioVECHI.iso,media=cdrom" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;ide2;ide0;net0" \
  --ostype win7 \
  --tags "active-directory;ad2008;domain-controller;microsoft;server2008r2;vm405;windows"

# ------------------------------------------------------------------------------
# VM 406: adwin10 (Windows 10 Enterprise Domain Member Client)
# ------------------------------------------------------------------------------
create_or_skip_vm 406 "adwin10" \
  --name "adwin10" \
  --description "Active Directory Lab - Windows 10 Enterprise Domain Member Client" \
  --memory 3072 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --machine q35 \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:50,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/windows_10_x64.iso,media=cdrom" \
  --ide0 "$ISO_STORAGE/virtio-win.iso,media=cdrom" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;ide2;ide0;net0" \
  --ostype win10 \
  --tags "active-directory;adwin10;client;domain-client;microsoft;vm406;windows10"

# ------------------------------------------------------------------------------
# VM 407: adwin11 (Windows 11 Enterprise Domain Member Client)
# ------------------------------------------------------------------------------
create_or_skip_vm 407 "adwin11" \
  --name "adwin11" \
  --description "Active Directory Lab - Windows 11 Enterprise Domain Member Client" \
  --memory 4096 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --machine q35 \
  --bios ovmf \
  --efidisk0 "$STORAGE:1,efitype=4m,pre-enrolled-keys=1" \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:60,discard=on,ssd=1" \
  --ide2 "$ISO_STORAGE/windows_11_x64.iso,media=cdrom" \
  --ide0 "$ISO_STORAGE/virtio-win.iso,media=cdrom" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;ide2;ide0;net0" \
  --ostype win11 \
  --tags "active-directory;adwin11;client;domain-client;microsoft;vm407;windows11"

# ------------------------------------------------------------------------------
# VM 408: adwin7 (Windows 7 Ultimate SP1 Domain Member Client)
# ------------------------------------------------------------------------------
create_or_skip_vm 408 "adwin7" \
  --name "adwin7" \
  --description "Active Directory Lab - Windows 7 Ultimate SP1 Domain Member Client" \
  --memory 2048 \
  --balloon 1024 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --machine pc \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:50,iothread=1" \
  --ide2 "$ISO_STORAGE/windows_7_sp1_x64.iso,media=cdrom" \
  --ide0 "$ISO_STORAGE/virtioVECHI.iso,media=cdrom" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;ide2;ide0;net0" \
  --ostype win7 \
  --tags "activedirectory;adlab;client;microsoft;windows;windows-7"

# ------------------------------------------------------------------------------
# VM 409: adrhel (Red Hat Enterprise Linux 9.8 Domain Workload)
# ------------------------------------------------------------------------------
create_or_skip_vm 409 "adrhel" \
  --name "adrhel" \
  --description "Active Directory Lab - Red Hat Enterprise Linux 9.8 Domain Workload (SSSD / Realm Join, Kerberos)" \
  --memory 2048 \
  --balloon 1024 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --machine q35 \
  --bios ovmf \
  --efidisk0 "$STORAGE:1,efitype=4m,pre-enrolled-keys=1" \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:50,iothread=1" \
  --ide2 "$ISO_STORAGE/rhel-9.8-x86_64-boot.iso,media=cdrom" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;ide2;net0" \
  --ostype l26 \
  --tags "activedirectory;adlab;linux;redhat;rhel;rhel-9"

# ------------------------------------------------------------------------------
# VM 410: ad2003 (Windows Server 2003 R2 SP2 Enterprise Domain Controller)
# ------------------------------------------------------------------------------
create_or_skip_vm 410 "ad2003" \
  --name "ad2003" \
  --description "Active Directory Lab - Windows Server 2003 R2 SP2 Enterprise Domain Controller" \
  --memory 2048 \
  --cores 2 \
  --cpu x86-64-v2-AES \
  --machine pc-i440fx-11.0+pve2 \
  --scsihw virtio-scsi-single \
  --scsi0 "$STORAGE:40,iothread=1" \
  --ide2 "$ISO_STORAGE/windows_server_2003_r2_x64.iso,media=cdrom" \
  --ide0 "$ISO_STORAGE/virtioDINALDOILEARAZBOIMONDIAL.iso,media=cdrom" \
  --args "-fda $ISO_STORAGE/virtioDINALDOILEARAZBOIMONDIAL.vfd" \
  --net0 "virtio,bridge=$BRIDGE,firewall=1" \
  --boot "order=scsi0;ide2;ide0;net0" \
  --ostype w2k3 \
  --tags "activedirectory;adlab;legacy;microsoft;server;windows;windows-server-2003"




echo ""
echo -e "${C_GREEN}${C_BOLD}======================================================================${C_RESET}"
echo -e "${C_GREEN}${C_BOLD}    Virtual Machines Processed Successfully on Node 1 (x86_64)!       ${C_RESET}"
echo -e "${C_GREEN}${C_BOLD}======================================================================${C_RESET}"
echo ""
qm list

