$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> Cleaning build artifacts"
Remove-Item -Recurse -Force "desktop\target" -ErrorAction SilentlyContinue
Get-ChildItem "desktop\binaries" -Filter "bun-*" -ErrorAction SilentlyContinue | Remove-Item -Force
Remove-Item -Recurse -Force "desktop\resources\server" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "client\dist" -ErrorAction SilentlyContinue

Write-Host "==> Building frontend"
Push-Location "client"
& bun install
& bun run build
Pop-Location

Write-Host "==> Staging Tauri backend runtime"
& bun run tauri:stage

Write-Host "==> Building Tauri app (Windows)"
Push-Location "desktop"
& bunx tauri build --bundles nsis --config tauri.conf.json
Pop-Location
if ($LASTEXITCODE -ne 0) {
    throw "Tauri build failed with exit code $LASTEXITCODE"
}

Write-Host "==> Done"
