## Context

See proposal.md → *Why*. Current state:

- Three use cases transfer a JSON file to xMART the same way: `FileRepository.uploadFileAsExternal` creates a DHIS2 document shared with `externalAccess`, and `XMartRepository.runPipeline` starts a pipeline with its URL as the `url` input. `TestConnectionUseCase` then deletes the document; `SaveActionsUseCase` and `ExecuteActionUseCase` leave it in DHIS2.
- The pipelines (`data/utils/pipelines/`) download that URL with `GetWebService` and parse it with `GetJson`. `LOAD_PIPELINE` is `IsStructure` and `MERGE`s the system tables `PIPELINE` and `ORIGIN` (itself included). It is pasted by hand once per mart through `PipelineSetupDialog` (step 2 shows the code, step 3 the `LoadPipeline` XML); the pages open the dialog when the error is `Origin code 'LOAD_PIPELINE' does not exists` or `Sequence contains no elements`.
- `XMartDefaultRepository.futureFetch` always sends `Content-Type: application/json` and only accepts a `string` body. If the direct request fails, it retries once through the CORS proxy `dev.eyeseetea.com/cors` (also in production).
- `getBatchStatusPolling` returns when `ProcessStepCode == "COMPLETED"` and never looks at `ProcessResultCode`.

Proof of concept (xMART 4.35.3, UAT, mart `TRAINING_EYESEETEA`, `POC_*` pipelines with the user's token):

| Check | Result |
|---|---|
| `POST /external/origin/start` with `multipart/form-data` (`file`) and the user's token | Works for normal and `IsStructure` pipelines; other inputs (`table`) still go in the query string |
| Getter directly in `<Extract>` reads the uploaded file | Yes (`<GetJson><Path>$</Path></GetJson>`) |
| Two `GetJson` over the same uploaded file (`tables`, `fields`) | Yes; no zip needed |
| `LOAD_DATA` load strategy | `MERGE`, `DeleteNotInSource="false"`: updates and adds, deletes nothing |
| Previous `LOAD_PIPELINE` started without `url` | Rejected at start, no batch: `This batch requires input variables: 'url'.` |
| Current `LoadModel` XML | Critical error, batch `INVALID`: `TestRow` `ContextColumns` names `FIELD_TYPE`, which does not exist (`FIELD_TYPE_CODE`) |
| Current `LoadPipeline` XML | Rows rejected: `PIPELINE.TypeID` is required. `TypeID = 1` is Flow, `2` is Normal |
| Pipeline registered through `PIPELINE`/`ORIGIN` | Does not run (`GetJson … Parameter 'path'` empty) until `ORIGIN.IsFileBased = 1`; with it, it runs without publishing in the UI |

The last three rows are failures that happen today and go unnoticed because of the `ProcessResultCode` gap. `IsFileBased` comes from xMART 4.26 (release notes #4794, #5142): the UI sets it on publish.

Constraints: the project's own `Future` (`.est_ai/rules/project/async.md`), React 17 / `@dhis2/ui` 7 (`.est_ai/rules/project/versions.md`).

## Goals / Non-Goals

**Goals:**
- One way to send a file to xMART, owned by the xMART repository; no DHIS2 involvement.
- Failures from xMART (start error or non-`SUCCESS` result) surface through the existing `FutureData` error channel, so the pages keep their current error handling.
- Pipelines of this version and of previous versions coexist in a mart.

**Non-Goals:**
- Changing what the use cases gather for xMART (the tables/fields model, the data rows).
- Polling changes beyond reading the result and removing the unused `maxRetries` (decision 5): no new interval, timeout or retry limit.
- Replacing `ts-mockito` in the existing test.
- Creating or publishing pipelines through xMART's undocumented internal API.

## Decisions

### 1. The xMART port expresses what the app needs, not how xMART does it

`XMartRepository` gets three operations in domain language, and loses `runPipeline`:

- `loadModel(mart, model: XMartLoadModelData)`: create or update the mart's tables and fields.
- `loadData(mart, table, rows)`: load rows into a table of the mart.
- `checkConnection(mart)`: check that the mart is ready to receive the app's data.

Each returns the batch id (`FutureData<number>`), as `runPipeline` does today. How each is done is the adapter's business: `XMartDefaultRepository` picks the pipeline (`LOAD_MODEL_V2`, `LOAD_DATA_V2`, `LOAD_PIPELINE_V2`), serialises the payload to JSON, sends it as a multipart file to `/origin/start` and polls the batch (a private `startPipeline`). `checkConnection` runs `LOAD_PIPELINE_V2` with the definitions of the app's pipelines, so it also registers and updates them.

- Why: today `runPipeline(mart, pipeline, params)` is xMART's transport as is (pipeline code, loose inputs, a URL, now a file), so the use cases know pipeline codes, the file format (`JSON.stringify`) and even the pipeline XML (`TestConnectionUseCase` imports them from `data/`). Any change on xMART's side reaches the domain, as the move to `_V2` shows. With intent operations, if xMART offered a plain REST API for tables and rows, only the adapter would change. (*Clean Architecture code smells* → implicit infrastructure coupling in the domain.)
- No pipeline-specific operation such as `registerPipelines`: pipelines are xMART's mechanism, not something the app needs; with another API that operation would be meaningless. Test connection's intent is "is this mart ready?".
- The file sent to xMART (`PipelineFile`: `name`, `content`) is a type of the data layer; the `Blob` is built there, so `domain/` depends on no platform type. The legacy `FileInfo` (`data: Blob`) is not reused.
- Transition: the public `runPipeline` stays in the port while the use cases still send a URL, and is removed once the three use cases move to the new operations (tasks, group 5).
- Alternative: keep a generic `runPipeline(mart, pipeline, params, file)` in the port. Rejected for the reasons above.
- Alternative: keep `FileRepository` with an xMART implementation. Rejected: the file is no longer stored anywhere; it is part of the run request.

**Data flow (running an action):** `ExecuteActionUseCase` gathers the rows of each table (domain) → `XMartRepository.loadData(mart, table, rows)` (domain port) → `XMartDefaultRepository` serialises the rows to a JSON file, gets the API token from `AzureRepository`, posts `multipart/form-data` to `/origin/start` with `originCode=LOAD_DATA_V2` and `table`, polls `/batch/{id}/status` until `COMPLETED` and checks `ProcessResultCode` (data) → `FutureData<number>` back to the use case → the page shows the summary or the error (presentation, unchanged). Saving an action (`loadModel`) and Test connection (`checkConnection`) follow the same path.

### 2. `futureFetch` accepts `FormData` and lets the browser set the content type

The body becomes `string | FormData`. With `FormData`, `futureFetch` does not send `Content-Type`, so the browser adds `multipart/form-data` with its boundary. JSON requests keep `application/json`.

- Alternative: a separate `futureFetchMultipart`. Rejected: it would duplicate the CORS fallback and the error mapping.

### 3. Versioned pipeline names: `_V2`

The app uses `LOAD_PIPELINE_V2`, `LOAD_MODEL_V2` and `LOAD_DATA_V2`, and never touches `LOAD_PIPELINE`, `LOAD_MODEL` or `LOAD_DATA`.

- A mart can be shared by several installations of the app (several DHIS2 instances, or older DHIS2 versions where external sharing still works). Overwriting `LOAD_DATA` with a file-based version would break those installations without anyone touching them.
- Detection becomes the case the app already handles: if `LOAD_PIPELINE_V2` does not exist, xMART answers `Origin code 'LOAD_PIPELINE_V2' does not exists` (decision 6).
- Rollback is free: the previous pipelines stay in the mart.
- **Rule:** the suffix changes only when the pipelines' contract changes (inputs, or the shape of the file), because that would break other installations sharing the mart. Compatible fixes (like decision 4's `FIELD_TYPE_CODE`) keep the suffix and reach every mart on the next Test connection.
- The pipeline codes and their XML live only in the data layer; the use cases never name them (decision 1), and the setup dialog takes `LOAD_PIPELINE_V2` and its XML from there.
- Alternative: reuse the current names. Rejected for the reason above.
- Alternative: a prefix (`X2D_LOAD_DATA_V2`). Rejected: further from the names users already know.

### 4. Pipelines read the uploaded file, and register runnable pipelines

The XML in `src/data/utils/pipelines/` (`LoadPipeline.ts`, `LoadModel.ts`, `LoadData.ts`) changes as validated in the proof of concept. The files keep their names: the version lives only in the pipeline codes (decision 3). While the use cases still run the previous pipelines, the new XML lives in temporary `V2` files next to them. The changes:

- `LOAD_DATA_V2`: `<GetJson OutputTableName="data"><Path>$</Path></GetJson>` directly in `<Extract>`; only the `table` input. Load section unchanged (`MERGE`, `DeleteNotInSource="false"`, `ColumnMappings Auto`).
- `LOAD_MODEL_V2`: two `GetJson` over the same file (`tables`, `fields`); `TestRow` `ContextColumns="CODE,FIELD_TYPE_CODE,IS_PRIMARY_KEY"`. Rest of the load unchanged.
- `LOAD_PIPELINE_V2`: reads the array of definitions; in the `PIPELINE` load, `<AddColumn Name="TYPE_ID" FillWith="2" />` mapped to `TypeID` (Normal); in the `ORIGIN` load, `<AddColumn Name="IS_FILE_BASED" FillWith="1" />` mapped to `IsFileBased`. All three pipelines read a file, so the flag is the same for all.
- The `?from=xmart` query and the `from-xmart` header (used to tell DHIS2 requests from xMART) disappear with `GetWebService`.
- `TypeID = 2` is a fixed id confirmed on UAT. Alternative: a lookup by type code (`NORMAL`), like `FIELD_TYPE_CODE` → `FIELD_TYPE_ID`. Rejected for now: the type table is not documented. The id is checked on PROD before release (tasks); if it differs, the lookup becomes necessary.

### 5. Success means `ProcessResultCode == "SUCCESS"`

`getBatchStatusPolling` keeps polling until `COMPLETED`. Every load (`loadModel`, `loadData`, `checkConnection`) then returns the batch id only for `SUCCESS`; any other result becomes `Future.error` with a translated message that includes the batch id, `ProcessResultCode` and `ProcessResultTitle`.

- The unused `maxRetries` option of the polling is removed: no caller sets it, so polling only ends on `COMPLETED`, and its branch (a batch reported as success without finishing) could never run. The polling returns the completed status type, so the result check needs no "not finished" case.

### 6. "The mart needs setting up": a domain error, not xMART strings in the pages

`checkConnection` maps the failures that mean "`LOAD_PIPELINE_V2` is missing" (`Origin code 'LOAD_PIPELINE_V2' does not exists`, `Sequence contains no elements`) to one domain error, *the mart needs setting up*, which names no pipeline. Both pages open `PipelineSetupDialog` on that error; the dialog shows the steps and the XML of `LOAD_PIPELINE_V2`, taken from the data layer.

- Alternative: keep matching the strings in each page. Rejected: duplicated in two pages and tied to xMART's wording.

### 7. Remove `FileRepository` and `FileD2ApiRepository`

Nothing else uses them once the three use cases stop. `compositionRoot.ts` stops building `FileD2ApiRepository`; the use case constructors lose the `fileRepository` argument. The public `runPipeline` leaves the port at the same time (decision 1).

## Risks / Trade-offs

- [The CORS proxy may not forward multipart bodies] → Checked from the app running locally (dev always uses the proxy). If it fails, multipart requests skip the proxy fallback in production and the dev setup documents a direct origin.
- [`TypeID = 2` may not be Normal on PROD] → Checked on PROD before release; if it differs, switch to a lookup or a per-environment value.
- [xMART keeps adding required system columns (as with `TypeID` and `IsFileBased`)] → The stricter success check (decision 5) makes the next such change visible on Test connection instead of failing silently.
- [Large actions send big files in one request] → Same size as the documents created today. No chunking in this change.
- [Stricter success check surfaces errors that were silently ignored] → Intended. Error messages include xMART's result so users can open the batch in xMART.
- [Previous pipelines stay in marts] → Release notes say they can be deleted once no older installation uses the mart.

## Migration Plan

1. Release the new version.
2. For each mart: run Test connection → the setup dialog opens → paste `LOAD_PIPELINE_V2` (type Normal) and publish → run Test connection again, which registers `LOAD_MODEL_V2` and `LOAD_DATA_V2`.
3. Rollback: install the previous version; its pipelines are still in the mart (only useful on DHIS2 versions that still allow external sharing).
4. Optional clean-up, outside the app: delete `LOAD_PIPELINE`, `LOAD_MODEL` and `LOAD_DATA` once no older installation uses the mart, and the leftover `xMART2DHIS_*` documents in DHIS2.
