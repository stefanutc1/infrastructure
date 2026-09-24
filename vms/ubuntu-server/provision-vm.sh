#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Ubuntu Server 24.04 LTS Cloud-Init VM Provisioning Script for Proxmox VE
# VMID: 202
# ==============================================================================

VMID=202
VM_NAME="ubuntu-server-2404"
RAM_MB=2048
BALLOON_MB=1024
CORES=2
STORAGE_POOL="local-lvm"
DISK_SIZE="25G"
IMAGE_PATH="/var/lib/vz/template/iso/noble-server-cloudimg-amd64.img"

echo "=== [Proxmox VE] Provisioning Cloud-Init VM $VMID ($VM_NAME) ==="

# 1. Ensure cloud image exists
if [ ! -f "$IMAGE_PATH" ]; then
    echo "[+] Downloading Ubuntu 24.04 LTS Cloud Image..."
    wget -q --show-progress https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img -O "$IMAGE_PATH"
fi

# 2. Check if VM exists or create it
if qm status "$VMID" &>/dev/null; then
    echo "[!] VM $VMID already exists. Reconfiguring..."
else
    echo "[+] Creating VM $VMID ($VM_NAME)..."
    qm create "$VMID" \
        --name "$VM_NAME" \
        --memory "$RAM_MB" \
        --balloon "$BALLOON_MB" \
        --cores "$CORES" \
        --cpu host \
        --sockets 1 \
        --numa 1 \
        --scsihw virtio-scsi-single \
        --net0 virtio,bridge=vmbr0,firewall=1 \
        --ostype l26 \
        --agent enabled=1

    echo "[+] Importing cloud image disk to $STORAGE_POOL..."
    qm importdisk "$VMID" "$IMAGE_PATH" "$STORAGE_POOL"

    echo "[+] Attaching scsi0 and cloudinit drive..."
    qm set "$VMID" --scsihw virtio-scsi-single --scsi0 "$STORAGE_POOL:vm-$VMID-disk-0,discard=on,ssd=1"
    qm set "$VMID" --ide2 "$STORAGE_POOL:cloudinit"
    qm set "$VMID" --boot "order=scsi0;net0"
    qm set "$VMID" --serial0 socket --vga serial0
fi

# 3. Configure Cloud-Init Parameters
echo "[+] Configuring Cloud-Init user credentials and networking..."
qm set "$VMID" \
    --ciuser "${CI_USER:-admin}" \
    --cipassword "${CI_PASSWORD:-$(openssl rand -base64 16)}" \
    --ipconfig0 "ip=192.168.1.202/24,gw=192.168.1.1" \
    --nameserver "192.168.1.4" \
    --searchdomain "homelab.lan"

# Resize disk to desired size
qm resize "$VMID" scsi0 "$DISK_SIZE"

echo "=== [SUCCESS] VM $VMID ($VM_NAME) configured successfully! ==="
qm config "$VMID"
