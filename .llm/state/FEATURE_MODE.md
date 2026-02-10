# FEATURE IMPLEMENTATION MODE (STRICT)

This document defines the strict workflow for implementing a new feature in the repository.

## Key Principles

- The user identifies and describes a feature.
- The agent MUST NOT invent features.
- The agent MUST NOT change scope.
- The agent MUST NOT refactor unrelated code.
- All LLM-generated artifacts MUST go under `.llm/feature-<feature-name>/`.

---

## Workflow Steps

### 1️⃣ Generate a Feature Spec File

- Create `.llm/feature-<feature-name>/spec.md`.
- Include in the spec:
  - Feature name
  - Goal
  - Scope / Non-goals
  - User-visible behavior
- The agent MUST NOT add unrelated functionality.

### 2️⃣ Wait for User Confirmation

- The agent MUST wait until the user confirms the feature spec before proceeding.

### 3️⃣ Create a Dedicated Feature Branch

- Branch name format: `feat/<feature-name>`
- Branch MUST be created from a stable main branch.
- No unrelated commits are allowed.

### 4️⃣ Implement the Feature

- Strictly implement the feature described in the spec.
- Place any LLM-generated artifacts in `.llm/feature-<feature-name>/`.
- The agent MUST NOT:
- Refactor unrelated code
- Fix unrelated bugs

### 5️⃣ Optional: Feature Tests

- Create manual or automated tests if needed.
- Test files can go under `.llm/feature-<feature-name>/tests.md`.
- Testing is recommended but not mandatory.

### 6️⃣ Commit the Feature

- Commit all changes **atomically**.
- Commit MUST follow Conventional Commit format: `feat(<scope>): <short description>`
- Commit MUST be **GPG signed** if the repo requires it.

### 7️⃣ Generate the PR File

- Create a PR template referencing `.llm/feature-<feature-name>/spec.md`.
- Include in the PR description:
- Summary of the feature
- Scope
- Optional LLM artifacts location
- The PR MUST NOT include unrelated changes.

---

## ⚠️ Key Rules

1. Feature = a single, well-scoped addition.
2. LLM artifacts are separate from production code (`.llm/`).
3. Workflow MUST NOT skip or reorder steps.
4. Each feature MUST be committed atomically for traceability.
5. Branches MUST NOT be deleted automatically by the agent.
6. LLM artifacts MUST NOT be archived automatically.
