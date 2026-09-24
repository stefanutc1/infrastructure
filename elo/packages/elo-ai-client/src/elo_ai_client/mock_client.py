from __future__ import annotations
import time
from typing import List, Dict, Any, Optional
from .base import BaseLLMClient, ChatMessage, LLMResponse, ToolCall, Role


class MockLLMClient(BaseLLMClient):
    """Deterministic Mock LLM Client for testing, CI/CD, and offline execution."""

    def __init__(self, predefined_responses: Optional[List[LLMResponse]] = None):
        self.predefined_responses = predefined_responses or []
        self._call_count = 0
        self.is_healthy = True

    async def chat(
        self,
        messages: List[ChatMessage],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        start_time = time.perf_counter()
        self._call_count += 1

        if not self.is_healthy:
            raise ConnectionError("MockLLMClient simulated failure")

        if self.predefined_responses:
            resp = self.predefined_responses.pop(0)
            resp.latency_ms = (time.perf_counter() - start_time) * 1000
            return resp

        # If the last message is a tool output, synthesize a natural, elegant response
        last_msg_obj = messages[-1] if messages else None
        if last_msg_obj and last_msg_obj.role == Role.TOOL:
            clean_content = self._format_tool_content_elegantly(last_msg_obj.name, last_msg_obj.content)
            return LLMResponse(
                content=clean_content,
                tool_calls=[],
                model_used="elo-hybrid-core",
                provider="elo_brain",
                latency_ms=(time.perf_counter() - start_time) * 1000,
            )

        last_msg = (last_msg_obj.content if last_msg_obj else "").strip()
        lower_msg = last_msg.lower()
        
        # 1. Check if user asks for reboot / destructive action (L2 Approval)
        if any(w in lower_msg for w in ["reboot", "restart", "opreste", "kill", "reporneste"]):
            return LLMResponse(
                content=None,
                tool_calls=[
                    ToolCall(
                        id="call_mock_reboot_1",
                        name="proxmox_reboot_vm",
                        arguments={"vm_id": 101, "force": False},
                    )
],
                model_used="elo-hybrid-core",
                provider="elo_brain",
                latency_ms=(time.perf_counter() - start_time) * 1000,
            )
            
        # 2. Check if user asks for specific service query from homelab inventory
        service_keywords = [
            "immich", "nextcloud", "vaultwarden", "pihole", "pi-hole", "nginx", "npm", 
            "grafana", "prometheus", "loki", "uptime", "kuma", "n8n", "gitea", "woodpecker",
            "authelia", "crowdsec", "jellyfin", "radarr", "sonarr", "prowlarr", "bazarr",
            "qbittorrent", "actualbudget", "trilium", "scrutiny", "erp", "opnsense"
]
        matched_service = next((s for s in service_keywords if s in lower_msg), None)
        if matched_service and ("unde" in lower_msg or "where" in lower_msg or "port" in lower_msg or "ce e" in lower_msg or "info" in lower_msg or "cauta" in lower_msg):
            return LLMResponse(
                content=None,
                tool_calls=[
                    ToolCall(
                        id="call_mock_service_query",
                        name="homelab_query_service",
                        arguments={"query": matched_service},
                    )
],
                model_used="elo-hybrid-core",
                provider="elo_brain",
                latency_ms=(time.perf_counter() - start_time) * 1000,
            )

        # 3. Check if user asks for status or resources
        elif any(w in lower_msg for w in ["status", "stare", "resurse", "resources", "cpu", "ram", "server", "noduri", "nodes", "how are you doing with the server"]):
            return LLMResponse(
                content=None,
                tool_calls=[
                    ToolCall(
                        id="call_mock_status_1",
                        name="proxmox_get_cluster_status",
                        arguments={"node": "pve-node-1"},
                    )
],
                model_used="elo-hybrid-core",
                provider="elo_brain",
                latency_ms=(time.perf_counter() - start_time) * 1000,
            )
            
        # 4. Check if user asks for Monte Carlo / Finance
        elif any(w in lower_msg for w in ["monte carlo", "simulare", "simulation", "risc", "risk", "finance", "valoare"]):
            return LLMResponse(
                content=None,
                tool_calls=[
                    ToolCall(
                        id="call_mock_mc_1",
                        name="academic_monte_carlo_simulation",
                        arguments={"iterations": 5000, "scenario": "volatility_high"},
                    )
],
                model_used="elo-hybrid-core",
                provider="elo_brain",
                latency_ms=(time.perf_counter() - start_time) * 1000,
            )

        # 5. Conversational / Greetings / Chat (Bilingual Romanian & English)
        is_english = any(w in lower_msg for w in ["what's up", "how are you", "who are you", "hello", "hi", "hey", "bro", "broski", "what can you do", "help"])
        
        if "ce faci" in lower_msg or "cf" in lower_msg or "broski" in lower_msg:
            resp_text = (
                "Salut broski! Sunt 100% operațional. Monitorizez în timp real nodurile din Homelab (Proxmox, OPNsense, Home Assistant, Immich, Nextcloud, Grafana), "
                "baza de date și fluxurile de lucru. Toate sistemele rulează în parametri optimi. "
                "Cu ce te pot asista astăzi?"
            )
        elif is_english:
            resp_text = (
                "Hey there! ELO Operating Layer is fully operational. "
                "I'm continuously monitoring your Homelab cluster (Proxmox, OPNsense, Home Assistant, Immich, Nextcloud) and ready to orchestrate tools, run Monte Carlo simulations, or manage workloads. "
                "How can I assist you right now?"
            )
        elif any(w in lower_msg for w in ["salut", "buna", "buna ziua", "servus", "neata", "alo"]):
            resp_text = "Salut! Sunt ELO, panoul de control al infrastructurii. Toate serviciile din homelab sunt monitorizate. Cu ce te pot ajuta?"
        elif any(w in lower_msg for w in ["cine esti", "who are you", "ce stii sa faci", "capabilities"]):
            resp_text = (
                "Sunt ELO, un orchestrator pentru homelab. "
                "Am acces la inventarul infrastructurii (Proxmox, OPNsense, Home Assistant, Immich, Nextcloud, Grafana), "
                "telemetria nodurilor, securitatea rețelei și automatizări."
            )
        else:
            resp_text = (
                f"Am preluat cererea: '{last_msg}'. "
                f"Pot interoga serviciile din homelab, verifica starea nodurilor sau executa acțiuni."
            )

        return LLMResponse(
            content=resp_text,
            tool_calls=[],
            model_used="elo-hybrid-core",
            provider="elo_brain",
            latency_ms=(time.perf_counter() - start_time) * 1000,
        )

    def _format_tool_content_elegantly(self, tool_name: Optional[str], raw_content: str) -> str:
        """Parses raw JSON tool output and formats it into clean, executive markdown."""
        import json
        try:
            data = json.loads(raw_content) if isinstance(raw_content, str) else raw_content
        except Exception:
            return raw_content

        if not isinstance(data, dict):
            return str(data)

        # 1. Proxmox / Cluster Status Formatter
        if "cluster_nodes" in data or "host_cpu_pct" in data or "cpu_usage_pct" in data:
            hostname = data.get("hostname", "Homelab Host")
            uptime = data.get("uptime", "N/A")
            cpu = data.get("host_cpu_pct", data.get("cpu_usage_pct", 0))
            ram_used = data.get("host_ram_used_gb", data.get("ram_usage_gb", 0))
            ram_total = data.get("host_ram_total_gb", data.get("ram_total_gb", 0))
            ram_pct = round((ram_used / ram_total * 100), 1) if ram_total else 0
            
            nodes = data.get("cluster_nodes", [])
            nodes_md = ""
            for n in nodes:
                is_on = n.get("is_reachable") or n.get("status") == "ONLINE"
                st_badge = f" **ONLINE** (`{n.get('latency_ms')}ms`)" if is_on else " **OFFLINE / Inaccesibil**"
                nodes_md += f"  • **{n.get('name')}** (`{n.get('ip')}`): {st_badge}\n"

            vms = data.get("active_vms", [])
            vms_md = ""
            for vm in vms:
                vms_md += f"  • `{vm.get('vmid')}` — **{vm.get('name')}** (`{vm.get('ip')}`)  *{vm.get('status')}*\n"

            return (
                f"### Raport Status Homelab & Telemetrie\n\n"
                f" **Nod Gazdă (`{hostname}`)**:\n"
                f"• **Stare**:  `ONLINE` | **Uptime**: `{uptime}`\n"
                f"• **Încărcare CPU**: `{cpu}%`\n"
                f"• **Memorie RAM**: `{ram_used} GB` / `{ram_total} GB` (`{ram_pct}%` utilizat)\n\n"
                f" **Stare Noduri Cluster (Sondare Live)**:\n{nodes_md}\n"
                f" **Workload-uri & Servicii Active**:\n{vms_md}"
            )

        # 2. Homelab Query Service Formatter
        if "service" in data and isinstance(data["service"], dict):
            s = data["service"]
            return (
                f"### Informații Serviciu: {s.get('name', 'N/A')}\n\n"
                f"• **Categorie**: `{s.get('category', '').upper()}`\n"
                f"• **Locație & Port**: `{s.get('domain') or s.get('ip')}:{s.get('port')}`\n"
                f"• **Container**: `{s.get('container', 'N/A')}` (LXC `{s.get('lxc_vmid', 'N/A')}`)\n"
                f"• **Stare**:  `ONLINE`\n"
                f"• **Descriere**: {s.get('description', '')}\n"
                f"• **Tag-uri**: `{', '.join(s.get('tags', []))}`"
            )

        # 3. Academic Monte Carlo Formatter
        if "scenario" in data and ("mean_return" in data or "expected_return_pct" in data or "var_95" in data):
            return (
                f"### Raport Simulare Financiară Monte Carlo\n\n"
                f"• **Scenariu**: `{data.get('scenario')}`\n"
                f"• **Iterații Rulate**: `{data.get('iterations', 1000):,}`\n"
                f"• **Randament Mediu Estimat**: `+{data.get('mean_return', 12.4)}%`\n"
                f"• **Value at Risk (VaR 95%)**: `-{abs(data.get('var_95', 5.8))}%`\n"
                f"• **Evaluare Risc**:  `STABIL / ÎN PARAMETRI OPTIMI`"
            )

        # 4. Phone / SMS Incident Alert Formatter
        if "dispatched_channels" in data or "incident_title" in data:
            channels = data.get("dispatched_channels", {})
            return (
                f"### Alertă Transmisă pe Telefon & Canale Mobile\n\n"
                f"• **Titlu Incident**: `{data.get('incident_title', 'Homelab Incident')}`\n"
                f"• **Nivel Severitate**:  `{data.get('severity', 'HIGH').upper()}`\n"
                f"• **Canale Dispecerizate**:\n"
                f"  -  **SMS Telefon**: `{channels.get('sms', {}).get('status', 'SENT')}` ({channels.get('sms', {}).get('target', 'Administrator')})\n"
                f"  -  **Mobile Push (NTFY)**: `{channels.get('push', {}).get('status', 'SUCCESS')}`\n"
                f"  -  **Telegram Bot**: `{channels.get('telegram', {}).get('status', 'CONFIGURED')}`\n\n"
                f" *Notificarea a fost dispecerizată instant către telefonul tău.*"
            )

        # 5. Home Assistant Smart Home Formatter
        if "entities" in data or "domain" in data and "service" in data:
            if "entities" in data:
                entities = data.get("entities", [])
                ent_lines = ""
                for e in entities[:6]:
                    ent_lines += f"  • `{e.get('entity_id')}`: **{e.get('state')}** ({e.get('attributes', {}).get('friendly_name', 'N/A')})\n"
                return (
                    f"### Stare Dispozitive Smart Home (Home Assistant)\n\n"
                    f"• **Dispozitive Descoperite**: `{len(entities)}`\n"
                    f"{ent_lines}\n"
                    f" *Integrare activă pe `192.168.20.10:8123`.*"
                )
            else:
                return (
                    f"### Comandă Smart Home Executată\n\n"
                    f"• **Dispozitiv**: `{data.get('entity_id')}`\n"
                    f"• **Acțiune**: `{data.get('domain')}.{data.get('service')}`\n"
                    f"• **Stare**:  `SUCCES`"
                )

        # 6. OPNsense Firewall Status Formatter
        if "firewall_rule" in data or "gateway" in data or "target_ip" in data:
            if "target_ip" in data:
                return (
                    f"### OPNsense Cyber Shield — IP Blocat\n\n"
                    f"• **IP Blocat**: ` {data.get('target_ip')}`\n"
                    f"• **Motiv**: `{data.get('description')}`\n"
                    f"• **Alias Firewall**: `{data.get('firewall_rule')}`\n"
                    f" *Regula a fost activată instant pe OPNsense.*"
                )
            return (
                f"### Raport Firewall OPNsense & Gateway\n\n"
                f"• **Stare Firewall**:  `ONLINE / ACTIV`\n"
                f"• **Protecție**: `Suricata IDS/IPS & CrowdSec Active`\n"
                f"• **Gateway WAN**: `192.168.10.1` (Latenta: `<1ms`)"
            )

        # 7. Knowledge Base RAG Formatter
        if "results" in data and "query" in data:
            results = data.get("results", [])
            docs_md = ""
            for r in results:
                docs_md += f"#### {r.get('topic')}\n{r.get('content')}\n\n"
            return (
                f"### Documentație Găsită pentru: \"{data.get('query')}\"\n\n"
                f"{docs_md}"
            )

        # Fallback to key-value list
        lines = ["### Rezultat Execuție:"]
        for k, v in data.items():
            lines.append(f"• **{k.replace('_', ' ').title()}**: `{v}`")
        return "\n".join(lines)

    async def health_check(self) -> bool:
        return self.is_healthy
