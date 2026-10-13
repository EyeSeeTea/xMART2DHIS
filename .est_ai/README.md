# `.est_ai/` — EyeSeeTea AI development protocol

This folder is the **portable protocol** for AI-assisted development at EyeSeeTea. It travels with the project: copy `.est_ai/` into any repository and the agent has everything it needs to work inside our standards — no need to overwrite the project's own `README.md` or explain the rules in chat.

It is **tool-agnostic**. Everything here is plain Markdown that any agent (Claude Code, Cursor, Copilot, Gemini) and any developer can read. No rule depends on a specific AI tool being present.

---

## The core idea

> The AI replicates better than it interprets.

"Follow Clean Architecture" produces approximations. Real code the model can read and copy produces consistent results. So the protocol gives the agent **two** things, not one:

1. **References** (`reference/`) — real code the agent copies.
2. **Rules** (`rules/`) — the contracts a reference cannot express by itself.

And a third layer to verify the result:

3. **Review** (`review/`) — a checklist that *references* the rules and confirms the output complies.

---

## The development flow: Plan → Execution → Review

```
PLAN        OpenSpec (propose) → spec + tasks.
            The agent reads rules/ to know its constraints before designing.

EXECUTION   The agent implements, copying reference/ and obeying rules/.

REVIEW      Two levels, sharing one core (review/rules-check.md):
            · est-review-after-exec — your just-done work, before commit:
              rules + the OpenSpec tasks the commit covers done +
              DEVELOPMENT.md verification passing.
            · est-review-pr — a published PR: rules + PR cohesion +
              description + CI checks, posted to GitHub after you
              approve it.
```

The three phases share one source of truth — `rules/`. Rules are not a planning artifact or a review artifact; they are the permanent contract consulted in **every** phase.

---

## Developer workflows

What a developer actually does, per scenario. The criteria never change — only how they are invoked. In Claude Code, skills (`est-review-*`) and the `code-reviewer` agent are conveniences; the logic lives in `review/` + `rules/`, so any of these can also be run by hand by reading the prompt.

| Scenario | What you do |
|----------|-------------|
| **Set up a project** | After the Quick Start copy, run `est-init` (or `init/prompt-init.md` by hand) once: it fills in `DEVELOPMENT.md` and the `ADAPT` markers from what the repo shows. Review the diff before committing. |
| **Develop a task** | Plan with OpenSpec (`/opsx:propose`), implement (`/opsx:apply`) copying `reference/` and obeying `rules/`, then run `est-review-after-exec` **and** do the human review (`review/checklist.md` → *Human review*) before committing. |
| **Small change, no OpenSpec** | Only when the change is small as defined in [`rules/generic/process.md`](rules/generic/process.md) (no scope, contract, data, validation or test changes); otherwise write a plan first. Implement, then run `est-review-after-exec` — same rules + verification, just no `tasks.md` to check completeness against. |
| **Review a PR** | Run `est-review-pr` (shows the review and posts it to GitHub only after you approve it). Optionally use the `code-reviewer` agent instead, to review in a fresh session without polluting the current context window. |
| **Review without a skill** | Point the agent directly at `review/prompt-after-exec.md` or `review/prompt-pr.md`. The prompts are self-contained; no skill needed. |
| **Another tool (Cursor, Copilot, Gemini)** | No skills exist there — read `.est_ai/` and run the `review/prompt-*.md` protocols by hand. The protocol is tool-agnostic by design. |

Notes:

- **Review is mandatory regardless of task size** — even a one-line change runs the after-exec review before commit.
- **The agent is optional, never required.** Use `code-reviewer` only when you want a cold session that won't consume your live context. Otherwise the skill in the main context does the same job.
- **The skill is optional too.** Everything a skill does (compute scope, run the prompt, format the report) you can do by hand by reading the matching `review/prompt-*.md` — which is exactly why other tools work without skills.

---

## Folder layout

```
.est_ai/
  README.md            ← this manual (what it is + why it's designed this way)
  project.md           ← how the protocol applies to this project: language,
                         profile, reference (belongs to the project)
  rules/               ← the contracts a reference cannot express
    README.md            index: which rule lives in which file
    generic/             any language, any stack
      functional.md        functional programming
      architecture.md      clean architecture: SRP, layers, repositories, use cases
      security.md          secrets, input validation, unsafe operations
      testing.md           what must be tested, behavior-not-implementation
      process.md           when to plan, stop and ask, shared systems
    lang/                per language (future: groovy.md)
      typescript.md        type safety, derived unions, no unsafe casts
      kotlin.md            sealed classes, expect/actual, coroutines, ktlint
    dhis2-react/         React + DHIS2 stack
      README.md            index of the profile; links its language file
      architecture.md      d2-api, D2Api, FutureData, CompositionRoot
      react.md             components, hooks, styling
      testing.md           repository test doubles, playwright
    dhis2-android/       Kotlin Multiplatform + DHIS2 Android SDK stack
      README.md            index of the profile; links its language file
      architecture.md      DHIS2 Android SDK, repositories, use cases, Koin
      compose.md           design system, theming, composable/state boundaries
      testing.md           robot pattern, MockK, test tags
    project/             this project's own rules; always applies, never
                         overwritten by an update (see project/README.md)
  init/
    prompt-init.md       adapt the skeleton to a project, once after copying it
  reference/           ← real code the agent replicates (local clone or symlink,
                         git-ignored; see reference/README.md)
  review/
    checklist.md         verification — references rules/, does not copy them
    rules-check.md       shared review core (rules compliance), used by both levels
    prompt-after-exec.md after-execution protocol: core + OpenSpec tasks +
                         DEVELOPMENT.md verification
    prompt-pr.md         pull-request protocol: core + PR cohesion + CI checks +
                         post on approval
  version              ← single source of the protocol version, e.g. est-ai@0.1.0
```

