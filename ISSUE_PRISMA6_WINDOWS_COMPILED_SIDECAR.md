# Issue: Prisma 6 fails in packaged Windows app with compiled Bun sidecar

## Problem
The backend sidecar is currently packaged as a standalone executable built with:

`bun build --compile`

With Prisma 6, runtime fails in the packaged Windows app because Prisma engine/client artifacts are not reliably discoverable from inside the compiled binary.

## Current behavior
- Tauri launches a compiled backend sidecar (`server-*.exe`).
- Prisma fails at runtime in production bundle due to engine resolution.

## Expected behavior
- Packaged Windows app should run backend + Prisma 6 without engine override hacks.
- Prisma should resolve runtime assets from a normal filesystem layout.

## Proposed fix
- Stop packaging backend as compiled executable.
- Build backend to `server/dist`.
- Bundle runtime backend payload in Tauri resources:
  - `server/dist`
  - `server/node_modules` (including `.prisma` and `@prisma/client`)
  - `server/prisma/migrations`
  - `server/.env` (if present)
- Ship `bun.exe` as the sidecar executable.
- Launch backend as:
  - `bun dist/index.js`
  - with working directory set to `resources/server`.

## Acceptance criteria
- Windows packaged app boots backend successfully.
- Prisma 6 works in production mode without setting `PRISMA_QUERY_ENGINE_BINARY`.
- Existing business logic remains unchanged.
- Packaging path remains compatible with future Linux/macOS sidecar strategy.

