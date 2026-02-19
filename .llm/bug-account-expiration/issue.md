# Bug Report: Account Expiration, Renewal, and UI Issues

## 1. Bug: Account expiration service startup crash

### Description
The application crashes at server startup due to an error in the account expiration check service. The log message indicates an `SQLITE_ERROR: no such column: balance`.

### Root Cause
The `server/src/services/cron.ts` file, responsible for the account expiration check, is referencing a database column named `balance` which does not exist. The correct column name in the `Client` table is `accountBalance`.

### Impact
The account expiration service fails to start, preventing automatic expiration of client accounts. This can lead to accounts remaining active past their expiration date even when they should have expired.

### Fix Required
Modify `server/src/services/cron.ts` to use the correct column name (`accountBalance`) when performing the account expiration check. Ensure the service starts and runs without encountering this SQL error.

---

## 2. Bug: Renew expired account request fails

### Description
When attempting to renew an expired account, the request fails with the error response:
```json
{
  "success": false,
  "message": "Invalid input data",
  "error": [
    "body: Invalid input: expected object, received undefined"
  ]
}
```

### Root Cause
The renewal endpoint is expecting an object in the request body, but it is receiving `undefined` or an invalid body structure. This indicates an issue with how the frontend is sending data or how the backend is validating it. Specifically, the `renewSchema` in `server/src/schemas/client.schema.ts` expects a `fraisReactivation` field.

### Impact
Administrators are unable to renew expired accounts through the frontend, leading to workflow interruptions and potential loss of revenue from inactive accounts.

### Fix Required
1.  **Frontend**: Ensure `client/src/features/clients/hooks/useClients.ts` passes the `fraisReactivation` (reactivation fee) when calling the renew endpoint.
2.  **Backend**: Validate the request body properly using `server/src/schemas/client.schema.ts`. Ensure the input is an object with all required fields for renewing an account. Return clear error messages if validation fails.

---

## 3. Optimization: Disable "Expire Account" button for already expired clients

### Description
In the admin dashboard, the "Expire Account" button remains active even for clients whose accounts are already marked as "expired."

### Root Cause
The conditional logic for enabling/disabling the "Expire Account" button (`client.accountBalance !== 0`) does not account for the client's current status.

### Impact
While not blocking, this leads to an inconsistent user experience and could result in unnecessary server calls if an admin attempts to expire an already expired account.

### Fix Required
Modify the frontend logic in `client/src/features/clients/components/ClientTable.tsx` to disable the "Expire Account" button if the client's `status` is already "expired," in addition to the existing check for `accountBalance`.