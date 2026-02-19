---
name: 'fix: Resolve Account Expiration, Renewal, and UI Issues'
about: Fixes multiple bugs related to client account expiration, renewal, and UI display inconsistencies.
title: 'fix(client): Resolve account expiration, renewal, and UI display issues'
labels: ['bugfix', 'client']
assignees: ''
---

## Description

This PR addresses several critical bugs and an optimization related to the client account management, specifically focusing on expiration, renewal, and their corresponding UI displays.

The following issues are resolved:

1.  **Account expiration service startup crash**: The automatic account expiration cron job was failing at server startup due to an incorrect database column reference (`balance` instead of `accountBalance`). This has been corrected in `server/src/services/cron.ts`.
2.  **Renew expired account request fails**: The renewal endpoint was failing because the `fraisReactivation` (reactivation fee) was not being sent from the frontend. This has been fixed by:
    *   Updating `client/src/features/clients/hooks/useClients.ts` to pass `fraisReactivation` in the renewal API call.
    *   Updating `client/src/features/clients/routes/ClientPage.tsx` to correctly pass the amount to the `renewAccount` function.
    *   Modifying `client/src/features/clients/components/FinancialOperationForm.tsx` to collect and pass the `fraisReactivation` for renewal operations.
3.  **Optimization: Disable "Expire Account" button for already expired clients**: The "Expire Account" button was active even for clients whose accounts were already expired. This has been addressed in `client/src/features/clients/components/ClientTable.tsx` by conditionally disabling the button if the client's `status` is already "expired".
4.  **Countdown display for expired accounts**: The countdown timer was incorrectly displaying for accounts with an "expired" status. This has been fixed by:
    *   Updating `client/src/features/clients/hooks/useCountdown.ts` to accept the client's status and immediately return an "expired placeholder" if the status is "expired", bypassing any timer calculations.
    *   Updating `client/src/features/clients/components/ClientTable.tsx` to pass the client's status to the `CountdownDisplay` component.

All fixes maintain compatibility with the existing cron expiration logic and backend functionality without introducing breaking changes.

## Related Issue

-   [.llm/bug-account-expiration/issue.md](.llm/bug-account-expiration/issue.md)

## Changes

-   `server/src/services/cron.ts`: Corrected column name for account balance checks.
-   `client/src/features/clients/hooks/useClients.ts`: Updated `renewAccount` to accept and pass `fraisReactivation`.
-   `client/src/features/clients/routes/ClientPage.tsx`: Modified `handleFinancialOperationSubmit` to pass the amount for renewal.
-   `client/src/features/clients/components/FinancialOperationForm.tsx`: Ensured `fraisReactivation` is collected and passed for renewal operations.
-   `client/src/features/clients/components/ClientTable.tsx`: Added logic to disable the "Expire Account" button for already expired clients and passed client status to `CountdownDisplay`.
-   `client/src/features/clients/hooks/useCountdown.ts`: Implemented early exit and placeholder display for expired accounts.

## How to Test

1.  **Verify Account Expiration Service:**
    *   Start the server and check logs for "Error running account expiration check". Ensure it starts cleanly without the SQL error.
    *   Create an active client with `accountBalance = 0` and `accountExpiresAt` in the past.
    *   Observe if the cron job correctly transitions the status to "expired".
2.  **Verify Renew Expired Account:**
    *   Create an expired client.
    *   Attempt to renew the account from the admin dashboard, providing a reactivation fee.
    *   Ensure the renewal is successful and the account status becomes "active" with a new expiration date.
    *   Test with invalid/missing `fraisReactivation` to ensure proper error messages.
3.  **Verify "Expire Account" Button Logic:**
    *   Navigate to the client dashboard.
    *   For an active client with `accountBalance > 0`, the "Expire Account" button should be disabled.
    *   For an active client with `accountBalance = 0`, the "Expire Account" button should be enabled. Click it and confirm the account expires.
    *   For an already expired client, the "Expire Account" button should be disabled with the correct tooltip.
4.  **Verify Countdown Display:**
    *   For an active or `withdraw_only` client, the countdown should display correctly.
    *   For an expired client, the countdown area should display "Expiré" (or the defined placeholder) and not an active timer.