---

## Why it's designed this way

These are the design decisions behind the protocol. They exist so that anyone who opens `.est_ai/` understands the *why*, not just the *what*.

### Rules ≠ References ≠ Checklist

Each layer has one job, and they must not overlap:

| Layer | Contains | Never contains |
|-------|----------|----------------|
| `reference/` | Real code to copy: how a use case, a repository, a component is built. Provided locally (clone or symlink), not committed. | — |
| `rules/` | Only what an example **cannot** express: invariants, "never do X", layer boundaries, "every domain rule needs a unit test". | Example code. "How to write a use case" — that's a reference. |
| `review/checklist.md` | Verification questions: "do the rules hold? are the commit's tasks done? does verification pass?". | The rules themselves — it **references** them. |

**Rules only cover what a reference does not.** If a concrete example already shows the agent how to do something (how to build a use case, how to wire a repository), it does **not** belong in the rules. Rules are for the invariants no snippet can carry on its own.

### Rules apply to new code; legacy is respected

Our projects mix new code with legacy. The rules describe the **standard for new code and new modules**. Legacy that predates a rule is **not a violation**.

- New code must follow the rules.
- Legacy is left as it is. It is not migrated opportunistically or "while passing".
- A pattern is only migrated to the new standard in a **deliberate refactor of bounded scope** — never as a side effect of an unrelated task.

This bounds the Boy Scout Rule: tidying a file you touch is good, but converting a legacy pattern to the new standard is a refactor with its own scope, not cleanup done in passing. Stated explicitly so the agent does not start rewriting legacy in every PR.

### One source per topic

Each kind of information lives in one place; everything else points to it instead of repeating it, so copies cannot drift apart:

| Topic | Lives in |
|-------|----------|
| Project facts — stack, commands, architecture, verification (for people; agents read it too) | `DEVELOPMENT.md` |
| Conventions — git, PRs, CI | `AGENTS.md` |
| Code and process rules | `.est_ai/rules/` |
| How the protocol applies to this project — language, profile, reference, own rules | `.est_ai/project.md`, `.est_ai/rules/project/` |

`openspec/config.yaml`, the agents and the skills only point to these.

### Agents are thin, on-demand wrappers

For a single developer working in sessions they open and close, a subagent's main value — isolating context to keep a *live* conversation clean — rarely applies. The logic therefore lives in **skills and rules**, not in agents.

- An agent here is **thin**: `code-reviewer` wraps a skill and does nothing the skill could not do in the main context; the role agents (frontend, backend, database, design, project manager) are a role, its responsibilities and pointers — stack in `DEVELOPMENT.md`, rules in `rules/`, workflows in skills — plus only the standards specific to that role that live nowhere else.
- Agents are **on-demand only**: their `description` is written so the AI does **not** auto-activate them. They run only when the developer names them explicitly. This avoids unwanted delegation to a cold subagent that cannot see the current conversation.

The heavy logic lives in the review protocols and the `est-review-*` skills; the `code-reviewer` agent is a thin, on-demand wrapper over `est-review-pr`, provided as a convenience for reviewing a PR in a fresh session.

---

## Versioning

Two versions, two meanings:

- **`version`** — the version of the est-ai protocol as a whole (e.g. `est-ai@0.1.0`). There is no `package.json` — this is configuration, not a package.
- **Each file's frontmatter** records its own version and the est-ai version that generated it:

```yaml
metadata:
  author: est-ai
  profile: generic             # generic; the language for lang/ files (typescript); or the stack profile (dhis2-react)
  version: "0.1.0"             # this file's own version; bump it when the file changes
  generatedBy: "0.1.0"         # est-ai version (version, without the prefix) that generated it
```

A file can be bumped without a new est-ai release, so `version` and `generatedBy` diverge over time; today they match only because everything starts at `0.1.0`.

Files generated by other tools carry their own metadata: the OpenSpec skills (`author: openspec`) record in `generatedBy` the OpenSpec version that generated them, not est-ai's. Only `author: est-ai` files are compared with `version`.

Skills and agents are `profile: generic` — their logic is stack-agnostic (they read whatever `.est_ai/` is assembled). What is stack-specific is the **content** under `.est_ai/rules/`, `reference/` and `review/`, which is assembled per profile.

A future `est-ai` CLI (mirroring OpenSpec's) could assemble `.est_ai/` per project type — `dhis2-react`, `android`, `openboxes`, `payload-cms` — and detect which installed files are stale to regenerate them. It never touches `project.md` or `rules/project/`, which belong to the project.

## How to use it

- **Implementing**: read the relevant `rules/*.md` and replicate the matching code in `reference/` (set it up first — see [`reference/README.md`](reference/README.md)).
- **Reviewing**: after finishing a change, run `est-review-after-exec`; to review a published PR, run `est-review-pr` (or the `code-reviewer` agent). All read `review/` and the same `rules/`.
- **Multi-stack**: rules and references are per-profile (e.g. `dhis2-react`). A shared base plus per-profile overrides is assembled per project; the agent only ever sees the flat, merged result.

---

*Human decides. AI executes. Tests and review validate.* — written as rules in [`rules/generic/process.md`](rules/generic/process.md).
