# Issue: Windows Production Errors (bcrypt & Prisma)

## Description

The Windows application encountered two critical issues in production:

1. **Native Module Failure**: The `bcrypt` module failed because its native prebuilt binaries could not be resolved in the standalone backend executable.
2. **Database Initialization Failure**: The Prisma Client failed to initialize with a `PrismaClientInitializationError`, preventing the backend from starting completely and skipping the setup wizard.

## Root Causes

1. **Bcrypt**: Bun's compiler (`bun build --compile`) does not reliably bundle native `.node` addons in a way that remains portable across Windows environments.
2. **Prisma**:
   - **Pathing**: Windows UNC (Long Path) prefixes (`\\?\`) were not handled correctly by the Prisma Engine or the `DATABASE_URL` parser.
   - **Engine Resolution**: The bundled backend could not identify the location of the native library engine (`.node`) in the standalone environment.

## Solutions

1. **Bcrypt**: Replaced `bcrypt` with `bcryptjs` (pure JavaScript).
2. **Prisma**:
   - Implemented path normalization in `server/src/index.ts` to strip `\\?\` prefixes.
   - Normalized `DATABASE_URL` in `server/src/services/prisma.ts` to use forward slashes and a proper URI format.
   - Explicitly configured `PRISMA_QUERY_ENGINE_LIBRARY` in the sidecar launcher (`lib.rs`) to point to the bundled engine.

## Impact

- Resolves all reported startup errors on Windows 10/11.
- Ensures the "Admin Setup" wizard appears correctly on first run.
- Improves overall platform portability.
