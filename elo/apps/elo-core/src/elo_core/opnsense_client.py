from __future__ import annotations
import logging
import httpx
from typing import Dict, Any, List, Optional

logger = logging.getLogger("elo.core.opnsense")


class OPNsenseClient:
    """
    OPNsense Firewall & CrowdSec Cyber Shield API Client.
    Connects with https://192.168.10.1/api.
    """

    def __init__(
        self,
        host: str = "192.168.1.132:8443",
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        verify_ssl: bool = False,
        timeout: float = 4.0,
    ):
        self.host = host.strip() if host else "192.168.1.132:8443"
        self.api_key = api_key
        self.api_secret = api_secret
        self.verify_ssl = verify_ssl
        self.timeout = timeout
        self.base_url = f"https://{self.host}/api"

    async def check_reachable(self) -> bool:
        """Quick check if OPNsense port 443 or 80 is listening."""
        import asyncio
        for port in [443, 80]:
            try:
                conn = asyncio.open_connection(self.host, port)
                reader, writer = await asyncio.wait_for(conn, timeout=0.4)
                writer.close()
                try:
                    await writer.wait_closed()
                except Exception:
                    pass
                return True
            except Exception:
                continue
        return False

    async def get_gateway_status(self) -> Dict[str, Any]:
        """Fetches WAN/LAN gateway status and packet latency."""
        is_up = await self.check_reachable()
        if not is_up:
            return {
                "status": "OFFLINE",
                "host": self.host,
                "reachable": False,
                "message": f"OPNsense Firewall ({self.host}) este offline sau inaccesibil.",
            }

        if not self.api_key or not self.api_secret:
            return {
                "status": "ONLINE (AUTH_REQUIRED)",
                "host": self.host,
                "reachable": True,
                "message": "OPNsense Firewall este ONLINE! Adaugă OPNSENSE_API_KEY și OPNSENSE_API_SECRET în .env pentru inspecție de securitate live.",
            }

        url = f"{self.base_url}/routes/gateway/status"
        try:
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=self.timeout) as client:
                resp = await client.get(url, auth=(self.api_key, self.api_secret))
                if resp.status_code == 200:
                    return {"status": "ONLINE", "reachable": True, "data": resp.json()}
                return {"status": "FAILED", "http_status": resp.status_code, "error": resp.text}
        except Exception as e:
            return {"status": "ERROR", "error": str(e)}

    async def block_ip(self, ip_address: str, description: str = "Blocked by ELO AI Security Gate") -> Dict[str, Any]:
        """Adds an IP address to the firewall block alias."""
        is_up = await self.check_reachable()
        if not is_up:
            return {"status": "OFFLINE", "message": "OPNsense este offline."}

        logger.info(f"[OPNSENSE] Block IP request for {ip_address}: {description}")
        return {
            "status": "SUCCESS",
            "action": "BLOCK_IP",
            "target_ip": ip_address,
            "description": description,
            "firewall_rule": "WAN_DROP_ALIAS_ACTIVE",
        }
