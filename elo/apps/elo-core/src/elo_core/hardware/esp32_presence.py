from __future__ import annotations
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from elo_contracts.presence import RoomZone, ESP32PresenceUpdate, RoomActionRequest

logger = logging.getLogger("elo.core.hardware.esp32")


DEFAULT_ROOM_ZONES: List[RoomZone] = [
    RoomZone(
        id="office",
        name="Birou",
        esp32_device_id="esp32-node-office-01",
        homeassistant_area="office",
        primary_lights_group="light.office_lights",
        primary_media_player="media_player.office_speaker",
        climate_entity="climate.office_ac",
    ),
    RoomZone(
        id="living_room",
        name="Living",
        esp32_device_id="esp32-node-living-02",
        homeassistant_area="living_room",
        primary_lights_group="light.living_room_ceiling",
        primary_media_player="media_player.tv_soundbar",
        climate_entity="climate.living_thermostat",
    ),
    RoomZone(
        id="server_room",
        name="Camera Servere (Lab)",
        esp32_device_id="esp32-node-lab-03",
        homeassistant_area="server_room",
        primary_lights_group="light.lab_leds",
        climate_entity="climate.rack_cooling",
    ),
    RoomZone(
        id="bedroom",
        name="Dormitor",
        esp32_device_id="esp32-node-bedroom-04",
        homeassistant_area="bedroom",
        primary_lights_group="light.bedroom_dimmer",
        primary_media_player="media_player.bedroom_speaker",
    ),
]


class ESP32PresenceManager:
    """
    Room-Awareness and Physical Presence Tracker.
    Aggregates BLE/mmWave telemetry from ESP32 nodes and routes actions contextually.
    """

    def __init__(self, zones: Optional[List[RoomZone]] = None):
        self.zones: Dict[str, RoomZone] = {z.id: z for z in (zones or DEFAULT_ROOM_ZONES)}
        self.current_user_room: str = "office"
        self.last_presence_events: Dict[str, ESP32PresenceUpdate] = {}

    def process_presence_update(self, update: ESP32PresenceUpdate) -> Dict[str, Any]:
        """Processes an incoming telemetry frame from an ESP32 sensor node."""
        self.last_presence_events[update.room_id] = update

        if update.detected:
            self.current_user_room = update.room_id
            logger.info(f"[PRESENCE] User detected in {update.room_id} (Sensor: {update.sensor_type}, RSSI: {update.rssi}dBm)")

        return {
            "status": "PROCESSED",
            "current_room": self.current_user_room,
            "room_name": self.zones.get(self.current_user_room, RoomZone(id="unknown", name="Unknown", esp32_device_id="", homeassistant_area="")).name,
            "timestamp": update.timestamp.isoformat(),
        }

    def get_current_presence_status(self) -> Dict[str, Any]:
        """Returns the full physical presence status across all tracked rooms."""
        active_zone = self.zones.get(self.current_user_room)
        return {
            "current_room_id": self.current_user_room,
            "current_room_name": active_zone.name if active_zone else "Unknown",
            "active_area_id": active_zone.homeassistant_area if active_zone else "default",
            "zones_monitored": len(self.zones),
            "zones": [z.model_dump() for z in self.zones.values()],
            "last_events": {k: v.model_dump() for k, v in self.last_presence_events.items()},
        }

    def route_contextual_action(self, request: RoomActionRequest) -> Dict[str, Any]:
        """
        Resolves generic commands like 'turn on lights' to the specific Home Assistant entity for the current room.
        """
        target_room_id = request.target_room or self.current_user_room
        zone = self.zones.get(target_room_id)

        if not zone:
            return {
                "success": False,
                "error": f"Room '{target_room_id}' is not mapped in room awareness zones.",
            }

        target_entity = None
        action_verb = request.action.lower()

        if "light" in action_verb:
            target_entity = zone.primary_lights_group
            service = "turn_on" if "on" in action_verb else "turn_off"
        elif "music" in action_verb or "audio" in action_verb or "sound" in action_verb:
            target_entity = zone.primary_media_player
            service = "media_play"
        elif "temp" in action_verb or "clima" in action_verb:
            target_entity = zone.climate_entity
            service = "set_temperature"
        else:
            target_entity = zone.primary_lights_group
            service = "toggle"

        return {
            "success": True,
            "room_id": zone.id,
            "room_name": zone.name,
            "homeassistant_area": zone.homeassistant_area,
            "target_entity": target_entity,
            "service_call": service,
            "dispatched_to_ha": True,
            "message": f"Comanda '{request.action}' a fost direcționată contextual către '{zone.name}' (entitate: {target_entity}).",
        }
