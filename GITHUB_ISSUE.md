# Issue: Windows Production - Prisma Client Initialization failure

## Description

When running the application on Windows 10 production environments, the backend starts but fails to initialize the database with a `PrismaClientInitializationError`. This prevents the "Admin Setup" wizard from appearing and keeps the user in a "non-admin" state.

## Root Cause

- **Path Handling**: Windows UNC (Long Path) prefixes (`\\?\`) provided by Tauri are not correctly resolved by the Prisma Engine or the `DATABASE_URL` parser.
- **Engine Resolution**: In a bundled executable environment, the sidecar needs an explicit `PRISMA_QUERY_ENGINE_*` path to find the native library or binary engine.

## Proposed Fix

- Upgrade to **Prisma 6.x** for better engine management and configuration standards.
- Switch Prisma to `engineType = "binary"` in `schema.prisma`.
- Move datasource configuration to `prisma.config.ts` to resolve deprecation lints and centralize connection logic.
- Implement robust path normalization in the server and dynamic engine scanning in the sidecar to set both `PRISMA_QUERY_ENGINE_LIBRARY` and `PRISMA_QUERY_ENGINE_BINARY`.
