from __future__ import annotations
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class RoomZone(BaseModel):
    """Defined room or physical zone in the house."""
    id: str = Field(description="Unique room slug: office, living_room, server_room, bedroom")
    name: str = Field(description="Human readable name, e.g. Birou, Living, Camera Server")
    esp32_device_id: str = Field(description="Identifier of the reporting ESP32 node")
    homeassistant_area: str = Field(description="Mapped Home Assistant area ID")
    primary_lights_group: Optional[str] = None
    primary_media_player: Optional[str] = None
    climate_entity: Optional[str] = None


class ESP32PresenceUpdate(BaseModel):
    """Payload received from an ESP32 sensor node via MQTT or HTTP."""
    device_id: str
    room_id: str
    detected: bool = True
    sensor_type: str = Field(default="ble_mmwave", description="ble_beacon, mmwave_radar, pir, ultrasonic")
    rssi: Optional[int] = Field(default=-60, description="BLE RSSI signal strength (dBm)")
    distance_cm: Optional[float] = Field(default=None, description="mmWave radar distance measurement")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RoomActionRequest(BaseModel):
    """Request to route an action contextually based on room presence."""
    action: str = Field(description="Action verb: turn_on_lights, turn_off_lights, play_music, set_temp")
    target_room: Optional[str] = Field(default=None, description="Explicit room or None for auto-presence detection")
    parameters: Dict[str, Any] = Field(default_factory=dict)
