import { Dhis2ModelKey } from "../mapping/Mapping";

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

export const xMARTdefaultTableCodes = {
    dataValues: "DHIS2_DATA_VALUES",
    events: "DHIS2_EVENTS",
    eventValues: "DHIS2_EVENT_VALUES",
    teis: "DHIS2_TRACKED_ENTITY_INSTANCES",
    teiAttributes: "DHIS2_TEI_ATTRIBUTES",
    enrollments: "DHIS2_ENROLLMENTS",
};

export const xMartSyncTables: Record<Dhis2ModelKey, xMartTable> = {
    dataValues: {
        table: { CODE: xMARTdefaultTableCodes.dataValues, TITLE: "Data Values" },
        fields: [
            {
                TABLE_CODE: xMARTdefaultTableCodes.dataValues,
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.dataValues,
                CODE: "period",
                TITLE: "Period",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.dataValues,
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.dataValues,
                CODE: "dataElement",
                TITLE: "Data Element",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.dataValues,
                CODE: "attributeOptionCombo",
                TITLE: "Attribute Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.dataValues,
                CODE: "categoryOptionCombo",
                TITLE: "Category Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.dataValues,
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
        table: { CODE: xMARTdefaultTableCodes.events, TITLE: "Events" },
        fields: [
            {
                TABLE_CODE: xMARTdefaultTableCodes.events,
                CODE: "event",
                TITLE: "Event",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.events,
                CODE: "program",
                TITLE: "Program",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.events,
                CODE: "programStage",
                TITLE: "Program Stage",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.events,
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.events,
                CODE: "enrollment",
                TITLE: "Enrollment",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 0,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.events,
                CODE: "attributeCategoryOptions",
                TITLE: "Attribute Category Options",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.events,
                CODE: "attributeOptionCombo",
                TITLE: "Attribute Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.events,
                CODE: "dueDate",
                TITLE: "Due Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.events,
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
        table: { CODE: xMARTdefaultTableCodes.eventValues, TITLE: "Event Values" },
        fields: [
            {
                TABLE_CODE: xMARTdefaultTableCodes.eventValues,
                CODE: "event",
                TITLE: "Event",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.eventValues,
                CODE: "dataElement",
                TITLE: "Data Element",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.eventValues,
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.eventValues,
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
        table: { CODE: xMARTdefaultTableCodes.teis, TITLE: "Tracked Entity Instances" },
        fields: [
            {
                TABLE_CODE: xMARTdefaultTableCodes.teis,
                CODE: "trackedEntityInstance",
                TITLE: "Tracked Entity Instance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.teis,
                CODE: "trackedEntityType",
                TITLE: "Tracked Entity Type",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.teis,
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
        table: { CODE: xMARTdefaultTableCodes.teiAttributes, TITLE: "TEI Attributes" },
        fields: [
            {
                TABLE_CODE: xMARTdefaultTableCodes.teiAttributes,
                CODE: "trackedentityInstance",
                TITLE: "Tracked EntityInstance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.teiAttributes,
                CODE: "attribute",
                TITLE: "Attribute",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.teiAttributes,
                CODE: "displayName",
                TITLE: "Display Name",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.teiAttributes,
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.teiAttributes,
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
        table: { CODE: xMARTdefaultTableCodes.enrollments, TITLE: "Enrollments" },
        fields: [
            {
                TABLE_CODE: xMARTdefaultTableCodes.enrollments,
                CODE: "enrollment",
                TITLE: "Enrollment",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.enrollments,
                CODE: "trackedEntityInstance",
                TITLE: "Tracked Entity Instance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.enrollments,
                CODE: "program",
                TITLE: "Program",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.enrollments,
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.enrollments,
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTdefaultTableCodes.enrollments,
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
