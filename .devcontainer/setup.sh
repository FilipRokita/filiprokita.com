#!/usr/bin/env bash
set -euo pipefail

# Project dependencies, exactly as locked
npm ci

# Chromium for the browser tests and Lighthouse CI, with its system libraries
npx playwright install --with-deps chromium
