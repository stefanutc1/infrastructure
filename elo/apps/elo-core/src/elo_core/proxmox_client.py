from __future__ import annotations
import logging
import httpx
from typing import Dict, Any, List, Optional

logger = logging.getLogger("elo.core.proxmox")


class ProxmoxClient:
    """
    Live Proxmox VE REST API Client (PVE 8.x).
    Communicates securely with https://<host>:8006/api2/json.
    Supports API Token authentication (PVEAPIToken=USER@REALM!TOKENID=UUID)
    or Username/Password/Ticket authentication.
    """

    def __init__(
        self,
        host: str = "192.168.1.132",
        port: int = 8006,
        api_token_id: Optional[str] = None,
        api_token_secret: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        verify_ssl: bool = False,
        timeout: float = 5.0,
    ):
        self.host = host.strip() if host else "192.168.1.132"
        self.port = port
        self.base_url = f"https://{self.host}:{self.port}/api2/json"
        self.api_token_id = api_token_id
        self.api_token_secret = api_token_secret
        self.user = user
        self.password = password
        self.verify_ssl = verify_ssl
        self.timeout = timeout
        self._ticket: Optional[str] = None
        self._csrf_token: Optional[str] = None

    def _get_headers(self) -> Dict[str, str]:
        headers = {}
        if self.api_token_id and self.api_token_secret:
            headers["Authorization"] = f"PVEAPIToken={self.api_token_id}={self.api_token_secret}"
        elif self._ticket:
            headers["Cookie"] = f"PVEAuthCookie={self._ticket}"
            if self._csrf_token:
                headers["CSRFPreventionToken"] = self._csrf_token
        return headers

    async def check_node_reachable(self) -> bool:
        """Quick check if Proxmox port is listening."""
        import asyncio
        try:
            conn = asyncio.open_connection(self.host, self.port)
            reader, writer = await asyncio.wait_for(conn, timeout=0.4)
            writer.close()
            try:
                await writer.wait_closed()
            except Exception:
                pass
            return True
        except Exception:
            return False

    async def get_cluster_status(self) -> Dict[str, Any]:
        """Fetches live cluster status or falls back gracefully if node is powered off."""
        is_reachable = await self.check_node_reachable()
        if not is_reachable:
            return {
                "status": "OFFLINE",
                "host": self.host,
                "port": self.port,
                "reachable": False,
                "message": f"Nodul Proxmox VE ({self.host}) este oprit sau inaccesibil pe rețea.",
                "vms": [],
                "nodes": [],
            }

        headers = self._get_headers()
        try:
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=self.timeout) as client:
                resp = await client.get(f"{self.base_url}/cluster/resources", headers=headers)
                if resp.status_code == 200:
                    data = resp.json().get("data", [])
                    vms = [item for item in data if item.get("type") in ["qemu", "lxc"]]
                    nodes = [item for item in data if item.get("type") == "node"]
                    return {
                        "status": "ONLINE",
                        "host": self.host,
                        "reachable": True,
                        "vms_count": len(vms),
                        "nodes_count": len(nodes),
                        "vms": vms,
                        "nodes": nodes,
                        "raw_resources": data,
                    }
                else:
                    return {
                        "status": "ONLINE (AUTH_REQUIRED)",
                        "host": self.host,
                        "reachable": True,
                        "http_status": resp.status_code,
                        "message": "Nodul Proxmox este online și răspunde pe portul 8006. Configurează API Token pentru citire completă a resurselor.",
                    }
        except Exception as e:
            return {
                "status": "ONLINE",
                "host": self.host,
                "reachable": True,
                "error": str(e),
                "message": f"Nodul este pornit, dar apelul API a returnat: {e}",
            }

    async def start_vm(self, node: str, vm_id: int, vm_type: str = "qemu") -> Dict[str, Any]:
        """Starts a VM or LXC container on Proxmox."""
        endpoint = "qemu" if vm_type == "qemu" else "lxc"
        url = f"{self.base_url}/nodes/{node}/{endpoint}/{vm_id}/status/start"
        headers = self._get_headers()
        try:
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=self.timeout) as client:
                resp = await client.post(url, headers=headers)
                if resp.status_code in [200, 201]:
                    return {"status": "SUCCESS", "action": "START", "node": node, "vm_id": vm_id, "data": resp.json()}
                return {"status": "FAILED", "http_status": resp.status_code, "error": resp.text}
        except Exception as e:
            return {"status": "ERROR", "error": str(e)}

    async def stop_vm(self, node: str, vm_id: int, vm_type: str = "qemu") -> Dict[str, Any]:
        """Stops a VM or LXC container on Proxmox."""
        endpoint = "qemu" if vm_type == "qemu" else "lxc"
        url = f"{self.base_url}/nodes/{node}/{endpoint}/{vm_id}/status/stop"
        headers = self._get_headers()
        try:
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=self.timeout) as client:
                resp = await client.post(url, headers=headers)
                if resp.status_code in [200, 201]:
                    return {"status": "SUCCESS", "action": "STOP", "node": node, "vm_id": vm_id, "data": resp.json()}
                return {"status": "FAILED", "http_status": resp.status_code, "error": resp.text}
        except Exception as e:
            return {"status": "ERROR", "error": str(e)}

    async def create_snapshot(self, node: str, vm_id: int, snap_name: str, description: str = "") -> Dict[str, Any]:
        """Creates a snapshot for a VM or LXC container before maintenance."""
        url = f"{self.base_url}/nodes/{node}/qemu/{vm_id}/snapshot"
        headers = self._get_headers()
        try:
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=self.timeout) as client:
                resp = await client.post(url, headers=headers, json={"snapname": snap_name, "description": description})
                if resp.status_code in [200, 201]:
                    return {"status": "SUCCESS", "action": "SNAPSHOT", "snap_name": snap_name, "data": resp.json()}
                return {"status": "FAILED", "http_status": resp.status_code, "error": resp.text}
        except Exception as e:
            return {"status": "ERROR", "error": str(e)}
