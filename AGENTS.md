# Project conventions

Tool-agnostic conventions for any AI agent or developer working in this repo. Read by Claude Code, Cursor, Copilot, Gemini, and people.

**Read [`DEVELOPMENT.md`](DEVELOPMENT.md) before working:** it holds the project facts (stack, canonical commands, architecture, verification).

**Which flow to follow per scenario** (set up, develop a task, small change, review): [`.est_ai/README.md` → Developer workflows](.est_ai/README.md#developer-workflows).

**Code and process rules live in [`.est_ai/`](.est_ai/), not here.** This file holds project conventions (git, PRs, CI); `.est_ai/rules/` holds the code invariants and the process rules ([`generic/process.md`](.est_ai/rules/generic/process.md): when to plan, when to stop and ask, shared systems), and the review protocol in [`.est_ai/review/`](.est_ai/review/) verifies them. Keep this file thin — when a rule is about how code is written or how the work is done, it belongs in `.est_ai/rules/`.

## Git workflow

- Default branch for new work: `development`.
- Branch from another feature branch only when there is a dependency on unmerged work; merge back to the same branch you started from.
- Branch naming: `feature/<name>` for features, `fix/<name>` for bug fixes, `refactor/<name>` for refactors.
- All commits follow Conventional Commits: `feat`, `fix`, `refactor`, `test`, `docs`, `chore` (`scope` in parentheses).
- Never commit as "Claude" — use the project's git user config.
- OpenSpec changes: commit `proposal.md`, `design.md` and the specs; never commit `tasks.md`, of active or archived changes. Tasks are the agent's local working checklist, so the project's `.gitignore` must exclude them with `openspec/**/tasks.md` (it covers every layout: `openspec/changes/archive/` or `openspec/archive/`).

## Pull requests

- Every PR description follows [`.github/pull_request_template.md`](.github/pull_request_template.md) and links the related ClickUp task(s) in **References → Issue**, e.g. `- **Issue:** [Task name](https://app.clickup.com/t/<task-id>)`.
- Parent issue with subtasks → link the parent. Multiple standalone issues → link all.

## Shared systems

Never write to GitHub or the issue tracker without explicit approval — see [`.est_ai/rules/generic/process.md`](.est_ai/rules/generic/process.md#shared-systems).

## Boy Scout Rule

Leave every file you touch cleaner than you found it: fix convention violations in the files you are already modifying, keeping scope reasonable. **Bounded by the new-vs-legacy scope** in [`.est_ai/rules/`](.est_ai/rules/README.md#scope-new-code-vs-legacy): tidying is good, but migrating a legacy pattern to the new standard is a deliberate refactor, not cleanup done in passing.

## Code rules → `.est_ai/`

Architecture, functional style, TypeScript, testing, and security rules are defined in [`.est_ai/rules/`](.est_ai/rules/) (organized by `generic/`, `lang/`, and stack profile). Do not restate them here.

## CI / automated checks

- Do not restrict the `pull_request` trigger to specific branches — leave it unrestricted so all PRs get checked. Keep `push` triggers limited to `master` and `development`.
- Every PR should get automated feedback (lint, type-check, tests) before merge.

## After every feature change

Before considering work done, update all that apply:

1. **README.md** — if user-facing behavior changed.
2. **PR description** — if a PR is open (`gh pr view`), propose the updated summary and test plan; the developer applies it (see [Shared systems](#shared-systems)).
3. **OpenSpec specs** — update `openspec/specs/` (and any archived copy) if behavior relates to an existing spec.
4. **i18n** — if UI texts changed, run `yarn update-po` and commit the updated `i18n/*.po` / `i18n/en.pot`.

## Before committing

Run the after-execution review in [`.est_ai/review/prompt-after-exec.md`](.est_ai/review/prompt-after-exec.md) (in Claude Code, the `est-review-after-exec` skill), which verifies the changed code against `.est_ai/rules/` and the review checklist. Only commit when it passes (no **Must fix**) and the OpenSpec tasks and tests this commit covers are complete (all of them on the change's last commit).
