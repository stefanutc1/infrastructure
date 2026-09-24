# Architecture & Networking

## Subnetting & VLAN Topology

The network is segmented into isolated VLANs managed by OPNsense:

| VLAN ID | Subnet CIDR | Purpose | Isolation & Ingress Policy |
| :--- | :--- | :--- | :--- |
| **VLAN 1 (Untagged)** | `192.168.1.0/24` | Management & Hypervisor | Restricted to physical administrator workstation. |
| **VLAN 10** | `192.168.10.0/24` | Core Infrastructure | OPNsense, Pi-hole, NetBird, and reverse proxies. |
| **VLAN 20** | `192.168.20.0/24` | Application Services | All application Docker containers and persistent data nodes. |
| **VLAN 30** | `192.168.30.0/24` | Kubernetes Cluster | k3s control plane and worker nodes with pod CIDR overlays. |
| **VLAN 40** | `192.168.40.0/24` | IoT & Embedded Devices | ESP32 nodes, Home Assistant sensors (no direct WAN access). |

---

## Reverse Proxy & Authentication Flow

All external and internal HTTP traffic is routed through OPNsense Nginx Ingress Reverse Proxy (VM 200) and authenticated via Authelia:

1. Client sends request to `https://service.homelab.local`.
2. OPNsense Nginx terminates TLS using internal wildcard or Let's Encrypt certificates.
3. Ingress evaluates forward-auth sub-request against Authelia (`http://authelia:9091/api/verify`).
4. Authelia verifies user session cookie (`authelia_session`) and checks MFA requirements.
5. Upon successful validation, Nginx proxies traffic to target container on VLAN 20/30.
