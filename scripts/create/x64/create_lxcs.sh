#!/usr/bin/env bash
# ==============================================================================
# Homelab Fleet Automation: Provision all LXC Containers on Node 1 (x86_64)
# Inventory: CT 100 through CT 174 (75 Unified Containers; Ingress Reverse Proxy, AdGuard Home & CrowdSec natively on OPNsense VM 200)
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

if ! command -v pct >/dev/null 2>&1; then
  log_error "Proxmox Container Tool (pct) command not found. Run this directly on Proxmox VE."
  exit 1
fi

STORAGE="${STORAGE:-local-lvm}"
BRIDGE="${BRIDGE:-vmbr0}"
GATEWAY="${GATEWAY:-192.168.1.1}"
FORCE="${FORCE:-false}"

if [[ "${1:-}" == "--force" ]]; then
  FORCE="true"
fi

# Locate template archives in /var/lib/vz/template/cache
ALPINE_TMPL=$(ls -1 /var/lib/vz/template/cache/alpine-*.tar.* 2>/dev/null | sort -V | tail -n 1 || true)
DEBIAN_TMPL=$(ls -1 /var/lib/vz/template/cache/debian-*.tar.* 2>/dev/null | sort -V | tail -n 1 || true)

if [[ -z "$ALPINE_TMPL" ]]; then
  log_info "Downloading Alpine Linux template via pveam..."
  pveam update >/dev/null 2>&1 || true
  pveam download local $(pveam available | awk "/alpine-3/ {print $2}" | sort -V | tail -n 1)
  ALPINE_TMPL=$(ls -1 /var/lib/vz/template/cache/alpine-*.tar.* 2>/dev/null | sort -V | tail -n 1)
fi

if [[ -z "$DEBIAN_TMPL" ]]; then
  log_info "Downloading Debian Linux template via pveam..."
  pveam update >/dev/null 2>&1 || true
  pveam download local $(pveam available | awk "/debian-1/ {print $2}" | sort -V | tail -n 1)
  DEBIAN_TMPL=$(ls -1 /var/lib/vz/template/cache/debian-*.tar.* 2>/dev/null | sort -V | tail -n 1)
fi

echo -e "${C_CYAN}${C_BOLD}"
echo "======================================================================"
echo "    PROXMOX VE NODE 1 (x86_64): LXC CONTAINER PROVISIONER (100-174)"
echo "======================================================================"
echo -e "${C_RESET}"
log_info "Storage Pool   : $STORAGE"
log_info "Bridge         : $BRIDGE"
log_info "Gateway        : $GATEWAY"
log_info "Alpine Template: $ALPINE_TMPL"
log_info "Debian Template: $DEBIAN_TMPL"
log_info "Force Mode     : $FORCE"
echo ""

create_or_skip_lxc() {
  local vmid="$1"
  local hostname="$2"
  shift 2
  local args=("$@")

  if pct status "$vmid" >/dev/null 2>&1; then
    if [[ "$FORCE" == "true" ]]; then
      log_warn "Container $vmid ($hostname) already exists. Force mode enabled: stopping and destroying..."
      pct stop "$vmid" >/dev/null 2>&1 || true
      sleep 2
      pct destroy "$vmid" --purge >/dev/null 2>&1 || true
    else
      log_warn "[SKIP] Container $vmid ($hostname) already exists. Use --force to recreate."
      return 0
    fi
  fi

  log_info "Provisioning Container $vmid: ${C_BOLD}$hostname${C_RESET}..."
  pct create "$vmid" "${args[@]}"
  log_success "Container $vmid ($hostname) provisioned successfully."
}

# ------------------------------------------------------------------------------
# CT 100: immich
# ------------------------------------------------------------------------------
create_or_skip_lxc 100 "immich" \
  "$ALPINE_TMPL" \
  --hostname "immich" \
  --cores 2 \
  --memory 256 \
  --swap 512 \
  --rootfs "$STORAGE:40G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.15/24,type=veth" \
  --features "nesting=1,keyctl=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "alpine;community-script;media;photos"


