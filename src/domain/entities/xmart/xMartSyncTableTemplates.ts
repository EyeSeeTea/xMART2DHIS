import { Dhis2ModelKey } from "../mapping-template/MappingTemplate";

export interface XMartLoadModelData {
    tables: XMartTableDefinition[];
    fields: XMartFieldDefinition[];
}

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
    optionalFields?: string[];
}

export const xMARTTempTableCodes = {
    dataValues: "TEMP_DATA_VALUES",
    events: "TEMP_EVENTS",
    eventValues: "TEMP_EVENT_VALUES",
    teis: "TEMP_TRACKED_ENTITY_INSTANCES",
    teiAttributes: "TEMP_TEI_ATTRIBUTES",
    enrollments: "TEMP_ENROLLMENTS",
    metadata: "TEMP_METADATA",
};

export const xMartSyncTableTemplates: Record<Dhis2ModelKey, xMartTable> = {
    dataValues: {
        table: { CODE: xMARTTempTableCodes.dataValues, TITLE: "Data Values" },
        optionalFields: ["dataElement", "attributeOptionCombo", "categoryOptionCombo", "value", "created"],
        fields: [
            {
                TABLE_CODE: xMARTTempTableCodes.dataValues,
                CODE: "dataSet",
                TITLE: "dataSet",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.dataValues,
                CODE: "period",
                TITLE: "Period",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.dataValues,
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.dataValues,
                CODE: "dataElement",
                TITLE: "Data Element",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.dataValues,
                CODE: "attributeOptionCombo",
                TITLE: "Attribute Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.dataValues,
                CODE: "categoryOptionCombo",
                TITLE: "Category Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.dataValues,
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.dataValues,
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "DATE_TIME",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    events: {
        table: { CODE: xMARTTempTableCodes.events, TITLE: "Events" },
        fields: [
            {
                TABLE_CODE: xMARTTempTableCodes.events,
                CODE: "event",
                TITLE: "Event",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.events,
                CODE: "program",
                TITLE: "Program",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.events,
                CODE: "programStage",
                TITLE: "Program Stage",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.events,
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.events,
                CODE: "enrollment",
                TITLE: "Enrollment",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 0,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.events,
                CODE: "attributeCategoryOptions",
                TITLE: "Attribute Category Options",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.events,
                CODE: "attributeOptionCombo",
                TITLE: "Attribute Option Combo",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.events,
                CODE: "dueDate",
                TITLE: "Due Date",
                FIELD_TYPE_CODE: "DATE_TIME",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: xMARTTempTableCodes.events,
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "DATE_TIME",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    eventValues: {
        table: { CODE: xMARTTempTableCodes.eventValues, TITLE: "Event Values" },
        optionalFields: ["dataElement", "value", "created"],
        fields: [
            {
                TABLE_CODE: "",
                CODE: "event",
                TITLE: "Event",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "dataElement",
                TITLE: "Data Element",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "DATE_TIME",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    teis: {
        table: { CODE: xMARTTempTableCodes.teis, TITLE: "Tracked Entity Instances" },
        fields: [
            {
                TABLE_CODE: "",
                CODE: "trackedEntityInstance",
                TITLE: "Tracked Entity Instance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "trackedEntityType",
                TITLE: "Tracked Entity Type",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "DATE_TIME",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    teiAttributes: {
        table: { CODE: xMARTTempTableCodes.teiAttributes, TITLE: "TEI Attributes" },
        optionalFields: ["attribute", "displayName", "value", "created"],
        fields: [
            {
                TABLE_CODE: "",
                CODE: "trackedentityInstance",
                TITLE: "Tracked EntityInstance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "attribute",
                TITLE: "Attribute",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "displayName",
                TITLE: "Display Name",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "value",
                TITLE: "Value",
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "DATE_TIME",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    enrollments: {
        table: { CODE: xMARTTempTableCodes.enrollments, TITLE: "Enrollments" },
        fields: [
            {
                TABLE_CODE: "",
                CODE: "enrollment",
                TITLE: "Enrollment",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "trackedEntityInstance",
                TITLE: "Tracked Entity Instance",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "program",
                TITLE: "Program",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "orgUnit",
                TITLE: "Organisation Unit",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "enrollmentDate",
                TITLE: "Enrollment Date",
                FIELD_TYPE_CODE: "DATE_TIME",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
    metadata: {
        table: { CODE: xMARTTempTableCodes.metadata, TITLE: "Metadata" },
        fields: [
            {
                TABLE_CODE: "",
                CODE: "name",
                TITLE: "Name",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "shortName",
                TITLE: "Short name",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 0,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "formName",
                TITLE: "Form name",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 0,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "code",
                TITLE: "Code",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "id",
                TITLE: "Identifier",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 1,
                IS_ROW_TITLE: 0,
            },
            {
                TABLE_CODE: "",
                CODE: "created",
                TITLE: "Created Date",
                FIELD_TYPE_CODE: "TEXT_50",
                IS_REQUIRED: 1,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            },
        ],
    },
};
