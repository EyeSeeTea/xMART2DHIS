---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Init protocol — adapt the skeleton to a project

Tool-agnostic. Runs **once**, right after the Quick Start has copied the skeleton into a repository. It inspects the project and fills in the `<!-- ADAPT: ... -->` markers and `<placeholders>` so that the agents and the reviews work from real facts. The question this protocol answers: **what does this project actually use?**

Principle: fill in only what you can **verify in the repository**. Anything you cannot verify, ask; never invent a command, a path or a convention.

## Inputs

- The repository: build and dependency files (`package.json`, `build.gradle(.kts)`, `pom.xml`, …), lint/format/test config, CI workflows, the PR template, the source tree, and the existing `README.md`.
- The skeleton files that carry markers: `git grep -n "ADAPT"` (skip `.est_ai/reference/README.md` and `README.md` — they are for skeleton maintainers).

## Steps

1. **Detect the stack.** From the build files and the source tree: language and version, framework, test framework (unit and E2E), linter and formatter, build tool, runtime. Note the evidence (file + line) for each.
   - **Runtime and package manager**: read `.nvmrc`, `.node-version`, `engines` and `packageManager` (or their equivalents, e.g. the Gradle wrapper and JDK toolchain). Run every command in later steps with that configuration (e.g. `nvm use`, `corepack yarn`), so that a wrong global version is not reported as a broken project.

2. **Declare the protocol** — [`../project.md`](../project.md):
   - **Language**: the `.est_ai/rules/lang/` file that matches. None matches → say so; leave it as "none".
   - **Profile**: the `.est_ai/rules/<profile>/` folder that matches the stack. None or more than one could match → **stop and ask**.
   - **Reference**: the one the table in [`../reference/README.md`](../reference/README.md) gives for that profile, or "none".
   - **Installed from**: the est-ai version from [`../version`](../version) and the skeleton commit it was copied from. **Always ask the developer** for the commit, even if you can see a copy of the skeleton: only they know which ref they copied. The Quick Start copies from `origin/master` (`git -C <skeleton> rev-parse --short origin/master`), but they may have copied from a branch or a tag; record the commit they give you.

3. **Choose the modules.** The skeleton ships every profile and every optional module; keep only what the project uses. Ask, then **propose the deletions and wait for approval** before removing anything:
   - **Other profiles**: the `rules/<profile>/` folders, `rules/lang/*.md` files and `forks/<stack>/` folders that do not match step 2. Removing them is enough: `rules/README.md` does not link profiles or languages, so it needs no edit.
   - **Backend or database of its own?** No → `backend-developer`, `database-manager`.
   - **UI?** No → `frontend-developer`, `graphical-designer`, `pencil-design`, and `AGENTS.md` → *UI design workflow*.
   - **UI designed first in Pencil?** No → `graphical-designer`, `pencil-design`, and `AGENTS.md` → *UI design workflow* (adapt it if the team designs elsewhere).
   - **Does anyone on the team use OpenCode?** No → `opencode.json`, and `opencode` out of `openspec init --tools` wherever the project documents it. Yes → remove from `opencode.json` the agents deleted above.

   Record the answers in `project.md` → *Modules*.

4. **Fill in `DEVELOPMENT.md`** section by section: what it is, tech stack, canonical commands, architecture and directory layout, code conventions, verification, testing strategy, git workflow.
   - **Commands** must exist: take them from the project's scripts (e.g. `package.json` → `scripts`) or its docs, and run the harmless ones (lint, typecheck, tests) to confirm they work. Report any that fail — do not fix the project.
   - **Before running any of them**, if `.est_ai/reference/` has a reference set up, read the config of each command first: the test runner's `include`/`exclude`, the `tsconfig` `include`, the formatter's and linter's globs (in their config or in the script that calls them) and ignore files. If one reaches into `.est_ai/reference/`, **do not run it yet**: raise it now as the conflict in step 6 → *Tools that scan the whole repo*, and run it once the developer has decided. If they keep it as it is, failures that come from the reference are not the project's. Never run formatters or linters in write mode (`--write`, `--fix`).
   - **All-checks command**: if the project has a script that runs every check, use it. If not, propose one (e.g. `"check": "<typecheck> && <lint> && <test>"`) and **ask before editing** the project's build file.
   - **Architecture**: describe the layout that exists, not the template's example. If the project does not follow Clean Architecture, say so rather than forcing the template.
   - **Runtime**: record the runtime and package manager from step 1 in *Tech stack* and *First-time setup*.
   - **The project's README**: if it already covers a section (setup, structure, tests, …), link to it from `DEVELOPMENT.md` instead of copying it, so the two do not drift apart. Before linking a section, check it against the repository (e.g. the folders a *Structure* section names exist, the commands a *Setup* section gives are in the scripts). If it is out of date, describe what exists in `DEVELOPMENT.md` instead and report the outdated section. Do not edit the README.

