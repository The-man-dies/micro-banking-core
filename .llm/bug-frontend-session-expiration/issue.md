# Bug: Frontend session expires too early

## Description
The frontend currently manages user sessions using only the `accessToken`. If the `accessToken` expires while the user is still active, the frontend does **not** call the refresh endpoint to obtain a new token. As a result, users are logged out prematurely even though they are actively interacting with the app.

## Root Cause
- The frontend relies solely on the `accessToken` expiration.
- No mechanism exists to request a refreshed token via the refresh token when the user is active.
- This leads to unexpected session termination.

## Impact
- Active users may be logged out unexpectedly.
- Any ongoing operations may fail or be interrupted.
- Negative user experience.

## Expected Behavior
- While the user is active, the frontend should automatically request a new `accessToken` before it expires using the refresh endpoint.
- Only log out users when both `accessToken` and refresh token are invalid/expired or user manually logs out.

## Fix Required
- Update the frontend session management logic:
  1. Track `accessToken` expiration.
  2. If the user is active and token is near expiration, call the refresh endpoint to obtain a new `accessToken`.
  3. Replace the old token and continue the session without logging out the user.
- Ensure this does **not** affect other authentication or logout flows.

## Files Likely Affected
- `client/src/services/api-client.ts`
- Session management hooks or context
- Components that rely on `accessToken` for API calls

## Severity
- High: It directly affects user experience and session reliability.