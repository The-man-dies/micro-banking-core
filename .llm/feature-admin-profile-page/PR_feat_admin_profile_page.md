# Pull Request: Implement Admin Profile Page (Frontend)

## Summary
Implements the frontend admin profile page to fetch and display authenticated admin data from `GET /api/v1/admin/profile`.

## Spec Reference
- `.llm/feature-admin-profile-page/spec.md`

## Scope
- Frontend-only implementation in admin profile route page.
- Replaces placeholder content with real data loading from backend profile endpoint.
- Adds loading, success, and error UI states.
- Aligns frontend data expectations with backend profile payload returned by `req.admin`.

## Out of Scope
- Backend changes.
- Authentication flow redesign.
- Password update feature.
- Unrelated frontend refactors.

## Changes Made
- `client/src/features/admin/routes/AdminProfilePage.tsx`
  - Added profile fetch on mount using shared `api` client.
  - Added backend-aligned profile type (`id`, `username`, optional JWT `iat`/`exp`).
  - Added loading and error handling states.
  - Added profile detail display for ID, username, token issued time, and token expiration time.

## Commit
- `07a5144` `feat(admin-profile): implement frontend admin profile page`

## Validation
- `npm --prefix client run build` passes.

## LLM Artifacts
- `.llm/feature-admin-profile-page/spec.md`
- `.llm/feature-admin-profile-page/PR_feat_admin_profile_page.md`
