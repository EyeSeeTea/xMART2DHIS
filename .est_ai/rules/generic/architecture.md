---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Architecture — Clean Architecture (base)

Stack-agnostic Clean Architecture rules. DHIS2/d2-api specifics live in [dhis2-react/architecture.md](../dhis2-react/architecture.md).

Applies to new code. See [scope](../README.md#scope-new-code-vs-legacy).

## Single responsibility

- A file, function, class or module has **one reason to change**. If it mixes unrelated concerns or does too many things, split it.
- Watch for functions that both decide and act, modules that group unrelated helpers, or components that fetch, transform and render at once — each concern belongs apart.

## Avoid accidental complexity

- Before introducing a new mechanism, state, abstraction or integration point to fix existing behavior, inspect the current implementation and its Git history.
- Prefer restoring or extending an existing mechanism over creating a parallel one. A new parallel mechanism requires evidence that the existing one cannot satisfy the requirement.

## Layers & dependency rule

- Entities, value objects and repository **interfaces** live in `domain/`; repository **implementations** in `data/`; presentation (components, UI, CLI) in the outer layer.
- `domain/` imports nothing from `data/` or presentation, and nothing from the runtime platform (`File`, `window`, DOM, `fetch`).
- Outer layers depend on inner layers, never the reverse.

## Domain modeling

- Entities model **application concepts**, not the shapes of the external system they come from. The repository maps external → domain.
- Entities contain business-logic methods (`user.isAdmin()`, `campaign.isActive()`) — they are not plain data containers.
- Independent entities relate by **Id, not object reference**. If a use case needs a related entity, it fetches it separately through that entity's repository.
- Values with domain meaning or constraints are modeled as entities/value objects — not passed as raw primitives between layers.
- Validation of external inputs is split by kind:
  - **Structural** — shape, types, parsing of API responses or user input — happens in `data/` or presentation, never inside domain entities.
  - **Domain constraints** — what makes a value valid in the domain (an email's format, a positive quantity, a date range in order) — are enforced by the entity or value object itself when it is created, whichever layer creates it.

## Repositories

- A repository interface expresses domain capabilities — method names reflect what the domain needs, not how data is stored.
- Repositories return domain entities, not primitives.
- Repositories do not call other repositories — the use case coordinates multiple sources.
- Repositories treat data as a collection: no business logic, no calculated fields.
- Each repository defines only the methods its use cases need. No generic `Repository<T>` base interface.

## Use cases

- A use case exposes exactly one public method: `execute()`. Shared logic between use cases belongs in entity methods or helpers, not a second public method.
- Use cases do not call other use cases.
- Read use cases return domain entities, not primitives.
- Use cases orchestrate flow; business rules that belong to an entity live in the entity, not the use case.
- Not everything needs a use case or repository. Infrastructure concerns (app config, file exports, external tool integrations) are resolved outside `domain/`.

## CompositionRoot — the layer boundary

- Dependencies are wired in the composition root, never instantiated inside use cases or presentation.
- The composition root returns only use cases.
