# Bug: Background `/admin/status` polling incorrectly updates user activity

## Description
The frontend polls `/admin/status` on a fixed interval for session/refresh management. The Axios response interceptor currently calls `updateActivity()` for every successful response, including background polling responses. This causes background traffic to advance `lastActivity`, which can prevent inactivity auto-logout and make `isUserActive` checks unreliable.

## Root Cause
- The Axios response interceptor updates activity unconditionally on successful responses.
- Background maintenance requests (not user-initiated activity), specifically `/admin/status`, are counted as activity.

## Impact
- Inactivity timeout may not trigger when expected.
- Session state appears active due to polling, not user interaction.
- `isUserActive` logic becomes unreliable for security/session expiry behavior.

## Expected Behavior
- User activity should only be updated for requests that represent user-driven activity.
- Background/maintenance requests such as `/admin/status` should be able to opt out of activity tracking.
- Frontend handling of `/status` and `/refresh` responses should align with the actual response structure from `server/src/api/admin.route.ts`.

## Fix Required
- Extend the API request config with an activity-tracking flag (e.g., `trackActivity?: boolean`, default `true`).
- Update Axios response interceptor logic to skip `updateActivity()` when `trackActivity === false`.
- Mark `/admin/status` polling request in `AuthManager` as `trackActivity: false`.
- Review other background/maintenance requests (including refresh/sync paths) and disable activity tracking where appropriate.
- Validate client parsing against `/status` and `/refresh` payload structures defined in `server/src/api/admin.route.ts`.

## Files Likely Affected
- `client/src/services/api-client.ts`
- `client/src/features/auth/AuthManager.tsx`
- `server/src/api/admin.route.ts` (reference for payload contract validation)

## Severity
- High: It impacts inactivity enforcement and session reliability/security behavior.
