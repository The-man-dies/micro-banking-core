## Pull Request: Implement Client Account Expiration Countdown Display

### Summary

This PR introduces a new feature to display a real-time countdown until a client's account expires. This countdown is visible within the individual client details modal, providing users with a clear visual indication of the remaining validity period.

### Scope

The feature strictly adheres to the approved specification (`.llm/feature-client-expiration-countdown/spec.md`):

-   **Backend**: Confirmed that `accountExpiresAt` is already exposed by existing `getClientById` and `getAllClients` endpoints, and is part of the `ClientType`. No direct backend code modifications were necessary for data exposure.
-   **Frontend**:
    -   A new React hook `useCountdown` has been created to calculate and format the remaining time (JJ / HH / MIN / SS).
    -   This hook is integrated into the client details modal (`client/src/features/clients/components/ClientTable.tsx`), where the countdown dynamically updates in real-time.
    -   The display indicates "Expiré" when the account expiration date has passed.
    -   The UI changes are strictly confined to the client details modal.

### User-Visible Behavior

-   When a user clicks the "eye" icon next to a client in the client overview, opening their individual details view.
-   Within this specific client's details view, a dynamically updating countdown is displayed, showing the time remaining until their `accountExpiresAt` timestamp.
-   The format is `JJ / HH / MIN / SS`.

### LLM Artifacts Location

-   Feature Specification: `.llm/feature-client-expiration-countdown/spec.md`
-   Manual Test Plan: `.llm/feature-client-expiration-countdown/tests.md`

### Related Issue

Closes #<ISSUE_NUMBER> (Please replace <ISSUE_NUMBER> with the actual issue number if applicable)