# ------------------------------------------------------------------------------
# CT 101: nextcloud
# ------------------------------------------------------------------------------
create_or_skip_lxc 101 "nextcloud" \
  "$ALPINE_TMPL" \
  --hostname "nextcloud" \
  --cores 1 \
  --memory 256 \
  --swap 512 \
  --rootfs "$STORAGE:50G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.8/24,type=veth" \
  --features "nesting=1,keyctl=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "alpine;cloud;community-script;storage"




# ------------------------------------------------------------------------------
# CT 102: homeassistant
# ------------------------------------------------------------------------------
create_or_skip_lxc 102 "homeassistant" \
  "$ALPINE_TMPL" \
  --hostname "homeassistant" \
  --cores 2 \
  --memory 128 \
  --swap 128 \
  --rootfs "$STORAGE:16G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.10/24,type=veth" \
  --features "nesting=1,keyctl=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "alpine;automation;community-script;smarthome"


# ------------------------------------------------------------------------------
# CT 103: n8n
# ------------------------------------------------------------------------------
create_or_skip_lxc 103 "n8n" \
  "$ALPINE_TMPL" \
  --hostname "n8n" \
  --cores 2 \
  --memory 256 \
  --swap 512 \
  --rootfs "$STORAGE:8G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.13/24,type=veth" \
  --features "nesting=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "alpine;automation;community-script;workflows"


# ------------------------------------------------------------------------------
# CT 104: scrutiny
# ------------------------------------------------------------------------------
create_or_skip_lxc 104 "scrutiny" \
  "$ALPINE_TMPL" \
  --hostname "scrutiny" \
  --cores 1 \
  --memory 96 \
  --swap 32 \
  --rootfs "$STORAGE:3G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.18/24,type=veth" \
  --features "nesting=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "alpine;community-script;observability;smart-disks"


# ------------------------------------------------------------------------------
# CT 105: media-suite
# ------------------------------------------------------------------------------
create_or_skip_lxc 105 "jellyfin" \
  "$ALPINE_TMPL" \
  --hostname "jellyfin" \
  --cores 2 \
  --memory 896 \
  --swap 256 \
  --rootfs "$STORAGE:50G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.21/24,type=veth" \
  --features "nesting=1,keyctl=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "alpine;arr-stack;community-script;jellyfin;media"


# ------------------------------------------------------------------------------
# CT 106: ollama
# ------------------------------------------------------------------------------
create_or_skip_lxc 106 "ollama" \
  "$DEBIAN_TMPL" \
  --hostname "ollama" \
  --cores 4 \
  --memory 2048 \
  --swap 1024 \
  --rootfs "$STORAGE:16G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.110/24,type=veth" \
  --features "nesting=1" \
  --unprivileged 1 \
  --ostype "debian" \
  --onboot 0 \
  --tags "ai;gtx1050ti;homelab;llm;local-ai;ollama"


# ------------------------------------------------------------------------------
# CT 107: openwebui
# ------------------------------------------------------------------------------
create_or_skip_lxc 107 "openwebui" \
  "$DEBIAN_TMPL" \
  --hostname "openwebui" \
  --cores 2 \
  --memory 512 \
  --swap 512 \
  --rootfs "$STORAGE:8G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.111/24,type=veth" \
  --features "nesting=1" \
  --unprivileged 1 \
  --ostype "debian" \
  --onboot 0 \
  --tags "ai;chat;homelab;webui"


# ------------------------------------------------------------------------------
# CT 108: whisper
# ------------------------------------------------------------------------------
create_or_skip_lxc 108 "whisper" \
  "$DEBIAN_TMPL" \
  --hostname "whisper" \
  --cores 2 \
  --memory 1024 \
  --swap 1024 \
  --rootfs "$STORAGE:8G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.112/24,type=veth" \
  --features "nesting=1" \
  --unprivileged 1 \
  --ostype "debian" \
  --onboot 0 \
  --tags "ai;homelab;stt;whisper"


