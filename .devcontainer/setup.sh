#!/usr/bin/env bash
set -euo pipefail

# System packages
sudo apt-get update
sudo apt-get install -y chromium

# Project dependencies
if [ -f package.json ]; then
  npm ci
fi