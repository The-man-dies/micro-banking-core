#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

ensure_linuxdeploy() {
  local target="/tmp/linuxdeploy.AppImage"
  if [ ! -f "$target" ]; then
    echo "Downloading linuxdeploy..."
    curl -L https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage -o "$target"
    chmod +x "$target"
  fi
  cat <<'BIN' > /tmp/linuxdeploy
#!/usr/bin/env bash
exec /tmp/linuxdeploy.AppImage --appimage-extract-and-run "$@"
BIN
  chmod +x /tmp/linuxdeploy
}

ensure_linuxdeploy_plugin_appimage() {
  local target="/tmp/linuxdeploy-plugin-appimage.AppImage"
  if [ ! -f "$target" ]; then
    echo "Downloading linuxdeploy-plugin-appimage..."
    curl -L https://github.com/linuxdeploy/linuxdeploy-plugin-appimage/releases/download/continuous/linuxdeploy-plugin-appimage-x86_64.AppImage -o "$target"
    chmod +x "$target"
  fi
  cat <<'BIN' > /tmp/linuxdeploy-plugin-appimage
#!/usr/bin/env bash
exec /tmp/linuxdeploy-plugin-appimage.AppImage --appimage-extract-and-run "$@"
BIN
  chmod +x /tmp/linuxdeploy-plugin-appimage
}

ensure_linuxdeploy
ensure_linuxdeploy_plugin_appimage

if ! command -v patchelf >/dev/null 2>&1; then
  echo "patchelf not found; disabling AppImage bundling (install patchelf to enable)"
  if [ -z "${BUNDLES:-}" ]; then
    export BUNDLES="rpm,deb"
  else
    export BUNDLES
    BUNDLES="${BUNDLES//appimage/}"
    BUNDLES="${BUNDLES//,,/,}"
    BUNDLES="${BUNDLES#,}"
    BUNDLES="${BUNDLES%,}"
    export BUNDLES
  fi
fi

echo "==> Cleaning build artifacts"
rm -rf desktop/target
rm -f desktop/binaries/bun-*
rm -rf desktop/resources/server
rm -rf client/dist

echo "==> Building frontend"
(
  cd client
  bun install
  bun run build
)

echo "==> Staging Tauri backend runtime"
bun run tauri:stage

echo "==> Building Tauri app"
( 
  set +e
  cd desktop
  PATH=/tmp:$PATH LINUXDEPLOY="/tmp/linuxdeploy" bunx tauri build --bundles "${BUNDLES:-rpm,deb,appimage}" --config tauri.conf.json
  status=$?
  if [ $status -ne 0 ] && [[ "${BUNDLES:-rpm,deb,appimage}" == *"appimage"* ]]; then
    echo "==> AppImage bundling failed; retrying with rpm,deb only"
    PATH=/tmp:$PATH LINUXDEPLOY="/tmp/linuxdeploy" bunx tauri build --bundles "rpm,deb" --config tauri.conf.json
    status=$?
  fi
  exit $status
)
