---
author: est-ai
profile: dhis2-react
version: "0.1.0"
generatedBy: "0.1.0"
---

# Testing — DHIS2 / React specifics

DHIS2/React testing rules on top of [generic/testing.md](../generic/testing.md).

Applies to new code. See [scope](../README.md#scope-new-code-vs-legacy).

## Unit & use-case tests

- Use-case tests use a **test double of the repository** (a `XTestRepository` implementing the same interface), not a mock of `D2Api`.
- Domain and use-case tests do not import from `data/` or any infrastructure module.
- Assert with `toEqual` / `toBe`, not `toBeDefined` / `toBeTruthy`, when the exact value is knowable. Group with `describe`.

## Playwright (E2E)

Playwright is the E2E tool for new projects. A project that already uses another one (e.g. Cypress) keeps it ([scope](../README.md#scope-new-code-vs-legacy)); the principles below apply to any tool.

The generic "test against behavior, not implementation" principle, applied to E2E:

- Query by **accessibility**, not implementation: `getByRole`, `getByLabel`, `getByText`. Avoid CSS selectors, test ids, or DOM-structure coupling — they bind the test to markup details, not to what the user perceives.
