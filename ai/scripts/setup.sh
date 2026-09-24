#!/usr/bin/env bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' 

echo -e "${YELLOW}[*] Initializing Antigravity setup...${NC}"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_CONFIG_DIR="$HOME/.antigravity"

if [! -f "$REPO_DIR/.env"]; then
    if [-f "$REPO_DIR/.env.example"]; then
        echo -e "${YELLOW}[!] .env file missing. Creating one from .env.example...${NC}"
        cp "$REPO_DIR/.env.example" "$REPO_DIR/.env"
        echo -e "${RED}[!] ATTENTION: Please edit the .env file and add your actual GITHUB_PERSONAL_ACCESS_TOKEN!${NC}"
    else
        echo -e "${RED}[X] Error: Neither .env nor .env.example found!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}[] .env file is already present.${NC}"
fi

echo -e "${YELLOW}[*] Setting up target directories (${TARGET_CONFIG_DIR})...${NC}"
mkdir -p "$TARGET_CONFIG_DIR"

if [-f "$REPO_DIR/mcp_config.json"]; then
    export $(grep -v '^#' "$REPO_DIR/.env" | xargs)
    
    cp "$REPO_DIR/mcp_config.json" "$TARGET_CONFIG_DIR/mcp_config.json"
    
    chmod 600 "$TARGET_CONFIG_DIR/mcp_config.json"
    
    echo -e "${GREEN}[] mcp_config.json successfully installed to ${TARGET_CONFIG_DIR}!${NC}"
else
    echo -e "${RED}[X] mcp_config.json not found in the repository!${NC}"
    exit 1
fi

echo -e "${GREEN}[] Setup completed successfully! Everything is ready.${NC}"
