$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> Cleaning build artifacts"
Remove-Item -Recurse -Force "desktop\target" -ErrorAction SilentlyContinue
Get-ChildItem "desktop\binaries" -Filter "server-*" -ErrorAction SilentlyContinue | Remove-Item -Force
Remove-Item -Recurse -Force "server\node_modules\.prisma" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "server\node_modules\@prisma\client" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "client\dist" -ErrorAction SilentlyContinue

Write-Host "==> Building frontend"
Push-Location "../client"
& bun install
& bun run build
Pop-Location

Write-Host "==> Regenerating Prisma client"
Push-Location "server"
& bun install
& bunx prisma generate
Pop-Location

Write-Host "==> Copying Prisma client assets"
& bun run copy:engine

Write-Host "==> Compiling sidecar (Windows)"
Push-Location "server"
& bun run compile:win
Pop-Location

Write-Host "==> Building Tauri app (Windows)"
Push-Location "desktop"
& bunx tauri build --config tauri.conf.json
Pop-Location

Write-Host "==> Done"
