#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Cleaning build artifacts (mac)"
rm -rf desktop/target
rm -f desktop/binaries/bun-*
rm -rf desktop/resources/server
rm -rf client/dist

echo "==> Building frontend"
( cd client && bun install && bun run build )

echo "==> Staging Tauri backend runtime"
bun run tauri:stage

echo "==> Building Tauri app (mac)"
( cd desktop && bunx tauri build --config tauri.conf.json )

echo "==> macOS build complete"
