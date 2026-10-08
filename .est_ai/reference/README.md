# `reference/` — real code the agent replicates

References are **real, working code** the agent copies when it builds something: how a use case, a repository, a component or a test is structured. Rules (`../rules/`) only cover what a reference cannot express.

The references are **not committed**. Everything in this folder except this README is git-ignored: each developer provides them locally.

## Which reference — one per profile

The reference is the skeleton of the project's **profile** (declared in [`../project.md`](../project.md)):

| Profile | Reference |
|---------|-----------|
| `dhis2-react` | [EyeSeeTea/dhis2-app-skeleton](https://github.com/EyeSeeTea/dhis2-app-skeleton) |
| Any other (e.g. `dhis2-android`, `openboxes`) | None yet — work from the rules alone |

The reference is always the profile's skeleton, also in legacy projects: rules apply to new code, and legacy code may not follow them. To point at a well-structured part of the project itself, declare it in [`../rules/project/`](../rules/project/README.md) (e.g. "for X, follow `src/features/y/`"), so what may be copied is explicit.

## Set it up

Clone it here, or link a copy you already have:

```bash
git clone https://github.com/EyeSeeTea/dhis2-app-skeleton .est_ai/reference/dhis2-app-skeleton
# or
ln -s /path/to/your/dhis2-app-skeleton .est_ai/reference/dhis2-app-skeleton
```

**Keep the project's tools out of it.** The reference is a whole project inside yours. Git ignores it, but tools that scan the repo with their own globs do not read `.gitignore`, so they reach into it as if it were the project's code — whether it is a clone or a symlink. Exclude `.est_ai/reference` (or `.est_ai/**`) from every tool that scans the whole repo, for example:

- **Test runners** whose `include` is not limited to `src/` (e.g. Vitest `include: ["**/*.spec.ts"]` → add `".est_ai/**"` to `test.exclude`). Otherwise the reference's tests run with the project's config and fail.
- **Type checkers** whose config covers the whole repo (e.g. a `tsconfig.json` with `include: ["**/*"]` → add `".est_ai"` to `exclude`). Otherwise they type-check the reference with the project's settings.
- **Formatters and linters run on `./**`** (e.g. `prettier "./**/*.{ts,tsx}" --write` → add `.est_ai/reference` to `.prettierignore`). Otherwise they rewrite files of another repository — with a symlink, in your own copy of it — often from a pre-commit or pre-push hook, without you noticing.

`est-init` detects these and proposes the exclusions (step 6 of [`../init/prompt-init.md`](../init/prompt-init.md)).

<!-- ADAPT: when a new profile gets a reference skeleton, add it to the table above. -->

## How the agent uses it

- **Implementing**: find the file in the reference that builds the same kind of artifact (use case, repository, component, test) and replicate its structure.
- **Reviewing**: compare each new artifact against its reference counterpart; deviations from the canonical shape are findings.
- **If this folder holds only this README**, there are no references: the agent says "no references available", pointing to this README, in its report and continues with the rules alone. It never stops, guesses, or reports a missing reference as a finding.
