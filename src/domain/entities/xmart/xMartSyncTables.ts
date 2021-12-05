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
    CODE: string;
    TITLE: string;
    DESCRIPTION?: string;
    XML: string;
    _Delete?: 0 | 1;
}

export interface xMartTable {
    table: XMartTableDefinition;
    fields: XMartFieldDefinition[];
}

export type xMartTableKey = "dataValues" | "events" | "eventValues" | "teis" | "teiAttributes" | "enrollments";

const tableCodes = {
    dataValues: "DATA_VALUES_",
    events: "EVENTS",
    eventValues: "EVENT_VALUES",
    teis: "TRACKED_ENTITY_INSTANCES",
    teiAttributes: "TEI_ATTRIBUTES",
    enrollments: "ENROLLMENTS_",
};

export const xMartSyncTables: Record<xMartTableKey, xMartTable> = {
    dataValues: {
        table: { CODE: tableCodes.dataValues, TITLE: "Data Values" },
        fields: [
            {
                TABLE_CODE: tableCodes.dataValues,
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.dataValues,
                CODE: "period",
                TITLE: "Period",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.dataValues,
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.dataValues,
                CODE: "dataElement",
                TITLE: "Data Element",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.dataValues,
                CODE: "attributeOptionCombo",
                TITLE: "Attribute Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.dataValues,
                CODE: "categoryOptionCombo",
                TITLE: "Category Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.dataValues,
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
        table: { CODE: tableCodes.events, TITLE: "Events" },
        fields: [
            {
                TABLE_CODE: tableCodes.events,
                CODE: "event",
                TITLE: "Event",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.events,
                CODE: "program",
                TITLE: "Program",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.events,
                CODE: "programStage",
                TITLE: "Program Stage",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.events,
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.events,
                CODE: "enrollment",
                TITLE: "Enrollment",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.events,
                CODE: "attributeCategoryOptions",
                TITLE: "Attribute Category Options",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.events,
                CODE: "attributeOptionCombo",
                TITLE: "Attribute Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.events,
                CODE: "dueDate",
                TITLE: "Due Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.events,
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
        table: { CODE: tableCodes.eventValues, TITLE: "Event Values" },
        fields: [
            {
                TABLE_CODE: tableCodes.eventValues,
                CODE: "event",
                TITLE: "Event",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.eventValues,
                CODE: "dataElement",
                TITLE: "Data Element",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.eventValues,
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.eventValues,
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
        table: { CODE: tableCodes.teis, TITLE: "Tracked Entity Instances" },
        fields: [
            {
                TABLE_CODE: tableCodes.teis,
                CODE: "trackedEntityInstance",
                TITLE: "Tracked Entity Instance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.teis,
                CODE: "trackedEntityType",
                TITLE: "Tracked Entity Type",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.teis,
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
        table: { CODE: tableCodes.teiAttributes, TITLE: "TEI Attributes" },
        fields: [
            {
                TABLE_CODE: tableCodes.teiAttributes,
                CODE: "trackedentityInstance",
                TITLE: "Tracked EntityInstance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.teiAttributes,
                CODE: "attribute",
                TITLE: "Attribute",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.teiAttributes,
                CODE: "code",
                TITLE: "Code",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.teiAttributes,
                CODE: "displayName",
                TITLE: "Display Name",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.teiAttributes,
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.teiAttributes,
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
        table: { CODE: tableCodes.enrollments, TITLE: "Enrollments" },
        fields: [
            {
                TABLE_CODE: tableCodes.enrollments,
                CODE: "enrollment",
                TITLE: "Enrollment",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.enrollments,
                CODE: "trackedEntityInstance",
                TITLE: "Tracked Entity Instance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.enrollments,
                CODE: "program",
                TITLE: "Program",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.enrollments,
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.enrollments,
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: tableCodes.enrollments,
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
