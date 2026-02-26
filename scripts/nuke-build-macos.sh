#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Cleaning build artifacts (mac)"
rm -rf desktop/target
rm -f desktop/binaries/server-*
rm -rf server/node_modules/.prisma server/node_modules/@prisma/client
rm -rf client/dist

echo "==> Building frontend"
( cd client && bun install && bun run build )

echo "==> Regenerating Prisma client"
( cd server && bun install && bunx prisma generate )

echo "==> Copying Prisma client assets"
bun run copy:engine

echo "==> Compiling macOS sidecar"
( cd server && bun run compile:mac )

echo "==> Building Tauri app (mac)"
( cd desktop && bunx tauri build --config tauri.conf.json )

echo "==> macOS build complete"
