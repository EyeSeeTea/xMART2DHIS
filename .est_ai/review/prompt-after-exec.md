---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Review protocol — after execution (local)

Tool-agnostic. Runs **after implementing a change, before committing**, in the working session. The reviewer has the full context: the spec, the tasks, what was decided, and can run the tests. The question this level answers: **did I finish what the plan asked, correctly?**

## Inputs

- The uncommitted / branch diff against the base branch (changed files + full content).
- If the work corresponds to an OpenSpec change, that change's `tasks.md` and spec.
- The **Verification** section of the project's `DEVELOPMENT.md` (typecheck, lint, tests…).

## Steps

1. **Run the shared rules check** — follow [`rules-check.md`](rules-check.md) in full (rule selection, references, rules verification, report format).

2. **Verify completeness against the plan** — run the **Completeness** section of [`checklist.md`](checklist.md), with emphasis on:
   - **Every OpenSpec task this commit covers is done** — every task whose work is in the diff is checked in the change's `tasks.md`. If the project splits a change into several commits (see its `openspec/config.yaml`), a task may stay unchecked only if the diff does not touch its work; list those as pending in the report. The last commit of the change (before opening the PR or archiving the change) requires every task.
   - **Project verification passes** — run the **Verification** section of `DEVELOPMENT.md`: its single all-checks command if it defines one, otherwise every command it lists (typecheck, lint, tests…) — not just the tests. Any failing command is a **Must fix**. If the section is missing or still has `<placeholder>` commands, say so in the report: the change is not verified.
   - **Tests written** — new/changed behavior has a test covering it; do not just re-run existing tests.
   - Specs / docs updated if user-facing behavior changed.

3. **Report** as defined in `rules-check.md` (Must fix / Recommendations / Minor, then Protocol feedback). End by listing the **Human review** section of [`checklist.md`](checklist.md) as pending for the developer — never tick it yourself.

## Outcome

Only code that passes (no **Must fix**) and whose tasks and tests for this commit are complete is ready to commit. Review is mandatory regardless of task size.
