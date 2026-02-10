# Feature Specification: Client Expiration Countdown Display (Corrected)

## Feature Name

Client Expiration Countdown Display

## Goal

To provide a clear, real-time visual indication of the remaining time until a *specific client's account* expires. This countdown will be displayed within their individual client details view (accessed by clicking the "eye" icon in the client overview), ensuring accuracy by sourcing the data reliably from the backend.

## Scope

### Backend Responsibility (Mandatory)

-   **Expose Account Expiration Data**: The backend *must* ensure that the `accountExpiresAt` timestamp for each client is returned in API responses. This will be achieved by:
    -   **Modifying an existing endpoint**: The `getClientById` endpoint (and potentially `getAllClients` for consistency) *will be modified* to include `accountExpiresAt` in its response payload.
    -   Alternatively, if deemed more appropriate during implementation (e.g., for performance or separation of concerns), a *new dedicated endpoint* returning expiration-related data for clients *will be added*.
-   **Source of Truth**: The backend will serve as the authoritative source of truth for all account expiration data, and its exposure is a mandatory part of this feature's implementation.
-   **No Business Logic Change**: There will be *no* modification to existing account expiration business rules or status transition logic. The backend's role is strictly data exposure for this feature.

### Frontend Responsibility

-   **Data Consumption**: When the client details view is opened (e.g., via the "eye" icon), the frontend *must* call the appropriate backend endpoint (e.g., `getClientById`) to retrieve the `accountExpiresAt` data for the *viewed client*.
-   **Countdown Computation**: The frontend will compute the remaining time (JJ / HH / MIN / SS) until expiration based on the `accountExpiresAt` value received from the backend. This computation will occur entirely client-side *after* fetching the data.
-   **Display**: The computed remaining time will be displayed exclusively within the **client details modal/page** that opens when a user clicks the "eye" icon for a specific client. It will **not** be displayed in the main client table or global client list.

### General Scope

-   **Feature Visibility**: While the countdown display is client-side visible, the implementation of this feature *requires mandatory backend changes* to expose the necessary `accountExpiresAt` data.
-   **Client Overview Screen Context**: The feature operates within the context of the client overview screen, specifically when drilling down into individual client details.
-   **Display Feature**: The implementation focuses on calculating and rendering the remaining time.

## Non-Goals

-   **No Change to Account Expiration Rules**: This feature will NOT alter any existing backend business logic related to account expiration, status transitions, or any other core account management rules.
-   **No Automatic Actions**: The countdown display itself will not trigger any automatic actions on client accounts (e.g., sending notifications, changing status).
-   **No Unrelated Refactoring**: No unrelated code refactoring or bug fixes are to be performed as part of this feature.
-   **No UI Outside Specific Client Details View**: No user interface changes will be made outside the designated client details modal/page.
-   **NOT to be displayed in the main client table or global list of clients.**

## User-Visible Behavior

-   When a user navigates to the client overview screen and clicks the "eye" icon next to a client's entry, opening their individual details view.
-   Within this specific client's details view, a dynamically updating countdown will be displayed.
-   The countdown will show the time remaining until *that specific client's* `accountExpiresAt` timestamp, which is reliably provided by the backend's client retrieval endpoint.
-   The format of the countdown will be `JJ / HH / MIN / SS`, representing days, hours, minutes, and seconds respectively.
-   The countdown will dynamically update in real-time, based on the backend-provided `accountExpiresAt` value.
-   The display should be intuitive and easy to read.