# ------------------------------------------------------------------------------
# CT 109: flowise
# ------------------------------------------------------------------------------
create_or_skip_lxc 109 "flowise" \
  "$ALPINE_TMPL" \
  --hostname "flowise" \
  --cores 2 \
  --memory 512 \
  --swap 512 \
  --rootfs "$STORAGE:1G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.26/24,type=veth" \
  --features "nesting=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "agents;ai;langchain;llm"


# ------------------------------------------------------------------------------
# CT 110: paperless-ai
# ------------------------------------------------------------------------------
create_or_skip_lxc 110 "paperless-ai" \
  "$ALPINE_TMPL" \
  --hostname "paperless-ai" \
  --cores 1 \
  --memory 64 \
  --swap 64 \
  --rootfs "$STORAGE:1G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.56/24,type=veth" \
  --features "nesting=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "ai;dms;ocr"


# ------------------------------------------------------------------------------
# CT 111: code-server
# ------------------------------------------------------------------------------
create_or_skip_lxc 111 "code-server" \
  "$ALPINE_TMPL" \
  --hostname "code-server" \
  --cores 2 \
  --memory 512 \
  --swap 512 \
  --rootfs "$STORAGE:4G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.115/24,type=veth" \
  --features "nesting=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "codeserver;dev;ide"


# ------------------------------------------------------------------------------
# CT 112: proxmox-backup-server
# ------------------------------------------------------------------------------
create_or_skip_lxc 112 "proxmox-backup-server" \
  "$ALPINE_TMPL" \
  --hostname "proxmox-backup-server" \
  --cores 2 \
  --memory 512 \
  --swap 512 \
  --rootfs "$STORAGE:4G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.116/24,type=veth" \
  --features "nesting=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "backup;deduplication;pbs;storage"


# ------------------------------------------------------------------------------
# CT 113: proxmox-datacenter-manager
# ------------------------------------------------------------------------------
create_or_skip_lxc 113 "proxmox-datacenter-manager" \
  "$ALPINE_TMPL" \
  --hostname "proxmox-datacenter-manager" \
  --cores 2 \
  --memory 512 \
  --swap 512 \
  --rootfs "$STORAGE:4G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.117/24,type=veth" \
  --features "nesting=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "management;multi-cluster;pdm"


# ------------------------------------------------------------------------------
# CT 114: woodpecker-k0s
# ------------------------------------------------------------------------------
create_or_skip_lxc 114 "woodpecker-k0s" \
  "$ALPINE_TMPL" \
  --hostname "woodpecker-k0s" \
  --cores 2 \
  --memory 512 \
  --swap 512 \
  --rootfs "$STORAGE:8G" \
  --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.118/24,type=veth" \
  --features "nesting=1,keyctl=1" \
  --unprivileged 1 \
  --ostype "alpine" \
  --onboot 0 \
  --tags "alpine;cd;ci;k0s;kubernetes;node1;woodpecker"



# ------------------------------------------------------------------------------
# CT 115: it-tools
# ------------------------------------------------------------------------------
create_or_skip_lxc 115 "it-tools"   "$ALPINE_TMPL"   --hostname "it-tools"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.115/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "dev;tools;utilities"   --description "Collection of developer utilities, hash generators, encoders, and network converters."

# ------------------------------------------------------------------------------
# CT 116: actualbudget
# ------------------------------------------------------------------------------
create_or_skip_lxc 116 "actualbudget"   "$ALPINE_TMPL"   --hostname "actualbudget"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.116/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "finance;budgeting"   --description "Zero-based personal budgeting application with real-time transaction tracking."

# ------------------------------------------------------------------------------
# CT 117: trillium
# ------------------------------------------------------------------------------
create_or_skip_lxc 117 "trillium"   "$ALPINE_TMPL"   --hostname "trillium"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.117/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "knowledge;notes;wiki"   --description "Hierarchical knowledge management base for capturing software architecture notes."

