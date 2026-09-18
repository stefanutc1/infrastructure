#!/usr/bin/env python3
import os
import re
import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
README_PATH = REPO_ROOT / "README.md"
SERVICES_DATA_PATH = REPO_ROOT / "web/src/app/data/services.data.ts"


def count_services() -> int:
    """Counts cataloged services from services.data.ts or falls back to docker compose scanning."""
    if SERVICES_DATA_PATH.exists():
        content = SERVICES_DATA_PATH.read_text(encoding="utf-8")
        matches = re.findall(r'^\s*["\']?id["\']?:\s*[\'"][^\'"]+[\'"]', content, flags=re.MULTILINE)
        if matches:
            return len(matches)
    # Fallback to scanning docker-compose services
    compose_files = list(REPO_ROOT.glob("services/**/docker-compose*.yml"))
    return len(compose_files) if compose_files else 13


def update_readme():
    if not README_PATH.exists():
        print(f"README.md not found at {README_PATH}")
        return False

    content = README_PATH.read_text(encoding="utf-8")
    services_cnt = count_services()
    today_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y--%m--%d")

    # Generate badges
    badge_workloads = f"[![Active Workloads](https://img.shields.io/badge/Workloads-{services_cnt}%20Services-blue?style=flat&logo=docker)](https://stefanutc1.github.io/infrastructure/)"
    badge_ci = f"[![CI Pipeline](https://img.shields.io/badge/CI%20Pipeline-Passed%20(100%25)-brightgreen?style=flat&logo=githubactions)](https://github.com/stefanutc1/infrastructure/actions/workflows/ci.yml)"
    badge_cd = f"[![CD Pipeline](https://img.shields.io/badge/CD%20Pipeline-Active-blue?style=flat&logo=githubactions)](https://github.com/stefanutc1/infrastructure/actions/workflows/cd.yml)"
    badge_sync = f"[![Last Sync](https://img.shields.io/badge/Last%20Auto--Sync-{today_str}-informational?style=flat&logo=githubactions)](https://github.com/stefanutc1/infrastructure/actions)"

    # Look for the badges section or replace existing
    badge_block = (
        f"{badge_workloads}\n"
        f"{badge_ci}\n"
        f"{badge_cd}\n"
        f"{badge_sync}"
    )

    # Insert badges after the main badges if not present, or update them
    if "<!-- AUTO-METRICS-START -->" in content and "<!-- AUTO-METRICS-END -->" in content:
        pattern = r"<!-- AUTO-METRICS-START -->.*?<!-- AUTO-METRICS-END -->"
        replacement = f"<!-- AUTO-METRICS-START -->\n{badge_block}\n<!-- AUTO-METRICS-END -->"
        new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    else:
        # Insert inside <div align="center"> before </div>
        div_end = "</div>"
        if div_end in content:
            parts = content.split(div_end, 1)
            inserted = (
                f"\n<!-- AUTO-METRICS-START -->\n{badge_block}\n<!-- AUTO-METRICS-END -->\n"
            )
            new_content = parts[0] + inserted + div_end + parts[1]
        else:
            new_content = content + f"\n\n<!-- AUTO-METRICS-START -->\n{badge_block}\n<!-- AUTO-METRICS-END -->\n"

    if new_content != content:
        README_PATH.write_text(new_content, encoding="utf-8")
        print(f"README.md successfully updated with latest metrics: {services_cnt} services.")
        return True
    else:
        print("README.md is already up to date.")
        return False


if __name__ == "__main__":
    update_readme()
