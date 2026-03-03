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

echo "==> Regenerating Prisma client"
( cd server && bun install && bun run build )

echo "==> Staging backend runtime resources"
mkdir -p desktop/resources/server/prisma
cp -R server/dist desktop/resources/server/dist
cp -R server/node_modules desktop/resources/server/node_modules
if [ -f server/.env ]; then
  cp server/.env desktop/resources/server/.env
fi
cp -R server/prisma/migrations desktop/resources/server/prisma/migrations

echo "==> Copying Bun sidecar binary"
mkdir -p desktop/binaries
BUN_BIN="$(command -v bun)"
ARCH="$(uname -m)"
if [ "$ARCH" = "x86_64" ]; then
  SIDE_ARCH="x86_64"
elif [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
  SIDE_ARCH="aarch64"
else
  echo "Unsupported macOS architecture: $ARCH" >&2
  exit 1
fi
cp "$BUN_BIN" "desktop/binaries/bun-${SIDE_ARCH}-apple-darwin"
chmod +x "desktop/binaries/bun-${SIDE_ARCH}-apple-darwin"

echo "==> Building Tauri app (mac)"
( cd desktop && bunx tauri build --config tauri.conf.json )

echo "==> macOS build complete"
