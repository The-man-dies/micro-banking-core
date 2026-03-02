# PR: Fix Prisma Initialization on Windows Production

## Description

This PR resolves the `PrismaClientInitializationError` encountered on Windows 10 production environments by switching to the `binary` engine type and improving path normalization and discovery.

## Key Changes

- **Universal Path Normalization**: Stripping `\\?\` UNC prefixes at the server entry point for all `PRISMA_*` variables.
- **Improved DATABASE_URL & Config**:
  - Upgraded to **Prisma 6.x**.
  - Moved datasource configuration to `prisma.config.ts` to resolve deprecation lints.
  - Normalizing `DATABASE_URL` even when pre-set by the environment.
- **Robust Engine Discovery & Configuration**:
  - Switched Prisma to `engineType = "binary"` for better reliability in bundled environments.
  - Implemented an automatic scanning mechanism in `desktop/src/lib.rs` that detects both binary and library engine variants.
- **Diagnostics**: Detailed stack traces for initialization errors in production logs.

## Verification

- Verified on Windows environment with UNC path prefixes.
- Verified engine variant detection logic.
