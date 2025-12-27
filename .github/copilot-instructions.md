# Micro-Banking Core - AI Coding Guidelines

## Architecture Overview
Full-stack banking app with React client and Express server. Client uses Vite/TypeScript/Tailwind for UI with mock banking data. Server provides JWT-based admin authentication API with SQLite storage.

## Key Components
- **Server**: Express app (`server/src/app.ts`) with API routes under `/api/v1` (`server/src/api/`). Uses Winston logging, bcrypt for passwords, JWT tokens stored in SQLite.
- **Client**: Single-page React app (`client/src/`) with dashboard layout. Uses React Router, Lucide icons, Recharts for charts.
- **Database**: SQLite with Admin table for authentication. Initialized via `server/src/services/database.ts`.

## Authentication Flow
JWT access/refresh tokens. Refresh tokens stored in DB. Routes use `protect` middleware (`server/src/middleware/auth.middleware.ts`). Consistent API responses via `ApiResponse` utility (`server/src/utils/response.handler.ts`).

## Developer Workflows
- **Run server**: `cd server && npm run dev` (nodemon watches TypeScript)
- **Run client**: `cd client && npm run dev` (Vite dev server)
- **Build server**: `cd server && npm run build` (outputs to `dist/`)
- **Build client**: `cd client && npm run build` (outputs to `dist/`)
- **Create admin**: `cd server && npm run create-admin` (interactive script)
- **Lint client**: `cd client && npm run lint`

## Code Patterns
- **Server routes**: JSDoc-documented with @route, @desc, @access, @body, @response. Example: `server/src/api/admin.routes.ts`
- **Error handling**: Use `ApiResponse.error()` for consistent JSON responses with success/message/data structure
- **Logging**: Import `logger` from `server/src/config/logger.ts` for structured logs
- **Types**: Define interfaces in `server/src/types/`. Extend Express Request via `server/src/types/express.d.ts` for auth
- **Client UI**: French language, Tailwind classes, responsive grid layouts. Mock data in component files

## Environment Variables
- Server: `PORT`, `DATABASE_FILE`, `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`, `JWT_ACCESS_TOKEN_EXPIRES_IN`, `JWT_REFRESH_TOKEN_EXPIRES_IN`
- Load via `dotenv.config()` in server entry point

## Integration Notes
Client runs on separate port (5173) from server (3000). Use CORS for cross-origin requests. No proxy configured; handle API calls directly to server URL.</content>
<parameter name="filePath">c:\Users\ASUS\micro-banking-core\.github\copilot-instructions.md