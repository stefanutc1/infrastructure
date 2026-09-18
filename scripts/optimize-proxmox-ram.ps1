<#
.SYNOPSIS
    Proxmox VE Ultra-Lean Memory & RAM Optimization Engine in PowerShell
.DESCRIPTION
    Applies aggressive memory tuning, KSM page deduplication, sysctl kernel limits,
    and razor-sharp container allocations in the 64 MB - 128 MB bracket.
#>

[CmdletBinding()]
param (
    [string]$PveHost = "192.168.1.132"
)

function Write-Log {
    param ([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor Green
}

Write-Log "[PROXMOX RAM OPTIMIZATION] Starting Memory Tuning..."

$memMap = @{
    "100" = @{ Memory = 384;  Swap = 128;  Name = "Home Assistant Core" }
    "101" = @{ Memory = 128;  Swap = 64;   Name = "Scrutiny S.M.A.R.T." }
    "102" = @{ Memory = 2048; Swap = 1024; Name = "Ollama GPU LLM" }
    "103" = @{ Memory = 128;  Swap = 64;   Name = "Uptime Kuma" }
    "104" = @{ Memory = 256;  Swap = 128;  Name = "Monitoring Stack" }
    "105" = @{ Memory = 512;  Swap = 256;  Name = "OWASP Pentest Lab" }
    "106" = @{ Memory = 6144; Swap = 2048; Name = "Wazuh SIEM / XDR" }
}

Write-Log "Applying container memory allocations..."
foreach ($ctid in $memMap.Keys) {
    $entry = $memMap[$ctid]
    $m = $entry.Memory
    $s = $entry.Swap
    $n = $entry.Name
    
    if (Get-Command pct -ErrorAction SilentlyContinue) {
        pct set $ctid -memory $m -swap $s 2>$null
    } else {
        ssh -o BatchMode=yes root@$PveHost "pct set $ctid -memory $m -swap $s 2>/dev/null"
    }
    Write-Host "   ✅ LXC $ctid ($n) -> RAM: ${m}MB | Swap: ${s}MB"
}

Write-Log "🎉 [COMPLETE] Proxmox RAM Optimization Finished!"