# ------------------------------------------------------------------------------
# CT 118: changedetection
# ------------------------------------------------------------------------------
create_or_skip_lxc 118 "changedetection"   "$ALPINE_TMPL"   --hostname "changedetection"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.118/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "monitoring;web-watch"   --description "Monitors targeted web pages and APIs for structural changes and triggers alerts."

# ------------------------------------------------------------------------------
# CT 119: uptimekuma
# ------------------------------------------------------------------------------
create_or_skip_lxc 119 "uptimekuma"   "$ALPINE_TMPL"   --hostname "uptimekuma"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.119/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "monitoring;uptime"   --description "Monitors HTTP, TCP, Ping, and DNS availability with an incident status page."

# ------------------------------------------------------------------------------
# CT 120: vaultwarden
# ------------------------------------------------------------------------------
create_or_skip_lxc 120 "vaultwarden"   "$ALPINE_TMPL"   --hostname "vaultwarden"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.120/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "security;vault;passwords"   --description "Self-hosted zero-knowledge password vault providing cross-device synchronization."

# ------------------------------------------------------------------------------
# CT 121: monitoring
# ------------------------------------------------------------------------------
create_or_skip_lxc 121 "monitoring"   "$ALPINE_TMPL"   --hostname "monitoring"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.121/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "metrics;prometheus;grafana"   --description "Integrated Prometheus time-series database and Grafana visualization platform."

# ------------------------------------------------------------------------------
# CT 122: authelia
# ------------------------------------------------------------------------------
create_or_skip_lxc 122 "authelia"   "$ALPINE_TMPL"   --hostname "authelia"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.122/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "security;sso;2fa"   --description "Identity provider enforcing two-factor authentication and single sign-on (SSO)."

# ------------------------------------------------------------------------------
# CT 123: gitea
# ------------------------------------------------------------------------------
create_or_skip_lxc 123 "gitea"   "$ALPINE_TMPL"   --hostname "gitea"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.123/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "git;vcs;forge"   --description "Lightweight Git code hosting forge supporting pull requests and webhooks."

# ------------------------------------------------------------------------------
# CT 124: gatus
# ------------------------------------------------------------------------------
create_or_skip_lxc 124 "gatus"   "$ALPINE_TMPL"   --hostname "gatus"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.124/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "monitoring;status"   --description "Health dashboard actively probing HTTP endpoints and TLS certificates."

# ------------------------------------------------------------------------------
# CT 125: ntfy
# ------------------------------------------------------------------------------
create_or_skip_lxc 125 "ntfy"   "$ALPINE_TMPL"   --hostname "ntfy"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.125/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "notifications;push"   --description "Unified push notification server sending real-time operational alerts."

# ------------------------------------------------------------------------------
# CT 126: linkding
# ------------------------------------------------------------------------------
create_or_skip_lxc 126 "linkding"   "$ALPINE_TMPL"   --hostname "linkding"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.126/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "bookmarks;search"   --description "Fast bookmark manager with automatic title scraping and tag indexing."

# ------------------------------------------------------------------------------
# CT 127: stepca
# ------------------------------------------------------------------------------
create_or_skip_lxc 127 "stepca"   "$ALPINE_TMPL"   --hostname "stepca"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.127/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "security;pki;acme"   --description "Private certificate authority issuing automated TLS certificates via ACME."

# ------------------------------------------------------------------------------
# CT 128: beszel
# ------------------------------------------------------------------------------
create_or_skip_lxc 128 "beszel"   "$ALPINE_TMPL"   --hostname "beszel"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.128/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "monitoring;metrics"   --description "Aggregates microsecond-resolution system resource metrics across the fleet."

# ------------------------------------------------------------------------------
# CT 129: pocketbase
# ------------------------------------------------------------------------------
create_or_skip_lxc 129 "pocketbase"   "$ALPINE_TMPL"   --hostname "pocketbase"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.129/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "backend;database"   --description "Self-contained backend database and authentication service."

