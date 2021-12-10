import {
    composeValidators,
    createMaxCharacterLength,
    createMinCharacterLength,
    hasValue,
    InputFieldFF,
    SingleSelectFieldFF,
} from "@dhis2/ui";
import i18n from "@eyeseetea/d2-ui-components/locales";
import _ from "lodash";
import React from "react";
import { DataMart, DataMartEnvironment } from "../../../domain/entities/xmart/DataMart";
import { FormField } from "../../components/form/FormField";

const useValidations = (field: ConnectionFormField): { validation?: (...args: any[]) => any; props?: object } => {
    switch (field) {
        case "name":
        case "martCode":
        case "dataEndpoint":
        case "environment":
            return {
                validation: composeValidators(hasValue, createMinCharacterLength(1), createMaxCharacterLength(255)),
            };
        default: {
            return { validation: requiredFields.includes(field) ? hasValue : undefined };
        }
    }
};

export const RenderConnectionField: React.FC<{ row: number; field: ConnectionFormField; values: DataMart[] }> = ({
    values,
    row,
    field,
}) => {
    const name = `connections[${row}].${field}`;
    const { validation, props: validationProps = {} } = useValidations(field);

    const props = {
        name,
        placeholder: getConnectionFieldName(field),
        validate: validation,
        ...validationProps,
    };

    switch (field) {
        case "name":
        case "martCode": {
            return <FormField {...props} component={InputFieldFF} />;
        }
        case "dataEndpoint": {
            const { martCode = "", environment = "UAT" } = values[row] ?? {};
            const domain = getDomain(environment);
            const url = `${domain}/${martCode}`;

            return <FormField {...props} component={InputFieldFF} initialValue={url} />;
        }
        case "environment": {
            return (
                <FormField
                    {...props}
                    options={[
                        { label: i18n.t("Production"), value: "PROD" },
                        { label: i18n.t("UAT"), value: "UAT" },
                    ]}
                    component={SingleSelectFieldFF}
                />
            );
        }
        default:
            return null;
    }
};

export type ConnectionFormField = keyof DataMart;

export const fields: ConnectionFormField[] = ["name", "environment", "martCode", "dataEndpoint"];

export const requiredFields: ConnectionFormField[] = ["name", "environment", "martCode", "dataEndpoint"];

export const getConnectionName = (field: ConnectionFormField) => {
    switch (field) {
        case "name":
            return i18n.t("Name");
        case "martCode":
            return i18n.t("Mart Code");
        case "environment":
            return i18n.t("Type");
        case "dataEndpoint":
            return i18n.t("OData API URL");
    }
};

export const getConnectionFieldName = (field: ConnectionFormField) => {
    const name = getConnectionName(field);
    const required = requiredFields.includes(field) ? "(*)" : undefined;
    return _.compact([name, required]).join(" ");
};

const getDomain = (environment: DataMartEnvironment) => {
    switch (environment) {
        case "PROD":
            return "https://extranet.who.int/xmart-api/odata";
        case "UAT":
            return "https://portal-uat.who.int/xmart-api/odata";
        default:
            return "";
    }
};
