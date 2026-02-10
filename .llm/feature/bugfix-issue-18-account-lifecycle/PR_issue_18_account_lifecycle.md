## Pull Request: Implement Robust Account Lifecycle Management and Partial Withdrawals (Fixes #18)

### Description

This PR addresses Issue #18 by implementing a comprehensive account lifecycle management system and enabling partial withdrawals with strict validation. The changes cover both backend logic and frontend user experience to ensure accurate status transitions, appropriate transaction restrictions, and clear user feedback.

### Key Changes

**Backend:**

-   **`server/src/middleware/checkAccountStatus.ts`**:
    -   Removed automatic account status updates. The middleware now focuses solely on enforcing the current client status.
    -   Implemented checks to block deposit operations if the account status is `withdraw_only` or `expired`.
    -   Implemented checks to block withdrawal (payout) operations if the account status is `expired`.
-   **`server/src/services/cron.ts`**:
    -   Modified the daily cron job to correctly transition account statuses based on validity and balance:
        -   `active` accounts past their `accountExpiresAt` date with `balance > 0` are transitioned to `withdraw_only`.
        -   `active` accounts past their `accountExpiresAt` date with `balance === 0` are transitioned to `expired`.
-   **`server/src/controllers/client.controller.ts`**:
    -   Refactored the `payoutClientAccount` function to support **partial withdrawals**.
    -   Introduced strict **backend validation** for withdrawal requests:
        -   Ensures `withdrawalAmount` is strictly greater than `0`.
        -   Ensures `withdrawalAmount` is strictly less than or equal to the available `accountBalance`.
        -   Rejects requests if `withdrawalAmount` exceeds available `accountBalance` or if `accountBalance` is `0`.
    -   Updated the account status transition logic: after a withdrawal, the account status changes to `expired` **only if** the new `accountBalance` is `0` AND the account is past its `accountExpiresAt` date.
-   **`server/src/types/client.types.ts`**:
    -   Updated the `ClientType` definition to include `'withdraw_only'` in the `status` enum, resolving previous TypeScript compilation errors.

**Frontend:**

-   **`client/src/features/clients/components/FinancialOperationForm.tsx`**:
    -   Added clear display of the client's account status (translated to French: "Actif", "Retrait Uniquement", "Expiré").
    -   Implemented robust **frontend validation** for withdrawal operations:
        -   Prevents withdrawal attempts if the account balance is zero.
        -   Prevents withdrawal attempts if the entered amount exceeds the available balance.
    -   Implemented dynamic form disabling:
        -   The amount input field and the submit button are disabled when the client's status prevents the selected operation (e.g., deposits for `withdraw_only` or `expired` accounts; any operation for `expired` accounts).
        -   Informative messages are displayed to the user explaining why an operation is blocked.

### Business Rules Implemented

1.  **Transition to `withdraw_only`**: An `active` account now switches to `withdraw_only` automatically after 30 days if its balance is > 0.
2.  **Deposit Restriction**: In `withdraw_only` status, all deposit attempts are now explicitly rejected. Only withdrawals are permitted.
3.  **Final Expiration**: An account transitions to `expired` ONLY when it is past its 30-day validity AND the balance reaches exactly 0.
4.  **No Premature Expiration**: A withdrawal (partial or total) will never trigger `expired` if the balance is still > 0, regardless of the account's age.

### Testing Notes

-   **Manual Testing**: Verify account status transitions (active -> withdraw\_only -> expired) by manipulating `accountExpiresAt` and `balance` values.
-   **Withdrawal Scenarios**:
    -   Attempt full and partial withdrawals on `active` and `withdraw_only` accounts.
    -   Attempt withdrawals with amount > balance.
    -   Attempt withdrawals from zero-balance accounts.
    -   Ensure backend validation correctly rejects invalid withdrawal requests.
-   **Deposit Scenarios**:
    -   Attempt deposits on `withdraw_only` and `expired` accounts.
    -   Ensure backend validation correctly rejects invalid deposit requests.
-   **Frontend UX**: Verify that the form correctly disables and displays messages based on account status for deposit and payout operations.

### Related Issue

Closes #18
