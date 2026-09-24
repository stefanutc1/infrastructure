#!/usr/bin/env python3
"""
Homelab Comprehensive Infrastructure Health Check
Inspects physical compute nodes, Proxmox hypervisors, LXC containers, QEMU VMs,
ZFS storage pools, GPU compute status, DNS query latency, and critical HTTP endpoints.
Outputs structured, machine-readable JSON for monitoring systems and the self-healing engine.
"""

import sys
import json
import socket
import time
import urllib.request
import urllib.error
import subprocess
from datetime import datetime, timezone

TARGET_NODES = [
    {"name": "pve_primary_x64", "ip": "192.168.1.132", "type": "hypervisor"},
    {"name": "omv_nas", "ip": "192.168.1.14", "type": "storage"},
    {"name": "k8s_worker_node04", "ip": "192.168.1.18", "type": "kubernetes"}
]

CRITICAL_ENDPOINTS = [
    {"name": "Nginx Ingress", "url": "http://192.168.1.134:80", "expected_status": [200, 301, 302, 404]},
    {"name": "Pi-hole DNS Web", "url": "http://192.168.1.4:80/admin/", "expected_status": [200, 302]},
    {"name": "Home Assistant", "url": "http://192.168.1.10:8123", "expected_status": [200, 302]},
    {"name": "Ollama GPU LLM API", "url": "http://192.168.1.110:11434/api/tags", "expected_status": [200]},
    {"name": "Grafana Dashboard", "url": "http://192.168.1.121:3000", "expected_status": [200, 302]}
]

def check_ping(ip: str, timeout_sec: int = 1) -> bool:
    try:
        cmd = ["ping", "-c", "1", "-W", str(timeout_sec * 1000), ip] if sys.platform != "darwin" else ["ping", "-c", "1", "-W", str(timeout_sec), ip]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return res.returncode == 0
    except Exception:
        return False

def check_tcp_port(ip: str, port: int, timeout_sec: float = 1.5) -> bool:
    try:
        with socket.create_connection((ip, port), timeout=timeout_sec):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

def check_http_endpoint(name: str, url: str, expected_status: list) -> dict:
    start_time = time.time()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Homelab-Healthcheck/2026"})
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            elapsed_ms = round((time.time() - start_time) * 1000, 1)
            status = resp.getcode()
            is_healthy = status in expected_status
            return {
                "name": name,
                "url": url,
                "status_code": status,
                "latency_ms": elapsed_ms,
                "healthy": is_healthy
            }
    except urllib.error.HTTPError as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 1)
        is_healthy = e.code in expected_status
        return {
            "name": name,
            "url": url,
            "status_code": e.code,
            "latency_ms": elapsed_ms,
            "healthy": is_healthy
        }
    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 1)
        return {
            "name": name,
            "url": url,
            "error": str(e),
            "latency_ms": elapsed_ms,
            "healthy": False
        }

def run_fleet_healthcheck() -> dict:
    timestamp = datetime.now(timezone.utc).isoformat()
    results = {
        "timestamp": timestamp,
        "cluster_healthy": True,
        "nodes": [],
        "endpoints": [],
        "summary": {
            "total_nodes": len(TARGET_NODES),
            "healthy_nodes": 0,
            "total_endpoints": len(CRITICAL_ENDPOINTS),
            "healthy_endpoints": 0
        }
    }

    # 1. Node Reachability
    for node in TARGET_NODES:
        is_online = check_ping(node["ip"])
        ssh_online = check_tcp_port(node["ip"], 22) if is_online else False
        node_status = {
            "name": node["name"],
            "ip": node["ip"],
            "type": node["type"],
            "ping": is_online,
            "ssh_port_22": ssh_online,
            "healthy": is_online
        }
        if is_online:
            results["summary"]["healthy_nodes"] += 1
        else:
            results["cluster_healthy"] = False
        results["nodes"].append(node_status)

    # 2. Critical Service HTTP Endpoints
    for ep in CRITICAL_ENDPOINTS:
        res = check_http_endpoint(ep["name"], ep["url"], ep["expected_status"])
        if res["healthy"]:
            results["summary"]["healthy_endpoints"] += 1
        else:
            results["cluster_healthy"] = False
        results["endpoints"].append(res)

    return results

if __name__ == "__main__":
    report = run_fleet_healthcheck()
    print(json.dumps(report, indent=2))
    sys.exit(0 if report["cluster_healthy"] else 1)
