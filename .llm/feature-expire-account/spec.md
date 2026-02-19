# Feature: Expire Account Manually

## Goal:
Allow an admin to mark a client account as "expired" with a single click, but **only if the account balance is zero**.

## Scope / Non-goals:
### Scope:
- Backend endpoint to update the account status to "expired".
- Frontend button/action in the admin client management dashboard.
- Validation to ensure account balance = 0 before status change.

### Non-goals:
- Changing payment logic.
- Affecting expiration rules for accounts with non-zero balance.
- Refactoring unrelated backend or frontend code.

## User-visible Behavior:
- Admin navigates to a client account in the dashboard.
- If the client balance is 0, an "Expire Account" button is enabled.
- Clicking the button sets the account status to "expired".
- If the balance > 0, the button is disabled or an error message is shown.
- UI feedback confirms the operation: "Account successfully expired".