# ------------------------------------------------------------------------------
# CT 130: homepage
# ------------------------------------------------------------------------------
create_or_skip_lxc 130 "homepage"   "$ALPINE_TMPL"   --hostname "homepage"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.130/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "dashboard;portal"   --description "Centralized service portal and dashboard displaying real-time server health."

# ------------------------------------------------------------------------------
# CT 131: speedtest
# ------------------------------------------------------------------------------
create_or_skip_lxc 131 "speedtest"   "$ALPINE_TMPL"   --hostname "speedtest"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.131/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "network;speedtest"   --description "Runs scheduled internet speed benchmarks to monitor WAN bandwidth and latency."

# ------------------------------------------------------------------------------
# CT 132: memos
# ------------------------------------------------------------------------------
create_or_skip_lxc 132 "memos"   "$ALPINE_TMPL"   --hostname "memos"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.132/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "notes;microblog"   --description "Privacy-first micro-note platform for instant thought capturing and journaling."

# ------------------------------------------------------------------------------
# CT 133: wallos
# ------------------------------------------------------------------------------
create_or_skip_lxc 133 "wallos"   "$ALPINE_TMPL"   --hostname "wallos"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.133/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "finance;subscriptions"   --description "Personal finance ledger tracking recurring software subscriptions and costs."

# ------------------------------------------------------------------------------
# CT 134: syncthing
# ------------------------------------------------------------------------------
create_or_skip_lxc 134 "syncthing"   "$ALPINE_TMPL"   --hostname "syncthing"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.134/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "storage;sync"   --description "Continuous file synchronization service replicating document folders securely."

# ------------------------------------------------------------------------------
# CT 135: microbin
# ------------------------------------------------------------------------------
create_or_skip_lxc 135 "microbin"   "$ALPINE_TMPL"   --hostname "microbin"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.135/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "pastebin;sharing"   --description "Secure, encrypted pastebin utility featuring self-destructing code snippets."

# ------------------------------------------------------------------------------
# CT 136: vikunja
# ------------------------------------------------------------------------------
create_or_skip_lxc 136 "vikunja"   "$ALPINE_TMPL"   --hostname "vikunja"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.136/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "productivity;kanban;tasks"   --description "Collaborative project and task management application with Kanban boards."

# ------------------------------------------------------------------------------
# CT 137: blackbox
# ------------------------------------------------------------------------------
create_or_skip_lxc 137 "blackbox"   "$ALPINE_TMPL"   --hostname "blackbox"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.137/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "monitoring;exporter"   --description "Probes internal endpoints over ICMP, HTTP, HTTPS, and TCP for Prometheus."

# ------------------------------------------------------------------------------
# CT 138: yourspotify
# ------------------------------------------------------------------------------
create_or_skip_lxc 138 "yourspotify"   "$ALPINE_TMPL"   --hostname "yourspotify"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.138/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "analytics;music"   --description "Self-hosted music analytics platform recording personal Spotify history."

# ------------------------------------------------------------------------------
# CT 139: webcheck
# ------------------------------------------------------------------------------
create_or_skip_lxc 139 "webcheck"   "$ALPINE_TMPL"   --hostname "webcheck"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.139/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "security;osint;dns"   --description "Performs automated open-source intelligence scans on domains to audit DNS and SSL."

# ------------------------------------------------------------------------------
# CT 140: opengist
# ------------------------------------------------------------------------------
create_or_skip_lxc 140 "opengist"   "$ALPINE_TMPL"   --hostname "opengist"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.140/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "pastebin;git;snippets"   --description "Self-hosted pastebin and code snippet repository powered by Git version control."

# ------------------------------------------------------------------------------
# CT 141: flatnotes
# ------------------------------------------------------------------------------
create_or_skip_lxc 141 "flatnotes"   "$ALPINE_TMPL"   --hostname "flatnotes"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.141/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "notes;markdown"   --description "Fast, minimalist Markdown note editor interfacing directly with local files."

