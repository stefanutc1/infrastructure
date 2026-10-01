# Immich Self-Hosted Photo & Video Management Suite

<div align="center">

[![Service](https://img.shields.io/badge/Service-Immich%20Media%20Engine-0f172a.svg?style=flat&logo=photos)](#)
[![Port](https://img.shields.io/badge/Port-2283%2FTCP-blue.svg?style=flat)](#)
[![Storage](https://img.shields.io/badge/Storage-NVMe%20Local--LVM%20%2B%20NAS-059669.svg?style=flat&logo=zfs)](#)
[![Machine Learning](https://img.shields.io/badge/ML%20Search-CLIP%20%2B%20Facial%20Recognition-8b5cf6.svg?style=flat&logo=pytorch)](#)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016%20%2B%20pgvecto--rs-336791.svg?style=flat&logo=postgresql)](#)

</div>

---

## Executive Summary

This module deploys the self-hosted photo, video backup, indexing, and computer-vision classification platform for the homelab. It serves as a privacy-preserving, high-performance replacement for commercial cloud photo services.

---

## 1. Microservice Architecture

```mermaid
flowchart TD
    Client["Mobile Apps & Web Browsers"] -->|Port 2283/TCP| Server["immich-server<br/>NestJS REST API & WebUI"]
    Server -->|Vector Search & Metadata| DB["PostgreSQL 16 + pgvecto-rs<br/>Vector Embeddings Index"]
    Server -->|Task Queue Management| Redis["Redis In-Memory Cache<br/>Background Job Broker"]
    Server -->|Inference RPC| ML["immich-machine-learning<br/>Python ONNX / CLIP Embeddings<br/>Facial Recognition Models"]
    Server -->|Persistent Media Storage| Storage["Storage Volume<br/>/data/photos (ZFS / NVMe)"]
```

- **`immich-server`**: Central API gateway and application coordinator on port `2283/TCP`. Handles user authentication, metadata extraction, FFmpeg video transcoding, and client synchronization.
- **`immich-machine-learning`**: Dedicated neural processing container. Executes CLIP models for semantic natural-language photo search and facial detection/clustering algorithms.
- **`database`**: Dedicated PostgreSQL instance extended with `pgvecto-rs` for high-dimensional vector similarity indexing of CLIP embeddings.
- **`redis`**: Distributed asynchronous queue broker orchestrating thumbnail generation, EXIF parsing, and video transcodes.

---

## 2. Storage Mapping & Hardware Acceleration

| Volume Path | Host Mount Point | Purpose |
| :--- | :--- | :--- |
| `/usr/src/app/upload` | `/data/photos` | Master immutable original photo and video vault |
| `/var/lib/postgresql/data` | `local-lvm:vm-immich-db` | Relational metadata, album states, and vector embeddings |
| `/dev/dri` | Host Intel QuickSync / VAAPI | Hardware-accelerated H.264/HEVC video transcoding |

---

## 3. Deployment & Operational Runbook

```bash
# 1. Prepare environment variables
cp .env.example .env

# 2. Configure database credentials and storage root paths in .env
# DB_PASSWORD=<generated_secure_secret>
# UPLOAD_LOCATION=/data/photos

# 3. Launch stack
docker compose up -d

# 4. Verify service health
docker compose ps
curl -s http://127.0.0.1:2283/api/server-info/ping
```

The WebUI becomes accessible internally via `http://<HOST_IP>:2283` or via Caddy reverse proxy at `https://photos.lan` with automated mTLS.
