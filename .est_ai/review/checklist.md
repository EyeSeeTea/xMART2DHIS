---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Review checklist

Verify before committing. Applies to any task that adds or modifies code

This checklist **verifies** — it does not restate the rules. The invariants live in [`../rules/`](../rules/); each section below points at the rule file it checks. Read those for the *why*; use this list to confirm the result complies.

Scope reminder: rules apply to **new code**; legacy is respected and only migrated in a deliberate, bounded refactor — see [rules scope](../rules/README.md#scope-new-code-vs-legacy).

---

## EyeSeeTea rules compliance

Confirm the changed code obeys every rule file that applies to **this project's** axes — selected per [rules-check.md](rules-check.md) step 1:

- [ ] `generic/` — every file in [`../rules/generic/`](../rules/generic/) (architecture, functional, security, testing, process)
- [ ] `lang/` — the project's one file in [`../rules/lang/`](../rules/lang/)
- [ ] profile — every file in the project's one profile folder under [`../rules/`](../rules/) (e.g. for `dhis2-react`: `architecture.md`, `react.md`, `testing.md` — substitute the actual profile present)

## Completeness

These check that nothing was left half-done — not invariants, but easy omissions:

- [ ] Profile-specific completeness checks pass, if the project's profile folder under [`../rules/`](../rules/) defines any (e.g. `dhis2-react/architecture.md` → "Completeness checks")
- [ ] **Every OpenSpec task this commit covers is done** — every task whose work is in the diff is checked in the change's `tasks.md`. If the project splits a change into several commits (see its `openspec/config.yaml`), a task may stay unchecked only if the diff does not touch its work; list those as pending in the report. The last commit of the change (before opening the PR or archiving the change) requires every task (after-exec only: `tasks.md` is local and not committed, so a PR review cannot check it)
- [ ] Specs / docs updated if the change altered user-facing behavior
- [ ] Tests written for new/changed behavior — not just existing tests re-run
- [ ] Project verification passes — `DEVELOPMENT.md` → *Verification* (its all-checks command, or every command it lists) locally, or the PR's CI checks

## Agent self-check (typical AI slips)

The agent may have over- or under-delivered. Verify:

- [ ] The change does **only** what the task asked — no speculative features, unrequested abstractions, or error handling for cases that cannot occur
- [ ] **Surgical changes only** — no unrelated files touched, no legacy reformatted or migrated outside the task's scope
- [ ] No dead code, unused imports, leftover `console.log`, commented-out blocks, stray `TODO`s, or placeholder values slipped in
- [ ] No invented API calls or methods that don't exist — claims about library/API usage match a real reference
- [ ] Existing mechanisms were reused or extended where possible; any parallel mechanism is justified by a concrete limitation of the existing one
- [ ] No new state duplicates an existing source of truth
- [ ] Every new singleton, callback or lifecycle hook is necessary for the requested behavior
- [ ] Follow-up fixes are not compensating for a regression introduced earlier in the same change; if they are, the original design was reconsidered
- [ ] The same behavior could not be implemented with fewer moving parts while preserving clarity and correctness

---

## Human review (the developer, not the agent)

The agent cannot tick these — they are the "Human decides" part of the protocol ([`process.md`](../rules/generic/process.md#the-ai-does-not-validate-its-own-result)).

- [ ] **Use the change** — run the app (or the command) and exercise the new behavior; passing checks are not the same as working.
- [ ] **Understand the change** — read the diff; ask the agent why it chose any non-obvious structure or decision. If you could not explain it in a review, it is not ready.
- [ ] **Decide which findings are real** — the review report can have false positives or wrong lines; drop or correct them before acting on them or publishing anything.
