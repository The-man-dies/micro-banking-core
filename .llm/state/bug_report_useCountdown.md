# Issue: Performance and Reliability Issues in `useCountdown` Hook

## Context
The `useCountdown` hook in `client/src/features/clients/hooks/useCountdown.ts` has performance and reliability issues that were flagged by code review bots but were still merged. These issues are currently impacting production.

## Identified Issues

### 1. Interval continues running after expiration (HIGH – Performance)
The `setInterval` continues to run even after the countdown has expired (`isExpired === true`). This leads to unnecessary resource consumption, repeated function calls, and performance degradation.

### 2. Unnecessary re-renders after expiration (MEDIUM – Performance)
After expiration, `calculateTimeRemaining` returns a new object every second, forcing unnecessary re-renders even though the countdown state has not changed.

### 3. Invalid `expiresAt` → NaN (HIGH – Reliability)
The hook does not validate the `expiresAt` input. If `expiresAt` is missing or malformed, `new Date(expiresAt).getTime()` results in `NaN`, leading to incorrect calculations, UI display issues, and violation of backend input handling rules.

## Affected File
`client/src/features/clients/hooks/useCountdown.ts`

## Recommended Actions
- Stop the interval once the countdown is expired.
- Return a constant object for the expired state to prevent unnecessary re-renders.
- Validate `expiresAt` before any date calculation to handle invalid inputs gracefully.
- Add a test for invalid `expiresAt` inputs.

## Priority
HIGH - These issues are impacting production and need immediate attention.