## Why

The app sends every file to xMART (pipeline definitions on Test connection, the table model when an action is saved, the data when an action runs) by publishing it as a public DHIS2 document and passing its URL to a pipeline that downloads it (`GetWebService`). DHIS2 2.42+ removed external sharing, so `uploadFileAsExternal` no longer produces a URL xMART can read, and Test connection, saving actions and running actions all fail. xMART's `/origin/start` accepts the file itself as `multipart/form-data`, so DHIS2 is no longer needed as an intermediate store.

A proof of concept against xMART 4.35 (UAT) confirmed the approach and found three failures that already happen today and go unnoticed, because the app treats any finished batch as a success:

- `LOAD_MODEL` ends `INVALID`: a validation rule names a column that does not exist (`FIELD_TYPE` instead of `FIELD_TYPE_CODE`).
- `LOAD_PIPELINE` registers nothing: xMART now requires the pipeline type (`TypeID`) on every pipeline.
- A pipeline registered by `LOAD_PIPELINE` does not run until someone publishes it by hand: since xMART 4.26 the origin must be flagged as file-based (`IsFileBased`), which only the UI sets on publish.

## What Changes

- Send the file in the body of `POST /external/origin/start` as `multipart/form-data` (field `file`) instead of a URL input.
- Use a new, versioned set of pipelines that read the uploaded file instead of downloading it: `LOAD_PIPELINE_V2`, `LOAD_MODEL_V2` and `LOAD_DATA_V2`. The previous `LOAD_PIPELINE`, `LOAD_MODEL` and `LOAD_DATA` are left untouched, so older installations of the app that share a mart keep working.
- `LOAD_PIPELINE_V2` registers pipelines that run without a manual publish (pipeline type Normal, origin flagged as file-based), and `LOAD_MODEL_V2` fixes the wrong validation column.
- Stop creating, sharing and deleting DHIS2 documents. **BREAKING** (internal): `FileRepository` and `FileD2ApiRepository` are removed, together with the `api.sharing.post` call that set `externalAccess`.
- A pipeline run is reported as successful only when xMART finishes the batch with `ProcessResultCode = SUCCESS`; any other result is an error that names it.
- Test connection opens the pipeline setup dialog when the mart has no `LOAD_PIPELINE_V2`, so every mart (new or set up with a previous version) gets it pasted once.

Public interface changes:

| | Old | New |
|---|---|---|
| `XMartRepository.runPipeline` | `(mart, pipeline, params)`; the file travels as the `url` param | `(mart, pipeline, params, file?)`; the file travels in the request body |
| `FileRepository` | `uploadFileAsExternal`, `removeFile` | removed |
| Pipelines used by the app | `LOAD_PIPELINE`, `LOAD_MODEL`, `LOAD_DATA` | `LOAD_PIPELINE_V2`, `LOAD_MODEL_V2`, `LOAD_DATA_V2` |
| `LOAD_DATA*` inputs | `url`, `table` | `table` |
| `LOAD_PIPELINE*`, `LOAD_MODEL*` inputs | `url` | none |

### Goals

- Test connection, saving an action and running an action work again on DHIS2 2.42+ without public documents.
- Test connection keeps registering and updating the app's pipelines with no manual step beyond pasting `LOAD_PIPELINE_V2` once per mart.
- Failed xMART batches are reported as errors, with xMART's result.

### Non-goals

- Switching to xMART's built-in `SYS_DATA_LOAD` origin: the app's own `LOAD_DATA_V2` keeps the `MERGE` / `DeleteNotInSource="false"` load strategy, and `LOAD_MODEL_V2` is needed anyway because `SYS_DATA_LOAD` does not create tables.
- Letting xMART pull from DHIS2 (`Call_DHIS_API` with a Basic Auth connection): it needs DHIS2 credentials stored in every mart and DHIS2 reachable from xMART.
- Deleting the previous pipelines from marts: they may still be used by older installations.

### User impact

- Every mart needs `LOAD_PIPELINE_V2` pasted once; Test connection opens the setup dialog with it.
- No DHIS2 documents named `xMART2DHIS_*` are created any more.
- Errors that were silently ignored (invalid or rejected batches) now fail the action and show xMART's result.

### Compatibility

- Works on any DHIS2 version, since DHIS2 is no longer involved in the transfer.
- Older installations of the app keep using the previous pipelines in the same mart.
- The pipeline type id for Normal (`2`) was confirmed on UAT only; it is checked on PROD before release.

### Rollback plan

- Install the previous version of the app: its pipelines are still in the mart. It only works on DHIS2 versions that still allow external sharing.

## Capabilities

### New Capabilities

- `xmart-pipelines`: how the app runs xMART pipelines — sending the file to xMART, registering the app's pipelines on Test connection, guiding the setup of `LOAD_PIPELINE_V2`, coexisting with previous pipeline versions, and deciding whether a run succeeded from xMART's batch result.

### Modified Capabilities

<!-- None: there are no specs under openspec/specs/ yet. -->

## Impact

- **Domain:** `XMartRepository` (`runPipeline` signature), `FileRepository` (removed), `TestConnectionUseCase`, `SaveActionsUseCase`, `ExecuteActionUseCase`.
- **Data:** `XMartDefaultRepository` (`runPipeline`, `futureFetch` body and headers, `getBatchStatusPolling`), `FileD2ApiRepository` (removed), `data/utils/pipelines/` (new `_V2` XML).
- **Presentation:** `ListConnectionsPage`, `NewConnectionPage` (when to open `PipelineSetupDialog`), `pipeline-setup-dialog` (pipeline code and XML in steps 2 and 3).
- **Wiring:** `compositionRoot.ts` (no `FileD2ApiRepository`).
- **Tests:** `ExecuteActionUseCase.spec.ts` (expects `url` and `LOAD_DATA` today).
- **External systems:** xMART API (`/external/origin/start`, `/external/batch/{id}/status`) on UAT and PROD; xMART system tables `PIPELINE` and `ORIGIN`; the CORS proxy `dev.eyeseetea.com/cors` used as fallback by `futureFetch`.
- **Docs:** README (pipeline setup), i18n if dialog or error texts change.
