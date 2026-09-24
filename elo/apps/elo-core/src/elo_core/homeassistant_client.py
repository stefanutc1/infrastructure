from __future__ import annotations
import logging
import httpx
from typing import Dict, Any, List, Optional

logger = logging.getLogger("elo.core.homeassistant")


class HomeAssistantClient:
    """
    Home Assistant REST & WebSocket API Client.
    Controls smart home devices, lights, switches, climates, and reads sensors.
    """

    def __init__(
        self,
        base_url: str = "http://192.168.1.10:8123",
        access_token: Optional[str] = None,
        timeout: float = 4.0,
    ):
        self.base_url = (base_url or "http://192.168.1.10:8123").rstrip("/")
        self.access_token = access_token
        self.timeout = timeout

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers

    async def check_reachable(self) -> bool:
        """Quick check if Home Assistant port 8123 is listening."""
        import asyncio
        from urllib.parse import urlparse
        parsed = urlparse(self.base_url)
        host = parsed.hostname or "192.168.20.10"
        port = parsed.port or 8123
        try:
            conn = asyncio.open_connection(host, port)
            reader, writer = await asyncio.wait_for(conn, timeout=0.4)
            writer.close()
            try:
                await writer.wait_closed()
            except Exception:
                pass
            return True
        except Exception:
            return False

    async def get_states(self, entity_filter: Optional[str] = None) -> Dict[str, Any]:
        """Fetches all entity states from Home Assistant or filters by domain (light, switch, sensor)."""
        is_up = await self.check_reachable()
        if not is_up:
            return {
                "status": "OFFLINE",
                "base_url": self.base_url,
                "reachable": False,
                "message": f"Home Assistant ({self.base_url}) este momentan inaccesibil pe rețea.",
                "entities": [],
            }

        if not self.access_token:
            return {
                "status": "ONLINE (AUTH_REQUIRED)",
                "base_url": self.base_url,
                "reachable": True,
                "message": "Home Assistant este ONLINE! Adaugă HASS_TOKEN în .env pentru control complet.",
                "entities": [],
            }

        url = f"{self.base_url}/api/states"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, headers=self._get_headers())
                if resp.status_code == 200:
                    states = resp.json()
                    if entity_filter:
                        states = [s for s in states if s.get("entity_id", "").startswith(entity_filter)]
                    return {
                        "status": "SUCCESS",
                        "reachable": True,
                        "count": len(states),
                        "entities": states,
                    }
                return {"status": "FAILED", "http_status": resp.status_code, "error": resp.text}
        except Exception as e:
            return {"status": "ERROR", "error": str(e)}

    async def call_service(
        self,
        domain: str,
        service: str,
        entity_id: Optional[str] = None,
        service_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Calls a Home Assistant service (e.g. light/turn_on, switch/toggle, climate/set_temperature)."""
        is_up = await self.check_reachable()
        if not is_up:
            return {"status": "OFFLINE", "message": "Home Assistant este offline."}

        payload = service_data or {}
        if entity_id:
            payload["entity_id"] = entity_id

        url = f"{self.base_url}/api/services/{domain}/{service}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(url, headers=self._get_headers(), json=payload)
                if resp.status_code == 200:
                    return {
                        "status": "SUCCESS",
                        "domain": domain,
                        "service": service,
                        "entity_id": entity_id,
                        "result": resp.json(),
                    }
                return {"status": "FAILED", "http_status": resp.status_code, "error": resp.text}
        except Exception as e:
            return {"status": "ERROR", "error": str(e)}
