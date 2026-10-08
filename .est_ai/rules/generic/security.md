---
author: est-ai
profile: generic
version: "0.1.0"
generatedBy: "0.1.0"
---

# Security

Applies to new code. See [scope](../README.md#scope-new-code-vs-legacy).

## Secrets

- No passwords, API keys, tokens or other credentials hardcoded in source. They come from environment configuration, never literals in the code.
- No secrets in logs, error messages, or committed fixtures.

## Input validation at boundaries

- External inputs (API responses, user input, file contents, query params) are **validated at the boundary** — in `data/` or presentation — before they flow inward. Do not trust the shape of external data. Domain constraints (ranges, formats with domain meaning) are enforced by the entity or value object — see [architecture.md](architecture.md#domain-modeling).
- Validate that required fields exist and have the expected type before use; reject or handle malformed input explicitly rather than letting it propagate.

## Unsafe operations

- No untrusted input concatenated into queries, shell commands, file paths, or HTML.
- No disabling of platform safety (e.g. `dangerouslySetInnerHTML` with unsanitized data) without an explicit, justified reason.
