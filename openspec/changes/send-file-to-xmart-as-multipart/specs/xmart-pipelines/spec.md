## Purpose

How xMART2DHIS gets data into an xMART mart: it runs the mart's pipelines with the file to load, keeps the app's own pipelines registered in the mart, and reports whether each run succeeded.

## ADDED Requirements

### Requirement: Files reach xMART in the pipeline run request

The app SHALL send the file a pipeline loads (pipeline definitions, table model or data rows) inside the request that starts the pipeline run. It MUST NOT publish the file anywhere for xMART to download, and MUST NOT create, share or delete DHIS2 documents to transfer it.

#### Scenario: Running an action on DHIS2 2.42+

- **WHEN** a user runs an action against a DHIS2 instance without external sharing
- **THEN** each table's rows reach xMART and the action finishes without creating any DHIS2 document

#### Scenario: Saving an action

- **WHEN** a user saves an action
- **THEN** the table model (tables and fields) is sent to xMART in the run request of the model pipeline, and the tables are created or updated in the mart

#### Scenario: Table with no rows

- **WHEN** an action produces no rows for a table
- **THEN** no pipeline run is started for that table and the result reports 0 rows for it

### Requirement: A pipeline run succeeds only when xMART reports success

The app SHALL wait until xMART finishes the batch and SHALL report the run as successful only when xMART's result is `SUCCESS`. Any other final result (`INVALID`, `REJECTED`, `SYSTEM_ERROR`, `CANCELED`, `TIMEOUT_CANCELED`) MUST be reported as an error that includes xMART's result. An error returned when starting the run MUST be reported as is.

#### Scenario: Batch finishes successfully

- **WHEN** xMART finishes the batch with result `SUCCESS`
- **THEN** the run is reported as successful

#### Scenario: Batch finishes with a failure result

- **WHEN** xMART finishes the batch with result `INVALID`, `REJECTED`, `SYSTEM_ERROR`, `CANCELED` or `TIMEOUT_CANCELED`
- **THEN** the run is reported as an error that names that result, and the action or Test connection fails

#### Scenario: xMART refuses to start the run

- **WHEN** xMART answers the start request with an error message or without a batch id
- **THEN** the run is reported as an error with that message

### Requirement: Test connection keeps the app's pipelines up to date

Test connection SHALL run the mart's `LOAD_PIPELINE_V2` with the current definitions of the app's pipelines (`LOAD_PIPELINE_V2`, `LOAD_MODEL_V2`, `LOAD_DATA_V2`). The pipelines it registers MUST be runnable right away, without anyone publishing them in xMART.

#### Scenario: Mart with LOAD_PIPELINE_V2

- **WHEN** a user runs Test connection on a mart that has `LOAD_PIPELINE_V2`
- **THEN** the connection is reported as working, and saving and running actions on that mart work without any manual step in xMART

### Requirement: Guided setup when LOAD_PIPELINE_V2 is missing

When Test connection fails because the mart has no `LOAD_PIPELINE_V2`, the app SHALL open the pipeline setup dialog with the current `LOAD_PIPELINE_V2` definition to paste into xMART. Other Test connection errors MUST be shown as errors without opening the dialog.

#### Scenario: Mart without LOAD_PIPELINE_V2

- **WHEN** a user runs Test connection on a mart that has no `LOAD_PIPELINE_V2`, including a mart set up with a previous version of the app
- **THEN** the pipeline setup dialog opens with the current `LOAD_PIPELINE_V2` definition

#### Scenario: Any other failure

- **WHEN** Test connection fails for another reason (for example, the user has no access to the mart, the network fails, or the batch ends with a failure result)
- **THEN** the error is shown and the setup dialog does not open

### Requirement: Previous pipeline versions are left untouched

The app SHALL only run, register or update pipelines of its own version. It MUST NOT modify or delete `LOAD_PIPELINE`, `LOAD_MODEL` or `LOAD_DATA`, so older installations of the app that share a mart keep working.

#### Scenario: Mart shared with an older installation

- **WHEN** a mart already has the previous pipelines and a user runs Test connection, saves an action or runs an action with this version
- **THEN** the previous pipelines are unchanged, and an older installation of the app can still use them
