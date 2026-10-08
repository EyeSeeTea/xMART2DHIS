---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Process — Human decides. AI executes.

How work is done, not how code is written. These rules apply to every change, new code or legacy, and the review checks them against what it can see: the plan or OpenSpec change, the session, and the PR — not only the diff.

## Plan before non-small changes

- A change is **small** when it does not touch scope, a contract (public API, interface, repository method), data (schema, stored format, migrations), validation, or tests. A style or a text change is small.
- Any change that is not small starts from a **written plan** — an OpenSpec change, a ticket, or a plan written in the session — not only from a conversation.
- If the plan leaves open something that changes scope, a contract, data, validation or tests, **stop and ask** before implementing. Do not decide it on the developer's behalf.

## The AI does not validate its own result

- The project's verification (`DEVELOPMENT.md` → *Verification*) runs before a change is considered done; the agent reporting success is not verification.
- A human reviews the change before merge — see the **Human review** section of [`../../review/checklist.md`](../../review/checklist.md#human-review-the-developer-not-the-agent).

## Shared systems

- Never write to GitHub, the issue tracker or any other shared system (PR descriptions, comments, reviews, tasks, statuses) without the developer's explicit approval of that exact write: show what you would write, and write it only once they approve it. Approval of one write does not extend to the next.

## Fix the protocol, not only the code

- When the same deviation appears a second time, the fix also goes into the protocol — a rule, a reference, the plan template or the checklist — so it does not appear a third time.
