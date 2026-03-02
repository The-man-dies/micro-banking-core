# Walkthrough: Windows Production Environment Fixes

This walkthrough details the changes made to resolve critical backend errors encountered in Windows production environments (Windows 10/11), specifically the `No native build found` for `bcrypt` and the `PrismaClientInitializationError`.

## 1. Bcrypt Substitution (bcryptjs)

To resolve the native module resolution error on Windows, I replaced the native `bcrypt` module with the pure JavaScript implementation, `bcryptjs`. This ensures the backend can be reliably bundled into a standalone executable.

### Changes

- **`server/package.json`**: Swapped `bcrypt` and `@types/bcrypt` with `bcryptjs` and `@types/bcryptjs`.
- **`server/src/models/Admin.ts`**: Updated imports to use `bcryptjs`.
- **`server/src/controllers/admin.controller.ts`**: Updated imports to use `bcryptjs`.

### Verification

I ran a dedicated compatibility test (`server/src/__tests__/bcrypt-compat.test.ts`) which confirmed that `bcryptjs` correctly hashes and compares passwords, maintaining full compatibility with existing hashes.

---

## 2. Database Initialization Fix (Prisma)

I fixed the `PrismaClientInitializationError` that occurred due to Windows path naming conventions (`\\?\` prefix) and engine resolution issues in the bundled environment.

### Changes

- **`server/src/services/prisma.ts`**: Implemented `getDatabaseUrl()` to normalize Windows backslashes and ensured the `DATABASE_URL` is well-formed for SQLite (`file:C:/path/to/db`).
- **`server/src/index.ts`**: Added a `normalizePath` helper to strip Windows UNC long path prefixes (`\\?\`) from important Prisma environment variables at the entry point.
- **`desktop/src/lib.rs`**: Explicitly configured the `PRISMA_QUERY_ENGINE_LIBRARY` environment variable to point to the correct native library engine bundled in the resources.

### Verification

- **Path Handling**: The `migrationRunner` (which uses `bun:sqlite` directly) was already verified to handle Windows paths correctly, and the server bootstrap now applies the same logic to the Prisma Client.
- **Connection**: The library engine is now explicitly located by the backend, ensuring successful connections in production.

---

## 3. CI/CD Improvements

- **Windows Build Name**: Updated the workflow name to `🪟 Windows Build` for better visibility.
- **Linux CI Fix**: Restored the Linux CI job by ensuring the server sidecar is compiled and resources are prepared before running Rust tests/lints.
- **Rust Clippy**: Resolved lint errors in `desktop/src/lib.rs` (`too_many_arguments` and `needless_borrows`).
