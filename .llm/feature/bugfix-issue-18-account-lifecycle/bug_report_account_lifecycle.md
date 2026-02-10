## Bug Report: Incorrect Account Lifecycle Transitions

### Description

The automated account lifecycle currently transitions accounts to an `expired` status prematurely or incorrectly according to the business rules.

### Current Issues

1.  **Premature Expiration on Withdrawal**: When a user performs a withdrawal, the account status is switched to `expired` even if it was only a partial withdrawal (or regardless of balance in some flows).
2.  **Immediate Expiration after 30 Days**: After the 30-day validity period, the system immediately marks the account as `expired`.
3.  **Incorrect Deposit Permission**: Deposits are sometimes allowed when they should be restricted.

### Expected Behavior

-   **Account Expiration**: A user account must **never** expire while the balance is greater than zero.
-   **Withdraw-Only Transition**: After 30 days of validity, the account must transition to a `withdraw_only` status.
-   **Deposit Restriction**: In `withdraw_only` mode, no new deposits are allowed. Only withdrawals are permitted.
-   **Final Expiration**: The account must only be marked as `expired` once the balance reaches exactly zero.

### Affected Components

-   **Backend Controllers**: `server/src/controllers/client.controller.ts` (payout logic)
-   **Backend Services**: `server/src/services/cron.ts` (daily expiration check)
-   **Backend Middleware**: `server/src/middleware/checkAccountStatus.ts` (per-request status check)
-   **Frontend Components**: `client/src/features/clients/components/FinancialOperationForm.tsx` (blocking deposits)

## Steps to Reproduce

1.  Create/Renew a client (Status: `active`).
2.  Wait 30 days (or mock the date in DB).
3.  Observe status becomes `expired` instead of `withdraw_only`.
4.  Perform a partial withdrawal.
5.  Observe status stays/becomes `expired` despite remaining balance.
