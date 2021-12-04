export interface XMartTableDefinition {
    CODE: string;
    TITLE: string;
    DESCRIPTION?: string;
    ON_DELETE_CASCADE?: 0 | 1;
    _RecordID?: string;
    _Delete?: 0 | 1;
}

export interface XMartFieldDefinition {
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

export interface XMartPipelineDefinition {
    Code: string;
    Title: string;
    Description?: string;
    XML: string;
    _Delete?: 0 | 1;
}

export interface xMartTable {
    table: XMartTableDefinition;
    fields: XMartFieldDefinition[];
}

export type xMartTableKey = "dataValues" | "events" | "eventValues" | "teis" | "teiAttributes" | "enrollments";

export const xMartSyncTables: Record<xMartTableKey, xMartTable> = {
    dataValues: {
        table: { CODE: "DATA_VALUES", TITLE: "Events" },
        fields: [
            {
                TABLE_CODE: "DATA_VALUES",
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "DATA_VALUES",
                CODE: "period",
                TITLE: "Period",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "DATA_VALUES",
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "DATA_VALUES",
                CODE: "dataElement",
                TITLE: "Data Element",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "DATA_VALUES",
                CODE: "attributeOptionCombo",
                TITLE: "Attribute Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "DATA_VALUES",
                CODE: "categoryOptionCombo",
                TITLE: "Category Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "DATA_VALUES",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    events: {
        table: { CODE: "EVENTS", TITLE: "Events" },
        fields: [
            {
                TABLE_CODE: "EVENTS",
                CODE: "event",
                TITLE: "Event",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENTS",
                CODE: "program",
                TITLE: "Program",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENTS",
                CODE: "programStage",
                TITLE: "Program Stage",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENTS",
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENTS",
                CODE: "enrollment",
                TITLE: "Enrollment",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENTS",
                CODE: "attributeCategoryOptions",
                TITLE: "Attribute Category Options",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENTS",
                CODE: "attributeOptionCombo",
                TITLE: "Attribute Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENTS",
                CODE: "dueDate",
                TITLE: "Due Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "DATA_VALUES",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    eventValues: {
        table: { CODE: "EVENT_VALUES", TITLE: "Event Values" },
        fields: [
            {
                TABLE_CODE: "EVENT_VALUES",
                CODE: "event",
                TITLE: "Event",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENT_VALUES",
                CODE: "dataElement",
                TITLE: "Data Element",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENT_VALUES",
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENT_VALUES",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    teis: {
        table: { CODE: "TRACKED_ENTITY_INSTANCES", TITLE: "Tracked Entity Instances" },
        fields: [
            {
                TABLE_CODE: "TRACKED_ENTITY_INSTANCES",
                CODE: "trackedEntityInstance",
                TITLE: "Tracked Entity Instance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "TRACKED_ENTITY_INSTANCES",
                CODE: "trackedEntityType",
                TITLE: "Tracked Entity Type",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "TRACKED_ENTITY_INSTANCES",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    teiAttributes: {
        table: { CODE: "TEI_ATTRIBUTES", TITLE: "TEI Attributes" },
        fields: [
            {
                TABLE_CODE: "TEI_ATTRIBUTES",
                CODE: "trackedentityInstance",
                TITLE: "Tracked EntityInstance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "TEI_ATTRIBUTES",
                CODE: "attribute",
                TITLE: "Attribute",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "TEI_ATTRIBUTES",
                CODE: "code",
                TITLE: "Code",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "TEI_ATTRIBUTES",
                CODE: "displayName",
                TITLE: "Display Name",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "TEI_ATTRIBUTES",
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "TEI_ATTRIBUTES",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    enrollments: {
        table: { CODE: "ENROLLMENTS", TITLE: "Enrollments" },
        fields: [
            {
                TABLE_CODE: "ENROLLMENTS",
                CODE: "enrollment",
                TITLE: "Enrollment",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "ENROLLMENTS",
                CODE: "trackedEntityInstance",
                TITLE: "Tracked Entity Instance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENTS",
                CODE: "program",
                TITLE: "Program",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "EVENTS",
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "ENROLLMENTS",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "ENROLLMENTS",
                CODE: "enrollmentDate",
                TITLE: "Enrollment Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
};
