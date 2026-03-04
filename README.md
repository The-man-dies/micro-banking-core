# Micro Banking Core

Desktop-first micro-banking application built as a monorepo:
- `client/`: React + Vite + Tailwind + DaisyUI
- `server/`: Bun + Express + Prisma (SQLite)
- `desktop/`: Tauri (Rust shell + sidecar launcher)

## Architecture

- Backend is **not** bundled as a single compiled executable.
- Backend runtime is packaged as:
  - `server/dist`
  - `server/node_modules` (including Prisma runtime assets)
  - `server/prisma/migrations`
- Tauri sidecar runs: `bun dist/index.js`.

This avoids Prisma runtime engine resolution issues found with `bun build --compile`.

## Versioning

Current release line is aligned to:
- App version: `0.0.1`
- Cargo package version: `0.0.1`
- Release tag trigger: any tag matching `v*`

## Prerequisites

- Bun (latest stable)
- Rust toolchain (stable)
- Platform build prerequisites for Tauri:
  - Windows: MSVC build tools
  - Linux: GTK/WebKit2GTK development packages
  - macOS: Xcode command line tools

## Install Dependencies

```bash
# root
bun install

# optional explicit installs
(cd client && bun install)
(cd server && bun install)
```

## Development

```bash
# frontend
cd client
bun run dev

# backend
cd server
bun run dev
```

## Build Commands

From repository root:

```bash
# Windows bundle (NSIS current-user)
bun run build:win

# Linux bundles
bun run build:linux

# macOS bundles
bun run build:mac
```

These scripts handle:
1. client production build
2. backend runtime staging for Tauri resources
3. sidecar binary staging (`bun`)
4. Tauri bundle generation

## CI/CD

### 1) Checks workflow
File: `.github/workflows/ci.yml`

Triggers:
- push
- pull_request
- manual (`workflow_dispatch`)

Runs:
- Client checks (lint, type-check, prettier, build)
- Server checks (prisma generate, lint, type-check, prettier, build)
- Desktop Rust checks (fmt, clippy, tests)

### 2) Multi-platform build workflow
File: `.github/workflows/build-multi-platform.yml`

Triggers:
- push
- pull_request
- manual (`workflow_dispatch`)

Builds bundles on:
- `ubuntu-latest`
- `windows-latest`
- `macos-latest`

Uploads OS-specific bundle artifacts.

### 3) Release workflow (tag-driven)
File: `.github/workflows/release-tag.yml`

Triggers:
- push tag matching `v*`
- manual (`workflow_dispatch`)

Builds all platforms, then publishes GitHub release assets.

## Production Notes (Windows)

- Installer mode is NSIS `currentUser` to avoid `Program Files` permission issues.
- Theme rendering is pinned and fallback tokens are provided for WebView compatibility.

## Repository Structure

```text
.
├── client/
├── server/
├── desktop/
├── scripts/
└── .github/workflows/
```

## Contributing

1. Create a feature/fix branch.
2. Keep commits atomic.
3. Open PR with:
   - issue context
   - technical change summary
   - validation evidence (CI + manual where needed)

## License

MIT License
