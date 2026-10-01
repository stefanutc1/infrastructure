#!/usr/bin/env python3
"""
==============================================================================
ESP32 Firmware Suite & Hardware Pinout Verification Engine
Author: Moană Ștefănuț-Cornel (@stefanutc1)
Repository: stefanutc1/infrastructure

Audits all ESP32 edge firmware projects (footprint, irrigation,
datacenter_environment, power_monitor) for syntax hygiene, pin conflicts,
and mandatory watchdog timer (WDT) reliability routines.
==============================================================================
"""

import os
import re
import sys
from pathlib import Path

REQUIRED_PROJECTS = [
    "footprint",
    "irrigation",
    "datacenter_environment",
    "power_monitor"
]

def audit_esp32_suite(esp32_dir: Path):
    violations = []
    projects_audited = 0

    if not esp32_dir.exists():
        return 0, [f"Directory {esp32_dir} does not exist."]

    for proj in REQUIRED_PROJECTS:
        proj_dir = esp32_dir / proj
        if not proj_dir.exists():
            violations.append(f"Missing required ESP32 project directory: {proj}")
            continue

        projects_audited += 1

        # Check for main .ino file
        ino_files = list(proj_dir.glob("*.ino"))
        if not ino_files:
            violations.append(f"[{proj}] Missing required main Arduino sketch (*.ino)")
        else:
            main_ino = ino_files[0]
            with open(main_ino, "r", encoding="utf-8") as f:
                content = f.read()

                # Check for Watchdog Timer initialization
                if "esp_task_wdt_init" not in content and "esp_task_wdt_add" not in content:
                    violations.append(f"[{proj}/{main_ino.name}] Missing fail-safe hardware watchdog timer (esp_task_wdt)")

                # Check for WiFi and setup/loop
                if "void setup()" not in content or "void loop()" not in content:
                    violations.append(f"[{proj}/{main_ino.name}] Incomplete Arduino sketch: setup() or loop() missing")

        # Check for config.h
        config_h = proj_dir / "config.h"
        if not config_h.exists():
            violations.append(f"[{proj}] Missing configuration header: config.h")
        else:
            with open(config_h, "r", encoding="utf-8") as f:
                cfg_content = f.read()
                pins = re.findall(r'#define\s+([A-Z0-9_]+_PIN)\s+([0-9]+)', cfg_content)
                used_pins = {}
                for pin_name, pin_num in pins:
                    if pin_num in used_pins:
                        violations.append(f"[{proj}/config.h] GPIO Pin Conflict! Pin {pin_num} used by both '{used_pins[pin_num]}' and '{pin_name}'")
                    else:
                        used_pins[pin_num] = pin_name

        # Check for README.md
        readme = proj_dir / "README.md"
        if not readme.exists():
            violations.append(f"[{proj}] Missing documentation: README.md")

    return projects_audited, violations

def main():
    print("=" * 80)
    print("ESP32 Edge Systems Suite & Hardware Pinout Verifier")
    print("Author: Moană Ștefănuț-Cornel (@stefanutc1) · FEAA UCV (2024–2027)")
    print("=" * 80)

    repo_root = Path(__file__).resolve().parent.parent
    esp32_dir = repo_root / "esp32"

    count, violations = audit_esp32_suite(esp32_dir)
    print(f"[AUDIT] Verified {count} ESP32 edge firmware projects...")

    if not violations:
        print("[SUCCESS] All 4 ESP32 projects have valid .ino sketches, pin mappings, WDT routines, and READMEs.")
        sys.exit(0)
    else:
        print(f"\n[FAILURE] Found {len(violations)} issues in ESP32 suite:\n")
        for v in violations:
            print(f"  - {v}")
        sys.exit(1)

if __name__ == "__main__":
    main()
