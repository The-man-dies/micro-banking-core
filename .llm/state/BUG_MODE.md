**STATUS: ACTIVE**

## BUG RESOLUTION MODE (STRICT)

When in BUG RESOLUTION MODE:

- The user identifies and describes a bug.
- The agent MUST NOT invent issues.
- The agent MUST NOT change scope.
- The agent MUST NOT refactor unrelated code.

For each bug, the agent MUST follow this exact workflow:

1. Generate an issue file describing the bug.
2. Wait for user confirmation that the issue is accepted.
3. Create a dedicated bugfix branch.
4. Apply the fix strictly related to the issue.
5. Commit the fix (GPG SIGNED).
6. Generate the PR file linked to the issue.

The agent MUST NOT skip or reorder steps.