# ------------------------------------------------------------------------------
# CT 142: whoogle
# ------------------------------------------------------------------------------
create_or_skip_lxc 142 "whoogle"   "$ALPINE_TMPL"   --hostname "whoogle"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.142/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "search;privacy"   --description "Privacy-preserving search gateway proxying Google search queries anonymously."

# ------------------------------------------------------------------------------
# CT 143: shlink
# ------------------------------------------------------------------------------
create_or_skip_lxc 143 "shlink"   "$ALPINE_TMPL"   --hostname "shlink"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.143/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "url-shortener;analytics"   --description "Self-hosted URL shortener featuring link tracking analytics and QR code generation."

# ------------------------------------------------------------------------------
# CT 144: pingvin-share
# ------------------------------------------------------------------------------
create_or_skip_lxc 144 "pingvin-share"   "$ALPINE_TMPL"   --hostname "pingvin-share"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.144/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "file-share;privacy"   --description "Privacy-focused file sharing platform enabling secure link-based transfers."

# ------------------------------------------------------------------------------
# CT 145: rss-bridge
# ------------------------------------------------------------------------------
create_or_skip_lxc 145 "rss-bridge"   "$ALPINE_TMPL"   --hostname "rss-bridge"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.145/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "rss;syndication"   --description "Generates clean RSS/Atom feeds from social networks and dynamic websites."

# ------------------------------------------------------------------------------
# CT 146: excalidraw
# ------------------------------------------------------------------------------
create_or_skip_lxc 146 "excalidraw"   "$ALPINE_TMPL"   --hostname "excalidraw"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.146/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "diagrams;whiteboard"   --description "Collaborative whiteboard drawing tool for sketching system architectures."

# ------------------------------------------------------------------------------
# CT 147: renovate-gitops
# ------------------------------------------------------------------------------
create_or_skip_lxc 147 "renovate-gitops"   "$ALPINE_TMPL"   --hostname "renovate-gitops"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.147/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "gitops;dependencies"   --description "Automated dependency update bot generating Pull Requests for container tags."

# ------------------------------------------------------------------------------
# CT 148: transmission
# ------------------------------------------------------------------------------
create_or_skip_lxc 148 "transmission"   "$ALPINE_TMPL"   --hostname "transmission"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.148/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "media;bittorrent"   --description "Isolated BitTorrent download gateway and management interface."

# ------------------------------------------------------------------------------
# CT 149: kavita
# ------------------------------------------------------------------------------
create_or_skip_lxc 149 "kavita"   "$ALPINE_TMPL"   --hostname "kavita"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.149/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "media;books;manga"   --description "Self-hosted digital reading server supporting manga, comics, and ebooks."

# ------------------------------------------------------------------------------
# CT 150: stirling-pdf
# ------------------------------------------------------------------------------
create_or_skip_lxc 150 "stirling-pdf"   "$ALPINE_TMPL"   --hostname "stirling-pdf"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.150/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "documents;pdf"   --description "Powerful local web application for performing PDF merging, splitting, and OCR."

# ------------------------------------------------------------------------------
# CT 151: audiobookshelf
# ------------------------------------------------------------------------------
create_or_skip_lxc 151 "audiobookshelf"   "$ALPINE_TMPL"   --hostname "audiobookshelf"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.151/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "media;audiobooks"   --description "Self-hosted audiobooks and podcasts streaming server."

# ------------------------------------------------------------------------------
# CT 152: tubearchivist
# ------------------------------------------------------------------------------
create_or_skip_lxc 152 "tubearchivist"   "$ALPINE_TMPL"   --hostname "tubearchivist"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.152/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "media;youtube;archive"   --description "Self-hosted YouTube media archiver with semantic indexing."

# ------------------------------------------------------------------------------
# CT 153: calibre-web
# ------------------------------------------------------------------------------
create_or_skip_lxc 153 "calibre-web"   "$ALPINE_TMPL"   --hostname "calibre-web"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.153/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "media;ebooks;library"   --description "Clean web interface for browsing, reading, and downloading Calibre eBooks."

