---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Functional programming & immutability

Applies to new code. See [scope](../README.md#scope-new-code-vs-legacy).

The language-specific syntax for these principles lives in the project's [`lang/`](../lang/) file.

- Transform collections with declarative operations (map, filter, reduce, find), not loops that mutate an accumulator or break out on a match.
- No in-place mutation of collections or objects. Transformations return new values.
- Do not mutate function arguments or shared state.
- Data structures that should not change after creation are declared immutable. Apply immutability at the file level, not just per function.
- Bindings are immutable by default; reassignable only when genuinely required.
- Prefer composition over inheritance — build behavior from small focused functions, not deep class hierarchies.
