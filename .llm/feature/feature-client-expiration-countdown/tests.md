# Manual Feature Test Plan: Client Expiration Countdown Display

## Feature

Display the remaining time until account expiration for each client in the client overview, specifically within the individual client details modal (accessed via the "eye" icon).

## Goal

Verify that the countdown timer accurately displays the remaining time until `accountExpiresAt` (JJ / HH / MIN / SS) and correctly indicates when an account is expired, fetching data from the backend.

## Test Cases

### Test Case 1: Active Account - Countdown Display

1.  **Pre-conditions**:
    *   Ensure a client account exists with an `accountExpiresAt` date in the future (e.g., 2 days from now). You might need to create a new client or modify an existing one in the database directly for testing purposes.
    *   The backend is running.
    *   The frontend is running.
2.  **Steps**:
    1.  Navigate to the client overview screen.
    2.  Locate the client with the future `accountExpiresAt`.
    3.  Click the "eye" icon to open the client's details modal.
3.  **Expected Results**:
    *   The client details modal opens.
    *   A "Expiration du Compte" section is visible.
    *   The countdown is displayed in the format `JJ / HH / MIN / SS` (e.g., `02J / 15H / 30M / 20S`).
    *   The countdown visually updates every second.
    *   The countdown text color is `text-primary`.

### Test Case 2: Expired Account - "Expiré" Display

1.  **Pre-conditions**:
    *   Ensure a client account exists with an `accountExpiresAt` date in the past (e.g., 2 days ago). You might need to create a new client or modify an existing one in the database directly for testing purposes.
    *   The backend is running.
    *   The frontend is running.
2.  **Steps**:
    1.  Navigate to the client overview screen.
    2.  Locate the client with the past `accountExpiresAt`.
    3.  Click the "eye" icon to open the client's details modal.
3.  **Expected Results**:
    *   The client details modal opens.
    *   A "Expiration du Compte" section is visible.
    *   The text "Expiré" is displayed where the countdown would normally be.
    *   The countdown text color is `text-error`.

### Test Case 3: Verify Backend Data Source

1.  **Pre-conditions**:
    *   Have a network monitoring tool open (e.g., browser's DevTools Network tab).
    *   The backend is running.
    *   The frontend is running.
2.  **Steps**:
    1.  Navigate to the client overview screen.
    2.  Clear network logs in your monitoring tool.
    3.  Click the "eye" icon to open a client's details modal.
4.  **Expected Results**:
    *   Observe a network request (e.g., GET `/api/clients/:id`) in the network logs.
    *   Examine the response payload for this request.
    *   The `accountExpiresAt` field should be present in the response for the fetched client.

## Verification

Upon successful execution of all test cases, the feature can be considered implemented and verified.
