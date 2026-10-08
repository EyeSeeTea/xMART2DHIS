---
name: est-review-pr
description: Review a published pull request against EyeSeeTea standards (rules, references, PR cohesion, description, CI) and, once the user approves it, post the review on GitHub. Use to review a PR by number, your own or someone else's.
license: MIT
compatibility: Requires a project containing .est_ai/ and the gh CLI.
metadata:
  author: est-ai
  profile: generic
  version: "0.1.0"
  generatedBy: "0.1.0"
---

# EyeSeeTea review — pull request

Review a published PR in a cold session. Answers "is this PR a good change to merge?". This skill carries the full logic by delegating to the protocol — it adds nothing the protocol does not define.

## Determine scope

Review the PR given by number:
- `gh pr view <n> --json title,body,headRefName,baseRefName`, `gh pr diff <n> --name-only`, then read each changed file from the PR branch.
- `gh pr checks <n>` for the CI status.

## Execute

Follow [`.est_ai/review/prompt-pr.md`](../../../.est_ai/review/prompt-pr.md): it runs the shared `rules-check.md`, then verifies the PR as a unit (atomic & cohesive, description + issue link, CI checks passing — a failing check is a **Must fix**), shows the report, and — only after the user explicitly approves — submits it as a single PR review via `gh pr review` (`--request-changes` if there is a **Must fix**, `--comment` otherwise).

## Output

A single Markdown report, shown to the user first and posted as a PR review only on their approval. State clearly whether the PR is mergeable (no **Must fix**, CI green, cohesive, properly described) or what blocks it.
