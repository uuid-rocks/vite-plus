#!/usr/bin/env bash
# Applies a bench variant to the t3code checkout in the current directory.
set -euo pipefail
variant=$1
base_url=$2
case "$variant" in
  base | w8 | w16 | net128) ;;
  pnpm11latest) sed -i 's/"packageManager": "pnpm@11.10.0"/"packageManager": "pnpm@11.28.6"/' package.json ;;
  pnpm12) curl -fsSL "$base_url/pnpm12.patch" | git apply ;;
  *) echo "unknown variant $variant"; exit 1 ;;
esac
case "$variant" in
  w8) echo "PNPM_MAX_WORKERS=8" >> "$GITHUB_ENV" ;;
  w16) echo "PNPM_MAX_WORKERS=16" >> "$GITHUB_ENV" ;;
  net128) echo "pnpm_config_network_concurrency=128" >> "$GITHUB_ENV" ;;
esac
git status --short
grep packageManager package.json
