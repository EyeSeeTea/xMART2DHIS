---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Rules check — shared review core

Tool-agnostic. The **shared core** both review levels run identically: does the code comply with EyeSeeTea standards? The level-specific protocols ([prompt-after-exec.md](prompt-after-exec.md), [prompt-pr.md](prompt-pr.md)) run this first, then add their own checks. The rules never differ between levels.

## Steps

1. **Select which rules apply.** Rules in [`../rules/`](../rules/) are organized along three axes, plus the project's own rules:
   - `generic/` — always applies.
   - `project/` — the project's own rules; always applies. They can add restrictions or make explicit exceptions to est-ai rules: where a project rule makes an exception, it wins and that est-ai rule is not reported there.
   - **Language and profile** — read [`../project.md`](../project.md):
     - **Declared** (real values, not `<placeholders>`): use `lang/<language>.md` and the `<profile>/` folder. If either does not exist, **stop and ask** — the declaration and the folders disagree. Other language files and profile folders present are ignored.
     - **Not declared** (no file, or placeholders): infer from the folders **present**, and suggest filling in `.est_ai/project.md` in the report.
       - `lang/` — **0** files: warn that no language rules exist and continue. **1** file: use it. **More than one**: **stop and ask** which language applies — do not guess.
       - profile folder (any folder other than `generic/`, `lang/` and `project/`) — **0**: warn that no stack rules exist and continue with generic+lang. **1**: use it. **More than one**: **stop and ask** which profile applies — do not guess.

   Then read the relevant files from the selected set for the layers touched, and, in the reference declared in `project.md` (under [`../reference/`](../reference/README.md)), the file that builds the same kind of artifact (use case, repository, component).

2. **Compare against references.** For each new artifact, check it **replicates the structure** of its reference. Deviations from the canonical shape are findings. If `../reference/` holds only its README, there are no references: say "no references available — set them up with `.est_ai/reference/README.md`" in the report and continue — never stop or report it as a finding.

3. **Verify against the rules.** Go through the changed code and confirm no rule is violated. Respect [scope](../rules/README.md#scope-new-code-vs-legacy): legacy code that predates a rule is **not** a violation; flag the pattern only if *new* code uses it, or if legacy was migrated outside the task's scope. [`generic/process.md`](../rules/generic/process.md) is about how the change was made: check it against what you can see — the plan or OpenSpec change, the session, the PR.

4. **Run the rules sections of the checklist.** Walk the **EyeSeeTea rules compliance** and **Agent self-check** sections of [`checklist.md`](checklist.md). (The **Completeness** section is run by the level-specific protocols, since what counts as "complete" differs between levels.)

## Reporting findings

For every finding:
- Name it; quote the **file + code**.
- Cite the **exact rule or checklist item** violated (e.g. `rules/generic/architecture.md → "Repositories do not call other repositories"`).
- Suggest a concrete fix.

Group findings as **Must fix** / **Recommendations** / **Minor**. If everything passes, say so explicitly. Only code with no **Must fix** is ready to proceed.

End the report with a **Protocol feedback** group — for each **Must fix**, and for any finding you have seen before, say which part of the protocol should have prevented it and what to change:
- a **rule** missing or ambiguous → propose the wording;
- a **reference** that does not show the pattern → say which one;
- a **checklist** item or **plan template** gap → propose the item;
- something a tool can check deterministically (an import, a pattern, a file that must exist) → propose a lint or CI check instead of a prompt rule;
- the protocol already covers it and it was not followed → say so; nothing to change.

These are proposals: they do not change a finding's severity or whether the change is ready, and the developer decides whether to apply them (see [`process.md`](../rules/generic/process.md#fix-the-protocol-not-only-the-code)). If there is nothing to propose, say so in one line.

## Severities

- **Must fix** — blocks the commit or merge. Use it when:
  - new code violates a rule (a "must", "never", "no …" statement in `../rules/`), or legacy code was migrated outside the task's scope;
  - the work breaks a process rule: a non-small change without a written plan, an open question decided without asking, a write to a shared system without approval;
  - the change is incomplete: an OpenSpec task left unchecked, new/changed behavior without the test the testing rules require;
  - verification fails: a verification command or CI check fails;
  - the code is wrong: a bug, a security issue, or behavior that does not match the spec or the task.
- **Recommendations** — do not block, but should be addressed in this change or tracked. Use it when:
  - a new artifact deviates from its reference's canonical shape without breaking a rule;
  - a rule worded as a preference ("Prefer X") is not followed;
  - the PR bundles unrelated changes, its description or issue link is missing or weak, or its CI is pending or absent;
  - you suspect a problem but cannot confirm it — say what you would need to confirm it.
- **Minor** — optional polish: naming, typos, comments, wording in docs.

When in doubt between two levels, choose the lower one and say why: a false **Must fix** blocks work for nothing, so reserve it for what you can point to in a rule, a task, a failing check, or a concrete bug.
