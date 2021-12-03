import _ from "lodash";
import i18n from "../../../locales";

export type ConnectionFormField = typeof connectionFormFields[number];

export const connectionFormFields = ["name", "code", "type", "apiUrl"];

export const connectionRequiredFields: ConnectionFormField[] = ["name", "code", "type", "apiUrl"];

export const getConnectionName = (field: ConnectionFormField) => {
    switch (field) {
        case "name":
            return i18n.t("Name");
        case "code":
            return i18n.t("Code");
        case "type":
            return i18n.t("Type");
        case "apiUrl":
            return i18n.t("API URL");
    }
};

export const getConnectionFieldName = (field: ConnectionFormField) => {
    const name = getConnectionName(field);
    const required = connectionRequiredFields.includes(field);
    return _.compact([name, required ? "(*)" : undefined]).join(" ");
};
