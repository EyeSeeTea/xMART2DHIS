# xMART4 Pipelines to create data/models/pipelines from external URLs

### Load pipelines from URL

The ``LOAD_PIPELINE`` pipeline receives a ``url`` input variable.

The JSON file loaded from the ``url`` has the following structure:

```ts
type LoadPipelineJson = Pipeline[];

interface Pipeline {
    CODE: string;
    TITLE: string;
    DESCRIPTION?: string;
    XML: string;
    _Delete?: 0 | 1;
}
```

It will create a pipeline and an origin with the same code, both the ``draft`` and ``published`` XML will be the same.

## Load model from URL

The ``LOAD_MODEL`` pipeline receives a ``url`` input variable.

The JSON file loaded from the ``url`` has the following structure:

```ts
interface LoadPipelineJson {
    tables: Table[];
    fields: Field[];
}

interface Table {
    CODE: string;
    TITLE: string;
    DESCRIPTION?: string;
    ON_DELETE_CASCADE?: 0 | 1;
    _RecordID?: string;
    _Delete?: 0 | 1;
}

interface Field {
    CODE: string;
    TITLE: string;
    DESCRIPTION?: string;
    SEQUENCE?: unknown;
    TABLE_CODE: string; // Internal look up to TABLE_ID
    FIELD_TYPE_CODE: string; // Internal look up to FIELD_TYPE_ID
    FK_TABLE_CODE?: string; // Internal look up to FK_TABLE_ID
    IS_REQUIRED?: 0 | 1;
    IS_PRIMARY_KEY?: 0 | 1;
    IS_ROW_TITLE?: 0 | 1;
    DO_NOT_COMPARE?: 0 | 1;
    _RecordID?: string;
    _Delete?: 0 | 1;
}
```

It will create the model with the provided tables and fields.

## Load data from URL

The ``LOAD_DATA`` pipeline receives a ``table`` and a ``url`` input variables.

The ``table`` property will set the destination table where the data will be loaded in a MERGE strategy.

The JSON file loaded from the ``url`` has the following structure:

```ts
type LoadPipelineJson = Record<Column, Value>[];

type Column = string;
type Value = string | number | boolean;
```

The provided array will load as rows, and the object property will map to the column.
