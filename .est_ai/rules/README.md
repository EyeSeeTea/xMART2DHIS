---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Rules — index

The contracts a reference example cannot express by itself. These are **invariants**, not tutorials: if the code in `reference/` already shows *how* to build something, that knowledge does not belong here. Rules cover the boundaries, the "never do X", and the cross-cutting constraints no single snippet can carry.

Read [the manual](../README.md) first for *why* the protocol is split this way.

## Scope: new code vs legacy

These rules describe the standard for **new code and new modules** (except [generic/process.md](generic/process.md), which is about how the work is done and applies to every change). Legacy that predates a rule is **not a violation** — it is respected, not migrated opportunistically. A pattern is migrated to the new standard only in a **deliberate refactor of bounded scope**, never as a side effect of an unrelated task. See the manual for the full rationale.

**The project's own equivalents win.** When the project already has its own version of something the reference brings — an async abstraction such as `Future`, an E2E tool, older framework or library versions — new code uses the project's: the reference shows the pattern, it is not copied next to what exists. Unifying the two is a deliberate refactor too. Record the choice in [`project/`](project/README.md) when it is not obvious.

## Index

Rules are grouped along three axes, plus the project's own rules: `generic/` always applies, the project's **language** file in `lang/`, and its **stack profile** folder. `project/` belongs to the project: it always applies and an update never overwrites it.

**`generic/`** — any language, any stack:

| File | Covers |
|------|--------|
| [generic/functional.md](generic/functional.md) | Functional programming, immutability |
| [generic/architecture.md](generic/architecture.md) | Clean Architecture (stack-agnostic): single responsibility, layers, repositories, use cases, domain modeling |
| [generic/security.md](generic/security.md) | Secrets, input validation at boundaries, unsafe operations |
| [generic/testing.md](generic/testing.md) | What must be tested, behavior-not-implementation, test quality |
| [generic/process.md](generic/process.md) | How the work is done: when to plan, when to stop and ask, verification and human review, shared systems |

**Language and profile** — declared in [`../project.md`](../project.md): the rules are `lang/<language>.md` and the `<profile>/` folder, whose own `README.md` indexes the profile and links its language file. This index does not link them on purpose: a project keeps only its own language and profile ([init](../init/prompt-init.md) step 3), and removing the others must not leave broken links in a file that an update replaces. The skeleton ships the profiles `dhis2-react` (language `typescript`) and `dhis2-android` (language `kotlin`).

**`project/`** — this project's own rules (added restrictions and explicit exceptions to the rules above); see [project/README.md](project/README.md).
