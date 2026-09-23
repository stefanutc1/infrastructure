# AI Platform Specification: Multi-Tier Model Routing Cascade

## Objective
Establish an automated model routing architecture that maximizes reasoning quality, optimizes operating costs, and guarantees uninterrupted operational resilience during cloud outages or network disconnects.

---

## Routing Cascade Hierarchy

```text
                             Inbound Inference Request
                                         │
                                         ▼
                      ┌───────────────────────────────────────┐
                      │ Tier 1: Primary Cloud Frontier Model  │
                      │ (Google Gemini 2.5 / Claude 3.5 / 4o) │
                      └──────────────────┬────────────────────┘
                                         │
                   (Timeout >10s / Rate Limit 429 / HTTP 5xx)
                                         │
                                         ▼
                      ┌───────────────────────────────────────┐
                      │ Tier 2: Secondary Cloud Fallback Model│
                      │      (Alternative Frontier Provider)  │
                      └──────────────────┬────────────────────┘
                                         │
                   (Network Disconnect / Gateway Unreachable)
                                         │
                                         ▼
                      ┌───────────────────────────────────────┐
                      │ Tier 3: Local GPU Inference (Ollama)  │
                      │ NVIDIA GTX 1050 Ti (CT 102 · Port 11434)│
                      │ Models: Qwen2.5-Coder:7b, Llama-3.2:3b│
                      └──────────────────┬────────────────────┘
                                         │
                        (VRAM OOM / Severe Local Fault)
                                         │
                                         ▼
                      ┌───────────────────────────────────────┐
                      │ Tier 4: Deterministic Static Fallback │
                      │ (Rule-Based Diagnostics & Cache Data) │
                      └───────────────────────────────────────┘
```

---

## Model Capabilities & Hardware Mapping

| Cascade Tier | Target Provider | Hosted Location | Hardware Backing | Latency Profile | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Primary Cloud)** | Google Gemini / Anthropic | External Cloud API | Cloud Multi-GPU Clusters | 500ms – 1,500ms | Complex multi-step reasoning, architecture planning, code generation. |
| **Tier 2 (Secondary Cloud)** | OpenAI / Azure OpenAI | External Cloud API | Cloud Multi-GPU Clusters | 800ms – 2,000ms | Upstream cloud failover and surge capacity. |
| **Tier 3 (Local GPU Inference)** | Ollama Daemon | Node 1 (CT 102) | NVIDIA GTX 1050 Ti (4GB VRAM) | 2,000ms – 5,000ms | Offline resilience, confidential telemetry analysis, local agent pairing. |
| **Tier 4 (Deterministic Fallback)** | Internal Python Daemon | In-Process / Local | CPU (Near-Zero Footprint) | <10ms | Emergency status returns, cached metric summaries. |

---

## Local GPU Inference Configuration (Container 102)

Ollama is containerized with PCIe passthrough on Proxmox VE:
- **Container**: CT 102 (`ollama`) running Debian 12.
- **NVIDIA Driver**: 550.x+ host driver passed through to container via `/dev/nvidia*` character devices.
- **Memory Optimization**:
  - `OLLAMA_NUM_PARALLEL=1` (Prevents VRAM fragmentation across concurrent requests).
  - `OLLAMA_KEEP_ALIVE=24h` (Avoids cold-start model reloading penalties).
  - Models quantized to 4-bit (`Q4_K_M`) to guarantee total VRAM occupancy remains below 3,800MB.

---

## Observability & Telemetry
Every routed inference call emits structured telemetry:
- `prompt_tokens`, `completion_tokens`, `duration_ms`.
- `selected_tier` (1, 2, 3, or 4).
- `fallback_reason` (e.g., `UPSTREAM_RATE_LIMIT`, `WAN_DISCONNECTED`, `NONE`).
- Monitored in Grafana via Prometheus metrics (`elo_inference_requests_total`, `elo_inference_latency_seconds`).
