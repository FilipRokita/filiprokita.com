#!/usr/bin/env bash
set -euo pipefail

# System packages (Chromium for Lighthouse CI)
sudo apt-get update
sudo apt-get install -y chromium

# Project dependencies (skipped before the project is scaffolded)
if [ -f package.json ]; then
  npm ci
fi