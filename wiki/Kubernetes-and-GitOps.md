# Kubernetes & GitOps

## k3s Cluster Architecture

The Kubernetes layer runs a lightweight, production-tuned k3s cluster configured via Ansible in `kubernetes/ansible/`.

```mermaid
flowchart TB
    subgraph K8s["k3s Single-Node / Multi-Worker Cluster Architecture"]
        subgraph CP["Control Plane (k3s-server)"]
            DB["Embedded SQLite / Kine Datastore"]
            NET["Flannel VXLAN Overlay Network"]
            ING["Ingress Routing via NPM Proxy"]
        end

        subgraph Flux["FluxCD Controller & GitOps Reconciliation Layer"]
            SRC["Source Controller<br/>(polls stefanut/homelab @ 5m)"]
            KUST["Kustomize Controller<br/>(evaluates manifests & applies drift fix)"]
            NOTIF["Notification Controller<br/>(Discord & Telegram webhooks)"]
        end
    end

    SRC --> KUST --> CP
    KUST --> NOTIF
```

## Continuous Reconciliation with FluxCD

FluxCD monitors `kubernetes/gitops/` in the main repository:

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: homelab-repo
  namespace: flux-system
spec:
  interval: 5m0s
  url: https://github.com/stefanutc1/homelab
  ref:
    branch: main
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: cluster-workloads
  namespace: flux-system
spec:
  interval: 10m0s
  path: "./kubernetes/gitops/clusters/homelab"
  prune: true
  sourceRef:
    kind: GitRepository
    name: homelab-repo
```
