# Agent Internal State and Workflow Directory

This directory contains all artifacts generated and maintained by non-human agents (e.g., LLMs, autonomous agents) interacting with this repository. Its purpose is to:

- Preserve long-term context across sessions.
- Prevent architectural drift.
- Encode process and workflow rules.
- Allow agents to resume work after total conversational memory loss.

**All files within this directory are authoritative instructions and state for agents.**

## STRICT PROHIBITION

- This directory is NOT intended for runtime code.
- No business logic.
- No production code.
- No executable runtime artifacts.
