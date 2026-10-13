---
name: est-init
description: Adapt the EyeSeeTea AI skeleton to this project after copying it — detect the stack, declare language, profile and reference, fill in DEVELOPMENT.md and the ADAPT markers. Use once, right after the Quick Start copy, or when the user asks to set up or adapt the skeleton.
license: MIT
compatibility: Requires a project containing .est_ai/.
metadata:
  author: est-ai
  profile: generic
  version: "0.1.0"
  generatedBy: "0.1.0"
---

# EyeSeeTea init — adapt the skeleton

Adapt the copied skeleton to this project. This skill carries the full logic by delegating to the protocol — it adds nothing the protocol does not define.

## Execute

Follow [`.est_ai/init/prompt-init.md`](../../../.est_ai/init/prompt-init.md): detect the stack, declare the protocol (language, profile, reference) in `.est_ai/project.md`, fill in `DEVELOPMENT.md` and the other `ADAPT` markers from what the repository shows, ask about project rules, and clean up the markers.

## Output

A single Markdown report of what was detected, filled in, removed, asked and left pending. Do not commit; the developer reviews the diff first.
