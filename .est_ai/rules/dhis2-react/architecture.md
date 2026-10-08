---
author: est-ai
profile: dhis2-react
version: "0.1.0"
generatedBy: "0.1.0"
---

# Architecture — DHIS2 specifics

DHIS2 / d2-api rules on top of [generic/architecture.md](../generic/architecture.md).

Applies to new code. See [scope](../README.md#scope-new-code-vs-legacy).

## Domain modeling

- Entities model application concepts, **not DHIS2 structures** — prefer `Country` over `OrgUnit`, `Indicator` over `DataElement`. The repository maps DHIS2 → domain. `D2*` types must not appear in `domain/`. Exception: when the DHIS2 concept genuinely *is* the application's domain (e.g. a metadata-management tool).

## Repositories & d2-api

- No repository calls `fetch` or `axios` directly — only `d2-api`.
- `D2Api` is used only from repositories.
- API field selections use `MetadataPick` — no inline duplication of the API shape.

## CompositionRoot

- `D2Api` is instantiated only in `getWebappCompositionRoot()`.
- `compositionRoot` is consumed only from custom hooks or components, via `useAppContext()` (see [react.md](react.md)).

## Completeness checks

- [ ] If a new repository was added, **both** the interface in `domain/repositories/` **and** the implementation in `data/repositories/` exist.
- [ ] If a new repository or use case was added, it is wired in `getWebappCompositionRoot()`.

## Async — Future, not Promise

- New repositories and use cases return `FutureData<T>` (our lazy, cancellable async abstraction). **Never `Promise` in new `domain/` or `data/` code.**
- In React, Futures are executed with `.run(onSuccess, onError)` inside `useEffect`.
- `.toPromise()` appears only in tests.
- **Legacy Promise code is not a violation.** It is not migrated opportunistically; only in a deliberate, bounded refactor. References to copy always use Future.
- **If the project already has its own `Future`, new code uses it** — do not add the reference's next to it ([scope](../README.md#scope-new-code-vs-legacy)).