# ------------------------------------------------------------------------------
# CT 154: cyberchef
# ------------------------------------------------------------------------------
create_or_skip_lxc 154 "cyberchef"   "$ALPINE_TMPL"   --hostname "cyberchef"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.154/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "cyber;tools;crypto"   --description "Web app for encryption, encoding, compression, and data analysis."

# ------------------------------------------------------------------------------
# CT 155: drawio
# ------------------------------------------------------------------------------
create_or_skip_lxc 155 "drawio"   "$ALPINE_TMPL"   --hostname "drawio"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.155/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "diagrams;design"   --description "Self-hosted diagramming tool for security designs and network flowcharts."

# ------------------------------------------------------------------------------
# CT 156: romm
# ------------------------------------------------------------------------------
create_or_skip_lxc 156 "romm"   "$ALPINE_TMPL"   --hostname "romm"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.156/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "gaming;retro;roms"   --description "Retro gaming ROM manager with metadata enrichment and game covers."

# ------------------------------------------------------------------------------
# CT 157: emulatorjs
# ------------------------------------------------------------------------------
create_or_skip_lxc 157 "emulatorjs"   "$ALPINE_TMPL"   --hostname "emulatorjs"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.157/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "gaming;emulator"   --description "In-browser retro gaming emulator supporting multi-platform consoles."

# ------------------------------------------------------------------------------
# CT 158: paperless-ngx
# ------------------------------------------------------------------------------
create_or_skip_lxc 158 "paperless-ngx"   "$ALPINE_TMPL"   --hostname "paperless-ngx"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.158/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "documents;dms;ocr"   --description "Document management system transforming physical documents into searchable archives."

# ------------------------------------------------------------------------------
# CT 159: minio
# ------------------------------------------------------------------------------
create_or_skip_lxc 159 "minio"   "$ALPINE_TMPL"   --hostname "minio"   --cores 1   --memory 256   --swap 128   --rootfs "$STORAGE:4G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.159/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "storage;s3;buckets"   --description "High-performance S3-compatible distributed object storage server."

# ------------------------------------------------------------------------------
# CT 160: meilisearch
# ------------------------------------------------------------------------------
create_or_skip_lxc 160 "meilisearch"   "$ALPINE_TMPL"   --hostname "meilisearch"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.160/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "search;indexing"   --description "Lightning-fast, hyper-relevant search engine for documents and logs."

# ------------------------------------------------------------------------------
# CT 161: vector
# ------------------------------------------------------------------------------
create_or_skip_lxc 161 "vector"   "$ALPINE_TMPL"   --hostname "vector"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.161/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "logging;telemetry"   --description "High-performance observability data pipeline for logs, metrics, and traces."

# ------------------------------------------------------------------------------
# CT 162: searxng
# ------------------------------------------------------------------------------
create_or_skip_lxc 162 "searxng"   "$ALPINE_TMPL"   --hostname "searxng"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.162/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "search;metasearch"   --description "Privacy-respecting, hackable metasearch engine aggregating 70+ search engines."

# ------------------------------------------------------------------------------
# CT 163: netalertx
# ------------------------------------------------------------------------------
create_or_skip_lxc 163 "netalertx"   "$ALPINE_TMPL"   --hostname "netalertx"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.163/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "security;network;scan"   --description "Network security scanner alerting on new devices and ARP spoofing."

# ------------------------------------------------------------------------------
# CT 164: rustdesk
# ------------------------------------------------------------------------------
create_or_skip_lxc 164 "rustdesk"   "$ALPINE_TMPL"   --hostname "rustdesk"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.164/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "remote-desktop;relay"   --description "Open-source virtual/remote desktop infrastructure and signal relay."

# ------------------------------------------------------------------------------
# CT 165: kopia
# ------------------------------------------------------------------------------
create_or_skip_lxc 165 "kopia"   "$ALPINE_TMPL"   --hostname "kopia"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.165/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "backup;snapshots"   --description "Fast and secure open-source backup tool creating encrypted snapshots."

