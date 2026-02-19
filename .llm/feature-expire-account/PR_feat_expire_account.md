---
name: 'feat: Expire Account Manually'
about: Implement manual account expiration for clients.
title: 'feat(client): Implement manual account expiration'
labels: ['feature', 'client']
assignees: ''
---

## Description

This PR introduces the functionality to allow an admin to manually mark a client's account as "expired." This operation is only permitted if the client's `accountBalance` is zero.

The feature is implemented across both the backend and frontend:

-   **Backend**: A new endpoint `/api/clients/:id/expire` has been added. This endpoint handles the logic for checking the account balance and updating the client's status to "expired." A corresponding transaction record is also created. The database migration logic for the `Transactions` table has been updated to include 'Expiration' as a valid transaction type.
-   **Frontend**: An "Expire Account" button has been added to the client management dashboard (within the financial operations modal). This button is conditionally enabled/disabled based on the client's account balance, and a tooltip provides appropriate guidance to the admin.

## Related Spec

-   [.llm/feature-expire-account/spec.md](.llm/feature-expire-account/spec.md)

## Changes

-   **`server/src/api/client.routes.ts`**: Added a new POST route for `/clients/:id/expire`.
-   **`server/src/controllers/client.controller.ts`**: Implemented the `expireClientAccount` function.
-   **`server/src/services/database.ts`**: Updated `runMigrations` to include 'Expiration' as a valid transaction type in the `Transactions` table schema using a migration script.
-   **`client/src/features/clients/hooks/useClients.ts`**: Added the `expireAccount` function to handle the API call.
-   **`client/src/features/clients/routes/ClientPage.tsx`**: Integrated the `expireAccount` function and passed it to `ClientTable`.
-   **`client/src/features/clients/components/ClientTable.tsx`**: Added the "Expire Account" button with conditional logic and a tooltip.

## How to Test

1.  Navigate to the client management dashboard.
2.  Select a client.
3.  Attempt to expire an account with a non-zero balance (the button should be disabled).
4.  Ensure the account balance is zero for a client.
5.  Click "Expire Account" (the button should be enabled).
6.  Verify that the client's status changes to "expired" and a success message is displayed.
7.  Check the backend logs and database to confirm a transaction of type "Expiration" was recorded.

## Screenshots (if applicable)
[Add screenshots of the UI changes here]
