# Pull Request: Fix token refresh interval stability and response handling

## Summary
Stabilizes the token refresh interval by removing the dependency on `lastActivity` and fixes response envelope handling by accessing `.data` before using response fields.

## Motivation
The token refresh interval was constantly recreated because `lastActivity` updates on every mouse movement. This could prevent the interval from firing for active users. Additionally, the API response envelope was handled incorrectly, risking runtime errors. This PR addresses both issues. Related issue: `.llm/bug-refresh-interval-effect/issue.md`.

## Changes Made
- Read `lastActivity` from the auth store inside the interval callback.
- Remove `lastActivity` from the token refresh effect dependency list.
- Access `response.data` from the `/admin/status` response before reading `expiresAt`.

## How to Test
- Log in and keep moving the mouse; verify refresh checks still occur (watch network for `/admin/status`).
- Verify no runtime errors are thrown when reading `expiresAt`.

## Risks and Side Effects
Low risk. The interval logic is more stable and response handling is corrected.

## Screenshots (if applicable)
N/A

## Checklist
- [ ] Code follows project style guidelines.
- [ ] Tests have been added/updated to cover new functionality.
- [ ] Documentation has been updated (if necessary).
- [ ] All new and existing tests pass.

# NEXT ACTION:
# Update .llm/state/last_change_base.md once this PR is merged.
