# Technical debt

Debt found and deliberately postponed. Each entry says what it is, why it matters and when to address it.

## The xMART table model lives in the domain with xMART's shape

- **Found:** 2026-10-09, review of task 5.5 of `send-file-to-xmart-as-multipart`
  (`clean-architecture-code-smells` → smell 11, implicit infrastructure coupling in the domain).
- **What:** `XMartLoadModelData`, `XMartTableDefinition`, `XMartFieldDefinition` and `xMartSyncTableTemplates`
  (`src/domain/entities/xmart/xMartSyncTableTemplates.ts`) have the shape of xMART's system tables: field type
  codes (`"TEXT_MAX"`, `"FOREIGN_KEY"`), `0 | 1` flags, `_RecordID`, `_Delete`. `SaveActionsUseCase` builds them
  as they are and `XMartRepository.loadModel` receives them.
- **Why it matters:** it breaks `.est_ai/rules/generic/architecture.md` → *"Entities model application concepts,
  not the shapes of the external system they come from. The repository maps external → domain."* A change in
  xMART's format forces a change in the domain. It has already happened: xMART requires `IS_PRIMARY_KEY` and
  `IS_REQUIRED` on every field, and that constraint is met in the domain.
- **Proposal:** a domain model of its own (tables and fields with type, key and whether they are required) that
  `XMartDefaultRepository` translates into xMART's format, as `UserD2Repository.buildUser` does in the
  `dhis2-app-skeleton` reference.
- **When:** a separate change, after `send-file-to-xmart-as-multipart` (a non-goal there: it does not change what
  the use cases gather). That change already reduces it: the use case no longer knows the pipeline, the JSON or
  the URL.