5. **Walk the other markers**: `AGENTS.md` (tracker link format, UI section, after-change artifacts), the agents and skills kept in step 3 (styling, design system, tracker, roles), `openspec/config.yaml`. For each marker: fill it in from what you found, remove the section if it does not apply, or ask.

6. **Detect conflicts** between the project and what `AGENTS.md` and the profile's rules assume. **Report and ask; do not fix anything** — the project decides:
   - **CI**: a workflow whose `on.pull_request` is restricted to `branches` contradicts `AGENTS.md` → *CI*. Look at where the trigger is defined, not at what the job runs: if the `on:` block with the restriction is in a workflow file of this repo, propose removing it — also when its jobs call a shared workflow of the organisation (`uses: <org>/<repo>/.github/workflows/...`). Only report it when the restriction is outside this repo.
   - **PR template**: if `.github/pull_request_template.md` exists, `AGENTS.md` → *Pull requests* must point to it and say where the task link goes (e.g. *References → Issue*). Propose that wording.
   - **Test tool**: a unit or E2E tool other than the one the profile's `testing.md` assumes (e.g. Cypress instead of Playwright). The project's tool stays; propose a rule in `rules/project/` if the difference matters to the review.
   - **Versions against the reference**: compare the project's main versions (framework, language, build tool) with the reference's. If they differ, propose a rule in `rules/project/` so the agent does not copy APIs the project does not have.
   - **Own equivalents of reference abstractions**: if the project already has its own version of something the reference brings (e.g. its own `Future`), new code uses the project's ([scope](../rules/README.md#scope-new-code-vs-legacy)). Record which one in `rules/project/` if it is not obvious.
   - **Tools that scan the whole repo**: test runners whose `include` is not limited to the source folder, type checkers whose `tsconfig` `include` covers the whole repo, formatters or linters run on `./**`, and the pre-commit or pre-push hooks that call them. They reach into `.est_ai/reference/` (git-ignored, but globs do not read `.gitignore`): they run the reference's tests or rewrite its files, which belong to another repository. Propose excluding `.est_ai/reference` (or `.est_ai/**`) in each one (e.g. Vitest `test.exclude`, `.prettierignore`) and ask before editing; see [`../reference/README.md`](../reference/README.md#set-it-up). If a reference is already set up, confirm with the project's test command that only the project's tests run.
   - **Legacy and generated code**: folders that new code must not extend (e.g. `src/legacy/`) or must not edit by hand (e.g. generated `src/locales/`). Propose a rule in `rules/project/` for each.

7. **Check the `.gitignore`** — the project keeps its own; confirm it has the entries in `.gitignore.est-ai` (`.claude/settings.local.json`, `.est_ai/reference/*` with `!.est_ai/reference/README.md`, `openspec/**/tasks.md`). If any entry is missing, propose adding it and **ask before editing**. If `tasks.md` files are already tracked, list them and propose `git rm --cached` — do not run it without approval.

8. **Project rules** — write in `.est_ai/rules/project/` the rules approved in step 6, and ask the developer whether the project has others (generated code not to edit, exceptions to est-ai rules such as "Promise until refactor X"), as the README there describes. Do not guess them.

9. **Clean up**: remove each `<!-- ADAPT: ... -->` marker once its section is done, and the *Template* note at the top of `DEVELOPMENT.md` once no `<placeholder>` remains. Leave a marker in place only if the section is still pending, and list it in the report.

## Outcome

Do not commit. Report:
- what was detected, with its evidence;
- what was filled in, file by file;
- what was removed as not applicable (profiles, agents, skills, sections);
- the conflicts found, and what was decided for each;
- the `.gitignore` entries added or still missing;
- the questions asked and their answers;
- what is still pending (markers left, commands that failed, rules not provided).

Then the developer reviews the diff (see the **Human review** section of [`../review/checklist.md`](../review/checklist.md)) before committing it.
