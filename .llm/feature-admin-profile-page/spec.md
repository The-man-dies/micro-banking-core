# Feature Spec: Admin Profile Page (Frontend Only)

## Feature Name
Admin Profile Page implementation using backend `GET /api/v1/admin/profile`.

## Goal
Implement the frontend admin profile page so it fetches and displays authenticated admin profile information from the existing backend `/admin/profile` endpoint.

## Scope
- Frontend-only implementation.
- Replace the placeholder UI in `client/src/features/admin/routes/AdminProfilePage.tsx` with a functional profile view.
- Fetch profile data using the existing frontend API client.
- Handle loading, success, and error states for profile retrieval.
- Align frontend profile typing/parsing with backend response shape from `/admin/profile`.

## Non-Goals
- No backend code changes.
- No auth flow redesign.
- No unrelated UI refactors outside the admin profile page.
- No password change implementation unless backend endpoint already exists and is explicitly requested (not in this feature).

## Backend Contract Reference (Read-Only)
From `server/src/api/admin.routes.ts`, route:
- `GET /api/v1/admin/profile` (protected)
- Current implementation returns `res.json(req.admin)` from JWT payload.

Frontend should therefore expect profile fields coming directly from the decoded token payload (at minimum `id` and `username`, and possibly standard JWT fields such as `iat`/`exp`).

## User-Visible Behavior
- When the user opens `/profile`, the page loads admin profile data from backend.
- While request is in progress, a loading state is shown.
- On success, admin information (at minimum ID and username) is displayed clearly.
- On failure (e.g., unauthorized/network error), a clear error message is shown.

## Implementation Constraints
- Keep changes limited to frontend files required for this page.
- Reuse existing project patterns (`api` wrapper, current routing/store setup).
- Do not modify unrelated components or backend files.
