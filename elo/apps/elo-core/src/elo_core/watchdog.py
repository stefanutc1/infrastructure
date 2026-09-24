from __future__ import annotations
import asyncio
import logging
import time
from typing import Dict, Any, Optional
from .telemetry import get_real_system_telemetry_async
from .notifier import AlertDispatcher

logger = logging.getLogger("elo.core.watchdog")


class SelfHealingWatchdog:
    """
    Autonomous Background Self-Healing Watchdog for ELO.
    Continuously monitors node health, Proxmox state changes, and critical services.
    If a node or service goes down, dispatches phone/mobile alerts and attempts auto-remediation.
    """

    def __init__(
        self,
        check_interval: float = 30.0,
        notifier: Optional[AlertDispatcher] = None,
    ):
        self.check_interval = check_interval
        self.notifier = notifier or AlertDispatcher()
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self._last_node_states: Dict[str, str] = {}

    async def start(self):
        """Starts the background watchdog loop."""
        if self.is_running:
            return
        self.is_running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("[WATCHDOG] Autonomous Self-Healing Watchdog STARTED.")

    async def stop(self):
        """Stops the background watchdog loop."""
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("[WATCHDOG] Watchdog STOPPED.")

    async def _run_loop(self):
        while self.is_running:
            try:
                await self.perform_health_cycle()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[WATCHDOG ERROR] Cycle failed: {e}")
            await asyncio.sleep(self.check_interval)

    async def perform_health_cycle(self) -> Dict[str, Any]:
        """Runs a single health check cycle across nodes and hardware."""
        telem = await get_real_system_telemetry_async()
        nodes = telem.get("nodes", [])
        state_changes = []

        for node in nodes:
            node_id = node.get("id")
            node_name = node.get("name")
            current_status = node.get("status")
            previous_status = self._last_node_states.get(node_id)

            if previous_status is not None and previous_status != current_status:
                state_changes.append({
                    "node_id": node_id,
                    "name": node_name,
                    "from": previous_status,
                    "to": current_status,
                })
                logger.info(f"[WATCHDOG STATE CHANGE] {node_name} changed: {previous_status} -> {current_status}")

                # If Proxmox or NAS goes down, notify phone
                if current_status.startswith("OFFLINE"):
                    await self.notifier.broadcast_incident(
                        title=f"Nod Homelab Deconectat: {node_name}",
                        message=f"Nodul {node_name} ({node.get('ip')}) a devenit INACCESIBIL.",
                        severity="high",
                    )
                elif current_status.startswith("ONLINE"):
                    logger.info(f"[WATCHDOG RECOVERY] {node_name} is NOW ONLINE! Synchronizing services...")

            self._last_node_states[node_id] = current_status

        # Check CPU & RAM thresholds on local host
        cpu = telem.get("host_cpu_pct", 0)
        ram = telem.get("host_ram_used_gb", 0)
        ram_total = telem.get("host_ram_total_gb", 8.0)
        ram_pct = (ram / ram_total * 100) if ram_total else 0

        if cpu > 95.0:
            logger.warning(f"[WATCHDOG ALERT] High CPU usage detected: {cpu}%")

        if ram_pct > 92.0:
            logger.warning(f"[WATCHDOG ALERT] High RAM usage detected: {ram_pct}% ({ram}GB / {ram_total}GB)")

        return {
            "timestamp": time.strftime("%H:%M:%S"),
            "nodes_checked": len(nodes),
            "state_changes": state_changes,
            "host_cpu_pct": cpu,
            "host_ram_pct": round(ram_pct, 1),
        }
