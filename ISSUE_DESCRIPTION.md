# Bug Report: Missing Transactions Route and NaN Display in UI

This document outlines two distinct issues that were identified and resolved.

---

### Issue 1: Missing API Endpoint for Transactions

**Symptom:**
The "Transactions" page in the client application fails to load data, and the browser's developer tools show a `404 Not Found` error for a `GET` request to `/api/v1/transactions`.

**Root Cause:**
The server-side application was missing the implementation for the `GET /api/v1/transactions` endpoint. The necessary route, controller, and data access method in the model did not exist, leading to the 404 error.

---

### Issue 2: `NaN` Displayed on Dashboard and Accounting Pages

**Symptom:**
On the "Dashboard" and "Comptabilité" pages, several Key Performance Indicator (KPI) cards that should display monetary values are showing `NaN` (e.g., `NaNM FCFA`) instead of `0.0M FCFA`, especially on initial page load.

**Root Cause:**
The components were attempting to perform a mathematical division on a value that was `undefined` before the API data had fully loaded (e.g., `undefined / 1000000`). The code used a nullish coalescing operator (`??`) *after* the division, which is too late to prevent the `NaN` result. The calculation must be performed on a valid number.
