## Summary
- add Tauri sidecar watchdog with graceful shutdown, health checks, and restart backoff
- bundle Prisma assets and pass resource paths to the sidecar
- add idempotent SQLite migration runner using Bun’s sqlite

## Details
- sidecar now receives `DATABASE_FILE`, `LOG_DIR`, `TAURI_ENV_PATH`, `PRISMA_SCHEMA_PATH`, `PRISMA_MIGRATIONS_PATH`, `PRISMA_QUERY_ENGINE_WASM_PATH`
- server logs to file and prints Prisma path info at startup
- new `_client_migrations` table ensures migrations run once
- build flow adds `copy:engine` (local WASM/schema copy) before Tauri build
- sidecar renamed to `server` to avoid Tauri name collision
- Prisma generator targets include `native`, `windows`, `darwin`, `debian-openssl-1.1.x`

## Testing
- `bun run lint` (server)
- `bun run format` (server)
- `APPIMAGE_EXTRACT_AND_RUN=1 bun run build` (failed only at linuxdeploy/AppImage stage)

## Notes
- AppImage bundling fails due to `linuxdeploy`; RPM/DEB build artifacts are produced successfully
