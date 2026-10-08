---
author: est-ai
profile: dhis2-react
version: "0.1.0"
generatedBy: "0.1.0"
---

# React

Applies to new code. See [scope](../README.md#scope-new-code-vs-legacy). Layer boundaries (where `compositionRoot` comes from, what may not enter `webapp/`) live in [architecture.md](architecture.md); this file is about how the component is written.

## Components vs custom hooks

- **A component holds only render logic** — JSX and event handlers that wire UI events to hook callbacks. Nothing else.
- **Presentation logic lives in custom hooks**: state, effects, data fetching, derived values, formatting, and the orchestration of use-case calls. The component consumes a hook and renders its result.
- No business logic in components — it belongs in use cases or entities.

## Dependencies & context

- Components access `compositionRoot` only through `useAppContext()` — never instantiate dependencies or `D2Api` in a component.
- One global `AppContext`; no per-feature contexts.

## Styling

- New components are styled with `styled-components`. **No new `makeStyles`.** Existing `makeStyles` is legacy and is not a violation. Where the project uses ESLint, enforce it with `no-restricted-imports` on `makeStyles` rather than leaving it to review.
