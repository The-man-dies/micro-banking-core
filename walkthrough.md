# Walkthrough: Windows Production Database Fix

This walkthrough details the changes made to resolve the `PrismaClientInitializationError` encountered in Windows production environments.

## 1. Prisma Engine Migration (Binary Engine)

To resolve engine resolution errors on Windows, I switched the Prisma engine type from `library` to `binary`. This is more reliable for applications bundled into standalone executables.

### Changes

- **`server/prisma/schema.prisma`**: Set `engineType = "binary"` and added `windows` to `binaryTargets`.
- **`desktop/src/lib.rs`**: Implemented a robust scanning mechanism that detects any engine file (binary or library) in the resources and sets both `PRISMA_QUERY_ENGINE_LIBRARY` and `PRISMA_QUERY_ENGINE_BINARY`.

---

## 2. Universal Path Normalization

I ensured that all Prisma-related environment variables and the database URL are correctly normalized to handle Windows UNC path prefixes and backslashes.

### Changes

- **`server/src/index.ts`**: Refactored the path normalization logic into a loop and included `PRISMA_QUERY_ENGINE_BINARY`.
- **`server/src/services/prisma.ts`**: Updated `getDatabaseUrl` to normalize the path even when pre-set by the environment.

---

## 3. Verification

- **Path Handling**: Verified that `\\?\` prefixes are stripped and backslashes are converted to forward slashes for the SQLite connection.
- **Engine Resolution**: Verified that the sidecar correctly identifies and points the backend to the bundled engine file.
