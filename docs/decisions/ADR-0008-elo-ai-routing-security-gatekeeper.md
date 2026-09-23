# ADR-0008: ELO Multi-Tier Cascade Routing & L0–L3 Tool Execution Gatekeeper

## Status
**Accepted**

## Context
Artificial intelligence integration within the platform (the ELO subsystem) serves dual roles:
1. Operational intelligence (log summarization, anomaly explanation, configuration assistance).
2. Autonomous infrastructure pairing (running health queries, generating reports, interacting with Home Assistant and Proxmox APIs).

However, autonomous AI interactions present severe operational risks:
- Hallucinations could generate destructive system commands (`rm -rf`, dropping firewall rules, stopping production VMs).
- Relying exclusively on external cloud models (OpenAI, Anthropic, Google Gemini) creates an internet dependency; network disruptions would render AI features inoperative.
- Relying exclusively on local hardware is constrained by the physical GPU: NVIDIA GeForce GTX 1050 Ti with 4GB VRAM, which can run 3B to 7B quantized models (Qwen2.5, Mistral, Llama 3.2), but cannot handle massive 70B parameter models.

## Decision
We establish an **AI Architecture governed by Multi-Tier Cascade Routing and an L0–L3 Security Gatekeeper**:

1. **Multi-Tier Cascade Routing**:
   - **Tier 1 (Primary Cloud API)**: High-reasoning cloud LLM (e.g. Gemini 2.5 / Claude / GPT-4o) used for complex analytical or multi-step platform engineering tasks.
   - **Tier 2 (Secondary Cloud Fallback)**: Alternative cloud provider triggered upon rate limits or upstream API outages.
   - **Tier 3 (Local GPU Inference - Ollama)**: Container 102 running Ollama with GTX 1050 Ti GPU passthrough (4-bit quantized models such as `llama3.2:3b` or `qwen2.5-coder:7b`) for offline resilience, telemetry analysis, and private data handling.
   - **Tier 4 (Deterministic Fallback)**: Rule-based static fallbacks returning safe errors or precomputed diagnostic summaries if all model tiers fail.

2. **L0–L3 Security Permission Boundaries**:
   - **Level 0 (Read-Only Telemetry)**: Service status checks, log reading, metric scraping. Zero operator confirmation required.
   - **Level 1 (Idempotent Non-Destructive Mutations)**: Generating documentation, creating draft configuration files, running static lint tests. Audit logged.
   - **Level 2 (Stateful Operations)**: Restarting non-critical containers, applying firewall blocklist updates, purging cache files. Requires explicit token authentication.
   - **Level 3 (Privileged / Destructive Actions)**: VM destruction, disk wiping, bare-metal reboots, modifying core OPNsense routing tables. **Strictly blocked without interactive out-of-band operator approval**.

3. **Tool Gatekeeper Pipeline**:
   ```text
   ELO Subsystem -> Intent Extraction -> Policy Evaluation -> Permission Check -> Operator Approval (if L2/L3) -> Execution -> Audit Logging
   ```

## Consequences

### Positive
- **Safety by Design**: Eliminates the risk of automated AI actions destroying production infrastructure or taking down the network.
- **Offline Resilience**: Essential operational queries continue functioning via the local Ollama instance during internet outages.
- **Full Auditability**: Every privileged action attempted or executed by the AI plane is recorded with timestamp, intent, parameters, and operator approval status.

### Negative
- **Latency on Approvals**: Destructive maintenance tasks require human presence and confirmation, preventing fully unattended self-healing for critical L3 actions.
- **Local Model Limitations**: 4GB VRAM limits local reasoning quality compared to frontier cloud models.
