# PR: Fix Prisma Initialization on Windows Production

## Description

This PR resolves the `PrismaClientInitializationError` encountered on Windows 10 production environments by improving path normalization and engine resolution.

## Key Changes

- **Universal Path Normalization**: Stripping `\\?\` UNC prefixes at the server entry point for all `PRISMA_*` environment variables.
- **Improved DATABASE_URL Handling**: Normalizing `DATABASE_URL` (fixing backslashes and stripping UNC) even when pre-set by the environment, ensuring robust SQLite connectivity.
- **Robust Engine Resolution**:
  - Explicitly passing `PRISMA_QUERY_ENGINE_LIBRARY` via the sidecar launcher in `desktop/src/lib.rs`.
  - **Linux Engine Scanning**: Automatically detects the correct `.so.node` engine variant instead of hardcoding a specific OpenSSL version.
- **Improved Diagnostics**: Adding detailed stack traces for initialization errors in production logs.

## Verification

- Verified on Windows environment with UNC path prefixes.
- Verified Linux engine variant detection logic.
