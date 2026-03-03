# PR: Replace compiled server sidecar with Bun runtime sidecar (Prisma 6 compatible)

## Context
Prisma 6 fails at runtime on Windows when the backend is bundled as a single executable with `bun build --compile` because the Prisma query engine cannot be reliably resolved from inside the compiled binary.

## Goal
Stop using compiled backend sidecar binaries and switch to:
- backend build output in `server/dist/`
- bundled `server/node_modules` at runtime
- sidecar execution via `bun dist/index.js`
- no forced `PRISMA_QUERY_ENGINE_BINARY` override

## What changed

### 1. Server build scripts
Updated backend scripts to build to `dist/` (no `--compile`):
- `server/package.json`
  - `compile:win` -> `bun run prisma:generate && bun build src/index.ts --outdir dist --target=bun`
  - aligned `compile:linux` and `compile:mac` to the same dist-based build flow

### 2. Windows packaging flow
Updated `scripts/nuke-build.ps1`:
- removed old `server-*` compiled binary cleanup
- removed Prisma client deletion cleanup
- backend build now generates `server/dist`
- copies runtime payload into bundle resources:
  - `server/dist` -> `desktop/resources/server/dist`
  - `server/node_modules` -> `desktop/resources/server/node_modules`
  - `server/prisma/migrations` -> `desktop/resources/server/prisma/migrations`
  - `server/.env` (if present) -> `desktop/resources/server/.env`
- copies local `bun.exe` into Tauri external bin:
  - `desktop/binaries/bun-x86_64-pc-windows-msvc.exe`

### 3. Tauri bundle configuration
Updated `desktop/tauri.conf.json`:
- resources now bundle `resources/server`
- external sidecar binary changed from `binaries/server` to `binaries/bun`

### 4. Tauri sidecar runtime launch
Updated `desktop/src/lib.rs`:
- sidecar changed from `server` to `bun`
- command args changed to run `dist/index.js`
- sidecar working directory set to `resource_dir/server`
- removed explicit Prisma engine binary/library environment injection logic
- resource path environment variables now point to staged server runtime:
  - `.env`: `resource_dir/server/.env`
  - schema: `resource_dir/server/node_modules/.prisma/client/schema.prisma`
  - migrations: `resource_dir/server/prisma/migrations`
  - wasm: `resource_dir/server/node_modules/.prisma/client/query_compiler_fast_bg.wasm`

### 5. Future cross-platform compatibility
Aligned Linux/macOS scripts to same non-compiled strategy:
- `scripts/nuke-build.sh`
- `scripts/nuke-build-macos.sh`
- both now stage `dist + node_modules + prisma/migrations (+ .env)` and copy platform `bun` binary into `desktop/binaries/`

## Why this works for Prisma 6
Prisma runtime assets now remain on disk in bundled resources (`node_modules/.prisma` and `node_modules/@prisma/client`), so Prisma can resolve engines/artifacts using normal runtime behavior without forced `PRISMA_QUERY_ENGINE_BINARY`.

## DB path validation
No DB path change required:
- Tauri injects absolute `DATABASE_URL` and `DATABASE_FILE`
- Prisma and migration runner already prioritize these env vars
- sidecar `cwd` change does not break DB path resolution

## Validation done
- `cargo check` passes after configuration updates.
- Sidecar configuration resolves as `bun` + `dist/index.js` with `current_dir=resource_dir/server`.

## Files changed
- `server/package.json`
- `scripts/nuke-build.ps1`
- `scripts/nuke-build.sh`
- `scripts/nuke-build-macos.sh`
- `desktop/tauri.conf.json`
- `desktop/src/lib.rs`

## Final bundled runtime layout
```text
desktop/
  binaries/
    bun-x86_64-pc-windows-msvc.exe
    bun-x86_64-unknown-linux-gnu
    bun-aarch64-apple-darwin
  resources/
    server/
      dist/
      node_modules/
        .prisma/
        @prisma/client/
      prisma/
        migrations/
      .env
```

## Risk / notes
- Bundle size increases because `node_modules` is shipped.
- Build machine must have Bun installed (to copy Bun binary for sidecar).
- Optional hardening later: prune dev-only dependencies before bundling if size becomes an issue.

