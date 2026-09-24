#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Windows Server 2022 / 2025 KVM VM Provisioning Script for Proxmox VE
# VMID: 201
# ==============================================================================

VMID=201
VM_NAME="windows-server-2022"
RAM_MB=3072
BALLOON_MB=2048
CORES=2
STORAGE_POOL="local-lvm"
DISK_SIZE="40G"
ISO_STORAGE="local:iso"
VIRTIO_ISO="local:iso/virtio-win.iso"

echo "=== [Proxmox VE] Provisioning VM $VMID ($VM_NAME) ==="

# Check if VM already exists
if qm status "$VMID" &>/dev/null; then
    echo "[!] VM $VMID already exists. Updating hardware definition..."
else
    echo "[+] Creating new VM $VMID ($VM_NAME)..."
    qm create "$VMID" \
        --name "$VM_NAME" \
        --memory "$RAM_MB" \
        --balloon "$BALLOON_MB" \
        --cores "$CORES" \
        --cpu host \
        --sockets 1 \
        --numa 1 \
        --machine q35 \
        --bios ovmf \
        --efidisk0 "$STORAGE_POOL:0,efitype=4m,pre-enrolled-keys=1" \
        --scsihw virtio-scsi-single \
        --net0 virtio,bridge=vmbr0,firewall=1 \
        --ostype win11 \
        --agent enabled=1
fi

# Allocate / Attach primary OS disk if not set
if ! qm config "$VMID" | grep -q "scsi0:"; then
    echo "[+] Allocating $DISK_SIZE disk on $STORAGE_POOL..."
    qm set "$VMID" --scsi0 "$STORAGE_POOL:$DISK_SIZE,discard=on,ssd=1"
fi

# Attach VirtIO Windows drivers ISO if available
if [ -f /var/lib/vz/template/iso/virtio-win.iso ]; then
    echo "[+] Attaching VirtIO driver ISO to ide0..."
    qm set "$VMID" --ide0 "$VIRTIO_ISO,media=cdrom"
fi

# Set boot order
qm set "$VMID" --boot "order=scsi0;ide0;net0"

echo "=== [SUCCESS] VM $VMID ($VM_NAME) successfully provisioned on Proxmox VE! ==="
qm config "$VMID"
