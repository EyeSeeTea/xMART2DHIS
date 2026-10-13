---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Review protocol — pull request

Tool-agnostic. Runs over a **published PR**, in a cold session — possibly someone else's work, or work resumed weeks later. The reviewer has the diff but not the authoring conversation. The question this level answers: **is this PR a good change to merge?**

## Inputs

- The PR: fetch its branch and diff against the base branch (changed files + full content), plus its title and description.
- `gh pr view <n> --json title,body,headRefName,baseRefName`, `gh pr diff <n> --name-only`.
- The PR's CI status: `gh pr checks <n>`.

## Steps

1. **Run the shared rules check** — follow [`rules-check.md`](rules-check.md) in full (rule selection, references, rules verification, report format).

2. **Verify the PR as a unit** — checks that only make sense for a published change:
   - **Atomic & cohesive** — the PR does one thing; it does not bundle unrelated changes. Mixed concerns are a finding.
   - **Description & issue link** — the PR has a meaningful description and links the related issue(s) in the tracker, per project convention.
   - Specs / docs updated if user-facing behavior changed.
   - **CI passes** — read `gh pr checks <n>`. Any failing check is a **Must fix**. If checks are still pending, say so in the report (the review ran before CI finished); if the PR has no checks at all, note it as a finding.

   Do not run the suite locally — CI runs it. Note missing test coverage as a finding.

3. **Report** — produce the report (Must fix / Recommendations / Minor, then Protocol feedback, as defined in `rules-check.md`) and show it to the user in full, ending with the **Human review** section of [`checklist.md`](checklist.md) as pending for the developer — never tick it yourself. **Do not post anything yet.**

4. **Confirm before posting** — ask the user whether to post the review and wait for an explicit yes. If they ask for changes, revise the report and ask again. If they decline, stop: the review stays local. Approval to post is per review — never assume it from an earlier one.

5. **Submit** — once approved, post the report as a single PR review. Use `--request-changes` when there is at least one **Must fix**, `--comment` otherwise:

   ```bash
   gh pr review <number> --request-changes --body "$(cat <<'EOF'
   <report>
   EOF
   )"
   ```

## Outcome

The PR is mergeable when it passes the rules check, is cohesive, and is properly described. Flag every **Must fix** as blocking.
