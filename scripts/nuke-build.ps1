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

Write-Host "==> Preparing resource directories"
if (!(Test-Path "desktop\resources")) {
    New-Item -ItemType Directory -Force -Path "desktop\resources"
}
if (!(Test-Path "desktop\resources\server")) {
    New-Item -ItemType Directory -Force -Path "desktop\resources\server"
}
if (!(Test-Path "desktop\resources\server\prisma")) {
    New-Item -ItemType Directory -Force -Path "desktop\resources\server\prisma"
}
if (!(Test-Path "desktop\binaries")) {
    New-Item -ItemType Directory -Force -Path "desktop\binaries"
}

Write-Host "==> Building backend runtime (dist + node_modules)"
Push-Location "server"
& bun install
& bun run compile:win
Pop-Location

Write-Host "==> Copying backend runtime resources"
Copy-Item -Recurse -Force "server\dist" "desktop\resources\server\dist"
Copy-Item -Recurse -Force "server\node_modules" "desktop\resources\server\node_modules"
if (Test-Path "server\.env") {
    Copy-Item -Force "server\.env" "desktop\resources\server\.env"
}
Copy-Item -Recurse -Force "server\prisma\migrations" "desktop\resources\server\prisma\migrations"

Write-Host "==> Copying Bun sidecar binary"
$bunCommand = Get-Command bun -ErrorAction Stop
Copy-Item -Force $bunCommand.Source "desktop\binaries\bun-x86_64-pc-windows-msvc.exe"

Write-Host "==> Building Tauri app (Windows)"
Push-Location "desktop"
& bunx tauri build --config tauri.conf.json
Pop-Location

Write-Host "==> Done"
