# Bug Fixes & Refactoring: Client Form, Type Errors, Code Review, and DB Name

This document outlines several issues that were addressed, ranging from non-functional UI components and TypeScript errors to implementing feedback from a code review and fixing a critical server configuration bug.

---

### Issue 1: Non-functional Client Creation and Operation Forms

**Symptom:**
On the `/client` page, attempting to create a new client or perform a financial operation (deposit, payout, renew) would display a non-interactive placeholder form instead of the fully functional component.

**Root Cause:**
The main page component, `ClientPage.tsx`, was defining local, non-functional placeholder versions of `ClientTable`, `ClientForm`, and `FinancialOperationForm`. It was failing to import the real, implemented components from their corresponding files in the `src/features/clients/components/` directory.

---

### Issue 2: TypeScript Errors on `ClientPage.tsx`

**Symptom:**
After fixing the component imports, `ClientPage.tsx` displayed TypeScript errors related to incompatible props passed to `ClientForm` and `FinancialOperationForm`.

**Root Cause:**
There was a mismatch between the function signatures expected by the child components' `onSubmit` props and the actual signatures of the functions being passed from the `useClients` data hook. For example, `updateClient` expected `(id, data)` while the form provided `(data, id)`.

---

### Issue 3: Code Review Feedback Implementation

This work also addressed several points from a recent code review to improve code quality and fix a backend data issue.

1.  **Backend Data Incoherence (High):** The `GET /transactions` endpoint was not providing the `agentId` for each transaction, which is required by the frontend UI.
2.  **Frontend Maintainability (Medium):** Duplicated formatting logic and "magic numbers" (e.g., `1000000`) were found in the `DashboardPage` and `ComptabilitePage` components, making the code harder to maintain.

---

### Issue 4: Incorrect Database Name Used by Server

**Symptom:**
The server was creating and using a database file named `database.db` instead of `micro_banking.db` as specified in the `server/.env` file.

**Root Cause:**
The `dotenv.config()` call, which loads environment variables, was occurring after application modules were imported. Because the database module (`database.ts`) was imported before `dotenv` ran, it did not see the `DATABASE_FILE` variable and fell back to the default hardcoded value.
