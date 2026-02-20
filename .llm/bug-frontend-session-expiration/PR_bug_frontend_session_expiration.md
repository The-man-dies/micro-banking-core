---
name: 'fix: Frontend Session Expires Too Early'
about: Implements a robust, activity-based session management system to prevent premature logouts.
title: 'fix(auth): Implement Zustand auth store and activity-based session refresh'
labels: ['bugfix', 'authentication', 'frontend']
assignees: ''
---

## Description

This PR resolves the "Frontend session expires too early" bug by implementing a new authentication architecture centered around a Zustand store, `sessionStorage` for refresh tokens, and a proactive, activity-based session refresh mechanism.

The previous implementation relied solely on `accessToken` expiration and cleared session data on every `401`, leading to unexpected logouts for active users. The new architecture ensures a seamless user experience by intelligently managing token lifecycles.

## Key Changes & Architecture

1.  **Zustand Auth Store (`client/src/features/auth/useAuthStore.ts`)**:
    *   Created a new Zustand store to centralize authentication state (`accessToken`, `refreshToken`, `lastActivity`, `isAuthenticated`).
    *   `accessToken` is stored in-memory, while `refreshToken` is persisted in `sessionStorage` using Zustand's `persist` middleware.
    *   Exposes methods: `setAccessToken`, `setRefreshToken`, `updateActivity`, `logout` (clears state and calls backend `/admin/logout`), `refreshSession` (calls backend `/admin/refresh`), and `getSessionStatus` (calls backend `/admin/status`).

2.  **`AuthManager` Component (`client/src/features/auth/AuthManager.tsx`)**:
    *   This component wraps the main application (`App.tsx`) and is responsible for:
        *   Listening to global user activity events (`mousemove`, `keydown`, `click`) and calling `useAuthStore.getState().updateActivity()`.
        *   Periodically checking (`setInterval`) the `accessToken`'s proximity to expiration (via `/admin/status`).
        *   Proactively calling `useAuthStore.getState().refreshSession()` if the user is active and the `accessToken` is nearing expiration.
        *   If the user is inactive, the session is allowed to expire naturally.
        *   Handles refresh failures by triggering `logout()`.

3.  **Refactored `api-client.ts` (`client/src/services/api-client.ts`)**:
    *   Stripped of all complex session management logic, refresh queues, and retry mechanisms.
    *   Its request interceptor now retrieves the `accessToken` directly from `useAuthStore.getState()`.
    *   Its response interceptor strictly handles `401` Unauthorized errors by immediately triggering `useAuthStore.getState().logout()`, ensuring a clean and consistent logout path if proactive refresh fails or is not applicable.

4.  **`LoginPage.tsx` Integration (`client/src/features/auth/routes/LoginPage.tsx`)**:
    *   Updated to use `useAuthStore` for setting `accessToken` and `refreshToken` upon successful login, replacing direct `localStorage` manipulation.

5.  **`ProtectedRoute.tsx` Update (`client/src/components/ProtectedRoute.tsx`)**:
    *   Modified to derive `isAuthenticated` directly from `useAuthStore`, ensuring accurate route protection based on the centralized authentication state.

## Related Issue

-   [.llm/bug-frontend-session-expiration/issue.md](.llm/bug-frontend-session-expiration/issue.md)

## How to Test

1.  **Login**: Log into the application as an admin.
2.  **Verify Session Persistence (Refresh Page)**:
    *   Refresh the browser page. The user should remain logged in.
    *   Close and reopen the browser tab (without clearing `sessionStorage`). The user should remain logged in.
3.  **Verify Activity-Based Refresh**:
    *   Keep the browser tab active and interact with the application (mouse movements, clicks, typing).
    *   Monitor network requests. You should observe `POST /admin/refresh` calls occurring proactively before the `accessToken` expires, but *only* when activity is detected.
    *   The `accessToken` in the `useAuthStore` should update.
4.  **Verify Inactivity-Based Expiration**:
    *   Log in and then leave the browser tab idle for longer than the `INACTIVITY_THRESHOLD_MS` (e.g., 10 minutes, configurable in `AuthManager.tsx`).
    *   After the threshold, try to interact with the app or make an API call. You should be redirected to the login page (as the `accessToken` would have expired without a refresh).
5.  **Verify Forced Logout**:
    *   Manually clear the `refreshToken` from `sessionStorage` via browser developer tools.
    *   Attempt an API call. You should be logged out.
    *   Ensure the backend `/admin/logout` endpoint is called.
6.  **Verify `ProtectedRoute`**:
    *   After logging in, navigate to protected routes (e.g., `/dashboard`). Access should be granted.
    *   After logging out, attempting to access protected routes should redirect to `/login`.

## Screenshots (if applicable)
[Add screenshots of the UI changes here, especially to demonstrate session continuity]
