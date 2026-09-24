<#
.SYNOPSIS
    Setup script for Antigravity configuration on Windows / PowerShell.
.DESCRIPTION
    Automates environment file generation, target directory creation, 
    MCP config deployment, and security hardening.
#>

$ErrorActionPreference = "Stop"

function Write-Success { param($msg) Write-Host "[✓] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-ErrorMsg { param($msg) Write-Host "[X] $msg" -ForegroundColor Red }

Write-Warning "[*] Initializing Antigravity setup for Windows..."

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RepoDir = Split-Path -Parent $ScriptDir
$TargetConfigDir = "$env:USERPROFILE\.antigravity"

$EnvFile = Join-Path $RepoDir ".env"
$EnvExample = Join-Path $RepoDir ".env.example"

if (-not (Test-Path $EnvFile)) {
    if (Test-Path $EnvExample) {
        Write-Warning "[!] .env file missing. Creating one from .env.example..."
        Copy-Item $EnvExample $EnvFile
        Write-ErrorMsg "[!] ATTENTION: Please edit the .env file and add your actual GITHUB_PERSONAL_ACCESS_TOKEN!"
    } else {
        Write-ErrorMsg "[X] Error: Neither .env nor .env.example found!"
        exit 1
    }
} else {
    Write-Success ".env file is already present."
}

Write-Warning "[*] Setting up target directories ($TargetConfigDir)..."
if (-not (Test-Path $TargetConfigDir)) {
    New-Item -ItemType Directory -Force -Path $TargetConfigDir | Out-Null
}

$McpSource = Join-Path $RepoDir "mcp_config.json"
$McpTarget = Join-Path $TargetConfigDir "mcp_config.json"

if (Test-Path $McpSource) {
    Copy-Item $McpSource $McpTarget -Force
    
    try {
        $Acl = Get-Acl $McpTarget
        $Acl.SetAccessRuleProtection($true, $false) 
        $Identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        $FileSystemRule = New-Object System.Security.AccessControl.FileSystemAccessRule($Identity, "FullControl", "Allow")
        $Acl.SetAccessRule($FileSystemRule)
        Set-Acl $McpTarget $Acl
        Write-Success "mcp_config.json installed and permissions secured."
    } catch {
        Write-Warning "[!] Could not apply advanced ACL permissions, but file was copied successfully."
    }
    
    Write-Success "mcp_config.json successfully installed to $TargetConfigDir!"
} else {
    Write-ErrorMsg "[X] mcp_config.json not found in the repository!"
    exit 1
}

Write-Success "[✔] Setup completed successfully! Everything is ready."
