## PR: Fix(countdown): Resolve performance and reliability issues in useCountdown hook

**Issue:** #22

**Description:**
This PR addresses critical performance and reliability issues within the `useCountdown` hook, located at `client/src/features/clients/hooks/useCountdown.ts`. These issues were previously identified by code review bots but persisted into production, causing unnecessary resource consumption, redundant re-renders, and unpredictable behavior due to invalid input handling.

**Changes Introduced:**

1.  **Stop Interval on Expiration:**
    *   The `useEffect` hook now conditionally sets up the `setInterval`. The interval is cleared and not re-established once the `countdown.isExpired` state becomes `true`. This prevents the timer from continuously running in the background after the countdown has finished, significantly reducing CPU usage and unnecessary computation.

2.  **Prevent Unnecessary Re-renders:**
    *   A constant `EXPIRED_COUNTDOWN` object has been introduced. The `calculateTimeRemaining` function now returns this predefined constant when the countdown reaches zero or less. This ensures that when the countdown expires, the same object reference is returned, preventing React from triggering superfluous re-renders due to object identity changes.

3.  **Robust `expiresAt` Validation:**
    *   Added explicit input validation for the `expiresAt` parameter within the `calculateTimeRemaining` function. If `new Date(expiresAt).getTime()` evaluates to `NaN` (indicating an invalid or malformed date string), the hook now immediately returns the `EXPIRED_COUNTDOWN` state. This prevents `NaN` values from propagating through calculations and appearing in the UI, enhancing the reliability and predictability of the countdown feature.

**Impact:**
These changes collectively improve the performance of the client application by reducing unnecessary computations and re-renders, enhance the reliability of the `useCountdown` hook by gracefully handling invalid inputs, and ensure a more stable and accurate user interface for the client expiration countdown.
