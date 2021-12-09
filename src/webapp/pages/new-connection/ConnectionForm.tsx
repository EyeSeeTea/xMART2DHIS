import {
    composeValidators,
    createMaxCharacterLength,
    createMinCharacterLength,
    hasValue,
    InputFieldFF,
    SingleSelectFieldFF
} from "@dhis2/ui";
import i18n from "@eyeseetea/d2-ui-components/locales";
import React from "react";
import { FormField } from "../../components/form/FormField";
import { ConnectionFormField, connectionRequiredFields, getConnectionFieldName } from "./utils";

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
            const required = connectionRequiredFields.includes(field);
            return { validation: required ? hasValue : undefined };
        }
    }
};

export const RenderConnectionField: React.FC<{ row: number; field: ConnectionFormField }> = ({ row, field }) => {
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
        case "martCode":
        case "dataEndpoint":
            return <FormField {...props} component={InputFieldFF} />;
        case "environment":
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
        default:
            return null;
    }
};
