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
(
  set +e
  cd desktop
  bunx tauri build --bundles "${BUNDLES:-app,dmg}" --config tauri.conf.json
  status=$?
  if [ $status -ne 0 ] && [[ "${BUNDLES:-app,dmg}" == *"dmg"* ]]; then
    echo "==> DMG bundling failed; retrying with app only"
    bunx tauri build --bundles "app" --config tauri.conf.json
    status=$?
  fi
  exit $status
)

echo "==> macOS build complete"
