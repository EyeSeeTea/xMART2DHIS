---
name: est-review-after-exec
description: Review your just-implemented change against EyeSeeTea standards before committing (rules, references, OpenSpec tasks, local verification). Use after finishing a change, in your working session, before commit.
license: MIT
compatibility: Requires a project containing .est_ai/.
metadata:
  author: est-ai
  profile: generic
  version: "0.1.0"
  generatedBy: "0.1.0"
---

# EyeSeeTea review — after execution

Review the work you just implemented, in this session, before committing. Answers "did I finish what the plan asked, correctly?". This skill carries the full logic by delegating to the protocol — it adds nothing the protocol does not define.

## Determine scope

Review the **working-tree / branch diff** against the base branch:
- Resolve the base branch dynamically — do not assume a fixed name. The branch may have been created from another feature branch, so, in order:
  1. The base of the branch's open PR, if any: `base=$(gh pr view --json baseRefName -q .baseRefName 2>/dev/null)`.
  2. Otherwise the remote's default branch: `base=$(git symbolic-ref --quiet refs/remotes/origin/HEAD | sed 's#.*/##')` (fall back to `master`/`main`/`development` if unset).
- `git diff --name-only origin/$base...HEAD` plus uncommitted changes (`git status --porcelain`).
- Tell the user which base you used and how many commits the diff covers (`git rev-list --count origin/$base..HEAD`). If the commits include work that is not part of this change (e.g. the branch was cut from another feature branch and has no PR yet), ask the user for the right base before reviewing.
- If the work maps to an OpenSpec change, locate its `tasks.md` under `openspec/changes/` for the completeness check.

## Execute

Follow [`.est_ai/review/prompt-after-exec.md`](../../../.est_ai/review/prompt-after-exec.md): it runs the shared `rules-check.md`, then verifies completeness against the plan (the OpenSpec tasks this commit covers done — all of them on the change's last commit —, `DEVELOPMENT.md` verification passing, tests written, specs/docs updated).

## Output

A single Markdown report. State clearly whether the change is ready to commit (no **Must fix**, the tasks this commit covers complete, verification passing) or what blocks it. Do not commit on the user's behalf unless asked.
