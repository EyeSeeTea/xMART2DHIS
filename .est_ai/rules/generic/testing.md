---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Testing (base)

Stack-agnostic testing rules. DHIS2/React specifics (repository test doubles, assertion matchers, Playwright) live in [dhis2-react/testing.md](../dhis2-react/testing.md).

Applies to new code. See [scope](../README.md#scope-new-code-vs-legacy).

## What must be tested

- **Every business-domain rule has a unit test** at the domain layer (entity / value object methods). Business rules are tested at the domain layer, not only through integration or component tests.
- **Every application use case has a test when it carries logic beyond delegating to a repository.** A use case that only forwards a call to one repository does not need its own test; one that orchestrates, branches, or transforms does.
- If a change affects observable behavior, a test covering that behavior is added or updated — not just existing tests re-run.
- **Failure and edge behavior is tested explicitly**, not only the success path: errors from external systems, invalid input, empty or partial results.

## Test against behavior, not implementation

- A test asserts **observable behavior** (inputs → outputs, public API, user-visible effects), never private internals, internal state, or how the code is structured.
- A test must survive any refactor that preserves behavior. If renaming a private method or restructuring internals breaks a test, the test was coupled to the implementation — fix the test, not just the code.
- Do not reach into private fields, spy on internal calls, or assert call order unless the order *is* the observable contract.
- A test's name states the observable contract it verifies ("marks the run as failed when the server rejects the batch"), not the mechanism ("calls getStatus twice"). A reviewer can tell what broke for the user from the name alone.

## Test quality

- Assert concrete values — never only existence or truthiness when the exact value is knowable.
- Group related tests; extract shared setup into helpers; extract repeated literals into constants.
- Tests pass before a task is closed.
