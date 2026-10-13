---
author: est-ai
profile: typescript
version: "0.1.0"
generatedBy: "0.1.0"
---

# TypeScript

Applies to new code. See [scope](../README.md#scope-new-code-vs-legacy).

- **Derive unions from `const` arrays** when the union also needs runtime values (iteration, validation). Define the `const` array first, derive the type from it. Never `as Type[]` casts.
- No `as any` / `as unknown` to bypass type contracts. No untyped function parameters.
- **Casts: upcast yes, downcast no.** Widening to a supertype (child → parent, e.g. `const a: Animal = dog`) is safe and needs no cast. A downcast to a subtype (parent → child, `animal as Dog`) discards a guarantee the compiler cannot verify, so it is forbidden: narrow with a type guard or discriminant check instead — after it TypeScript already knows the narrower type and no `as` is needed. `as` used to silence the compiler is forbidden too.
- Compose types with `Pick` / `Omit` following existing patterns, rather than redeclaring shapes inline.

## Functional & immutability

TypeScript syntax for [generic/functional.md](../generic/functional.md):

- No `for` / `forEach` loop with a mutable accumulator. Use `map`, `flatMap`, `filter`, `reduce`, or `Object.fromEntries`.
- No `array.push()` or in-place mutation. Return new arrays/objects.
- Search a collection with `array.find()` / `array.filter()`, not a `for` loop with a `break`.
- Immutable data is typed `Readonly<T>` / `ReadonlyArray<T>`.
- `const` by default. `let` only when reassignment is genuinely required.
