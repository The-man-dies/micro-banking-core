# Bug: Token refresh effect resets too often and API response handling is incorrect

## Description
The `useEffect` hook that manages token refresh depends on `lastActivity`. Because `lastActivity` updates on every mouse movement, the effect is continuously torn down and recreated, which can prevent the interval from firing for very active users. Additionally, the API response envelope is not handled correctly; the response expects a `.data` property, but it is not consistently accessed.

## Root Cause
- `lastActivity` is in the `useEffect` dependency list, causing frequent effect teardown and interval recreation.
- The API response from `api` is used without consistently accessing `.data`.

## Impact
- Token refresh checks may never run for active users, leading to missed refreshes or unexpected logout.
- Potential runtime errors when accessing response fields without `.data`.

## Expected Behavior
- The interval should be stable and should read `lastActivity` inside the interval callback.
- The API response should be handled by accessing `.data` before using response values.

## Fix Required
- Refactor the interval logic to remove `lastActivity` from effect dependencies while reading it inside the interval callback.
- Ensure response fields are accessed via `response.data`.

## Files Likely Affected
- `client/src` authentication/session management files
- API client usage in the token refresh effect

## Severity
- High: It can prevent token refresh from occurring for active users and cause runtime errors.