# ------------------------------------------------------------------------------
# CT 166: wg-easy
# ------------------------------------------------------------------------------
create_or_skip_lxc 166 "wg-easy"   "$ALPINE_TMPL"   --hostname "wg-easy"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.166/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "vpn;wireguard;gui"   --description "WireGuard VPN management dashboard with automated QR client profiles."

# ------------------------------------------------------------------------------
# CT 167: pgadmin
# ------------------------------------------------------------------------------
create_or_skip_lxc 167 "pgadmin"   "$ALPINE_TMPL"   --hostname "pgadmin"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.167/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "database;postgres"   --description "Comprehensive web management interface for PostgreSQL database clusters."

# ------------------------------------------------------------------------------
# CT 168: dozzle
# ------------------------------------------------------------------------------
create_or_skip_lxc 168 "dozzle"   "$ALPINE_TMPL"   --hostname "dozzle"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.168/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "logging;containers"   --description "Real-time log viewer for Docker and Podman container workloads."

# ------------------------------------------------------------------------------
# CT 169: kiwix
# ------------------------------------------------------------------------------
create_or_skip_lxc 169 "kiwix"   "$ALPINE_TMPL"   --hostname "kiwix"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.169/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "knowledge;offline"   --description "Offline knowledge reader serving Wikipedia, Stack Exchange, and Project Gutenberg."

# ------------------------------------------------------------------------------
# CT 170: hedgedoc
# ------------------------------------------------------------------------------
create_or_skip_lxc 170 "hedgedoc"   "$ALPINE_TMPL"   --hostname "hedgedoc"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.170/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "collaboration;markdown"   --description "Collaborative markdown editor for real-time document authoring."

# ------------------------------------------------------------------------------
# CT 171: glances
# ------------------------------------------------------------------------------
create_or_skip_lxc 171 "glances"   "$ALPINE_TMPL"   --hostname "glances"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.171/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "monitoring;system"   --description "Cross-platform system monitoring tool powered by Python and curses/web UI."

# ------------------------------------------------------------------------------
# CT 172: gotify
# ------------------------------------------------------------------------------
create_or_skip_lxc 172 "gotify"   "$ALPINE_TMPL"   --hostname "gotify"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.172/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "notifications;push"   --description "Simple server for sending and receiving push notifications over WebSockets."

# ------------------------------------------------------------------------------
# CT 173: miniflux
# ------------------------------------------------------------------------------
create_or_skip_lxc 173 "miniflux"   "$ALPINE_TMPL"   --hostname "miniflux"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:1G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.173/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "rss;news"   --description "Minimalist and opinionated Feed reader written in Go with Fever API support."

# ------------------------------------------------------------------------------
# CT 174: grocy
# ------------------------------------------------------------------------------
create_or_skip_lxc 174 "grocy"   "$ALPINE_TMPL"   --hostname "grocy"   --cores 1   --memory 128   --swap 128   --rootfs "$STORAGE:2G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.174/24,type=veth"   --features "nesting=1,keyctl=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "inventory;groceries;erp"   --description "Enterprise resource planning (ERP) system for household grocery and pantry tracking."

# ------------------------------------------------------------------------------
# CT 175: owasp
# ------------------------------------------------------------------------------
create_or_skip_lxc 175 "owasp"   "$ALPINE_TMPL"   --hostname "owasp"   --cores 2   --memory 512   --swap 256   --rootfs "$STORAGE:8G"   --net0 "name=eth0,bridge=$BRIDGE,gw=$GATEWAY,ip=192.168.1.175/24,type=veth"   --features "nesting=1"   --unprivileged 1   --ostype "alpine"   --onboot 0   --tags "alpine;cyber;docker;juice-shop;owasp;security;web"   --description "OWASP Juice Shop Vulnerable Web App Container (Alpine LXC + Docker)"

echo ""
echo -e "======================================================================"
echo -e "  All 76 Containers (100-175) Processed Successfully on Node 1 (x86)! "
echo -e "======================================================================"
echo ""
pct list

