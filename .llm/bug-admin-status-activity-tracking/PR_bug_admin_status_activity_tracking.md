# Pull Request: Prevent background auth polling from extending user activity

## Summary
Stops background `/admin/status` polling from updating `lastActivity` and aligns frontend auth parsing with the backend auth response envelope.

## Motivation
`/admin/status` is called on an interval for session checks. The Axios success interceptor previously called `updateActivity()` for every successful request, so polling traffic incorrectly kept users marked as active. This could prevent inactivity auto-logout and make `isUserActive` checks unreliable.

## Related Issue
- `.llm/bug-admin-status-activity-tracking/issue.md`

## Backend Contract Validation
Validated against backend auth controllers/routes:
- `server/src/controllers/admin.controller.ts`
- `server/src/api/admin.routes.ts`

Observed backend response contract:
- `/admin/login`: `{ success, message, data: { accessToken, refreshToken } }`
- `/admin/refresh`: `{ success, message, data: { accessToken } }`
- `/admin/status`: `{ success, message, data: { user, expiresAt, expiresIn } }`

## Changes Made
- `client/src/services/api-client.ts`
  - Added `trackActivity?: boolean` to Axios request config.
  - Updated response interceptor to call `updateActivity()` only when `trackActivity !== false`.
- `client/src/features/auth/AuthManager.tsx`
  - Updated `/admin/status` call to pass `{ method: "GET", trackActivity: false }`.
  - Aligned status response typing to backend envelope/data shape.
- `client/src/features/auth/useAuthStore.ts`
  - Switched to the shared `api` wrapper import.
  - Aligned `/admin/refresh` and `/admin/status` handling to backend envelope/data shape.
  - Marked `/admin/refresh` and `/admin/status` calls as `trackActivity: false`.
- `client/src/features/auth/routes/LoginPage.tsx`
  - Switched to the shared `api` wrapper import.
  - Aligned login response parsing to backend envelope/data shape.

## Commit
- `e694a58` (`fix(auth): align auth API contract and ignore background activity`)

## How to Test
1. Log in and stay idle (no mouse/keyboard/click activity).
2. Confirm `/admin/status` still polls on schedule.
3. Confirm polling no longer advances `lastActivity`.
4. Confirm inactivity logout triggers based on real user activity only.
5. Confirm login and refresh flows still succeed with backend response envelopes.

## Risks and Side Effects
Low risk. Changes are scoped to auth request activity tracking and auth response parsing.
