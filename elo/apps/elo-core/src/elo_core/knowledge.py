from __future__ import annotations
import logging
from typing import List, Dict, Any

logger = logging.getLogger("elo.core.knowledge")

HOMELAB_KNOWLEDGE_DOCS = [
    {
        "topic": "Proxmox Virtualization Node (pve-node-1)",
        "content": (
            "Proxmox VE 8.x rulează pe IP-ul 192.168.10.2:8006 (VLAN 10 Management). "
            "Găzduiește containerele LXC 100-109 și VM-urile: VM 200 (OPNsense Router), VM 201 (Windows Server 2025 Datacenter). "
            "Storage-ul pentru VM disk images este pe ZFS local-zfs și share-urile NFS de pe OpenMediaVault."
        ),
        "tags": ["proxmox", "pve", "vm", "lxc", "hypervisor", "192.168.10.2", "8006"]
    },
    {
        "topic": "OpenMediaVault Storage NAS",
        "content": (
            "OpenMediaVault NAS rulează pe IP-ul 192.168.10.3 (VLAN 10 Storage). "
            "Administrează pool-ul ZFS tank-pool-01 cu share-uri NFS pentru Proxmox și SMB pentru rețeaua LAN. "
            "Backup-urile automate se realizează prin BorgBackup și Proxmox Backup Server."
        ),
        "tags": ["nas", "openmediavault", "zfs", "storage", "smb", "nfs", "192.168.10.3", "backup"]
    },
    {
        "topic": "Apple M1 Compute Node (MacBook-Air.local)",
        "content": (
            "Apple M1 Silicon este nodul gazdă activ (Local Host) pe care rulează daemonul ELO Core. "
            "Oferă accelerare hardware Metal MPS pentru modele locale Ollama / vLLM și rulează sintetizatorul executiv ELO."
        ),
        "tags": ["m1", "apple", "macbook", "host", "metal", "mps", "ollama", "elo"]
    },
    {
        "topic": "OPNsense Firewall & Network VLAN Architecture",
        "content": (
            "OPNsense este routerul și firewall-ul principal pe IP-ul 192.168.10.1:443. "
            "Segmentează rețeaua în VLAN 10 (Management / Servere), VLAN 20 (Servicii & Aplicații), "
            "VLAN 30 (IoT Izolat) și VLAN 40 (Guest). Integrează Suricata IDS/IPS și CrowdSec pentru blocarea automată a atacurilor."
        ),
        "tags": ["opnsense", "firewall", "router", "vlan", "suricata", "crowdsec", "192.168.10.1"]
    },
    {
        "topic": "Home Assistant & Smart Home Domotics",
        "content": (
            "Home Assistant rulează pe IP-ul 192.168.20.10:8123 (VLAN 20). "
            "Controlează luminile Zigbee/Z-Wave, prizele inteligente, senzorii de temperatură și automatizările de securitate ale casei."
        ),
        "tags": ["home assistant", "hass", "domotica", "lumini", "smart home", "192.168.20.10", "8123"]
    },
    {
        "topic": "Authelia SSO & Securitate 2FA",
        "content": (
            "Authelia asigură autentificarea unificată (Single Sign-On) cu 2FA (TOTP/WebAuthn) pentru toate serviciile expuse din homelab pe portul 9091."
        ),
        "tags": ["authelia", "sso", "2fa", "auth", "securitate", "9091"]
    }
]


class HomelabKnowledgeBase:
    """
    Homelab Semantic Knowledge Base & RAG Retrieval Engine.
    """

    def __init__(self):
        self.docs = HOMELAB_KNOWLEDGE_DOCS

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Performs lexical and keyword-weighted retrieval across homelab architecture documents."""
        q_tokens = query.lower().split()
        scored_docs = []

        for doc in self.docs:
            score = 0
            text = (doc["topic"] + " " + doc["content"] + " " + " ".join(doc["tags"])).lower()
            for token in q_tokens:
                if token in text:
                    score += 1
                if any(token == tag.lower() for tag in doc["tags"]):
                    score += 2

            if score > 0:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_k]]
