## Summary
- add sidecar watchdog with health checks, graceful shutdown, and restart backoff
- bundle server `.env` into Tauri resources and pass its path to the sidecar
- add file logging for server logs and keep runtime tokens in memory

## Details
- add `/internal/health` and `/internal/shutdown` endpoints (local-only, tokened)
- server loads dotenv from `TAURI_ENV_PATH` when present
- sidecar injects `DATABASE_FILE`, `LOG_DIR`, `PORT`, `SHUTDOWN_TOKEN`, `TAURI_ENV_PATH`
- watchdog restarts backend with exponential backoff and max restart limit
- configurable via env: `BACKEND_HEALTH_TIMEOUT_SECS`, `BACKEND_RESTART_BACKOFF_MAX_SECS`, `BACKEND_RESTART_MAX`
- configurable shutdown grace via `BACKEND_SHUTDOWN_GRACE_SECS`
- server shutdown closes HTTP listener, stops cron, and closes Prisma connection
- server logs written to file (`LOG_DIR`/`LOG_FILE`) with rotation
- shutdown token comparison uses timing-safe equality

## Testing
- `bun run lint` (server)
- `bun run format` (server)

## Notes
- shutdown uses header-only `x-shutdown-token`
