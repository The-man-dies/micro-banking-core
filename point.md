# Pull Request: Desktop Integration & Backend Sidecar

## Summary

This PR reorganizes the project structure to support a native desktop application powered by Tauri, with the Node.js backend running as a standalone sidecar.

## Changes

- **Directory Restructuring**: Moved `src-tauri` content to a dedicated `/desktop` folder for better module separation (`client`, `server`, `desktop`).
- **Backend Compilation**: Added `bun build --compile` scripts to `server/package.json` to generate standalone binaries for Windows, Linux, and macOS.
- **Tauri Sidecar Configuration**:
  - Registered the backend binary as a sidecar in `tauri.conf.json`.
  - Added `tauri-plugin-shell` for sub-process management.
- **Rust Implementation**:
  - Implemented automatic backend spawning on app startup.
  - Added persistent database path management: the database is now stored in the standard user data directory (`AppData`, `.local/share`, etc.) instead of the app folder.
  - Guaranteed clean process termination of the backend when the app is closed.
- **Environment**: Updated `.gitignore` and added multi-platform build instructions.

## Verification

- Verified directory movement and path resolution.
- Successul compilation of the backend binaire on Linux.
- Rust code updated to handle sidecar spawning and database persistence.
