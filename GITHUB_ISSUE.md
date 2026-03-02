# Issue: Windows Production - Prisma Client Initialization failure

## Description

When running the application on Windows 10 production environments, the backend starts but fails to initialize the database with a `PrismaClientInitializationError`. This prevents the "Admin Setup" wizard from appearing and keeps the user in a "non-admin" state.

## Root Cause

- **Path Handling**: Windows UNC (Long Path) prefixes (`\\?\`) provided by Tauri are not correctly resolved by the Prisma Engine or the `DATABASE_URL` parser.
- **Engine Resolution**: In a bundled executable environment, the sidecar needs an explicit `PRISMA_QUERY_ENGINE_LIBRARY` path to find the native library engine.
- **Linux Fragility**: Pre-merging, the Linux engine selection was hardcoded to a single OpenSSL variant, which could cause failures on varied Linux environments.

## Proposed Fix

- Implement `normalizePath` in the server entry point to strip `\\?\` prefixes for all `PRISMA_*` variables.
- Robustly normalize `DATABASE_URL` (strip UNC, fix backslashes) even if already set in environment.
- Explicitly configure the sidecar launcher to pass the correct native engine path, with a scanning mechanism on Linux to detect the correct engine variant.
