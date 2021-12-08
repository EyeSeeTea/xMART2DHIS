import {
    composeValidators,
    createMaxCharacterLength,
    createMinCharacterLength,
    hasValue,
    InputFieldFF,
    SingleSelectFieldFF,
} from "@dhis2/ui";
import React from "react";
import { FormField } from "../../components/form/FormField";
import { DataMartEndpoint } from "../../../domain/entities/XMart";

import { getConnectionFieldName, ConnectionFormField, connectionRequiredFields } from "./utils";

const useValidations = (field: ConnectionFormField): { validation?: (...args: any[]) => any; props?: object } => {
    switch (field) {
        case "name":
        case "code":
        case "apiUrl":
        case "type":
            return {
                validation: composeValidators(hasValue, createMinCharacterLength(1), createMaxCharacterLength(255)),
            };
        default: {
            const required = connectionRequiredFields.includes(field);
            return { validation: required ? hasValue : undefined };
        }
    }
};
interface TypeOption {
    label: string;
    value: DataMartEndpoint;
}
export const RenderConnectionField: React.FC<{ row: number; field: ConnectionFormField }> = ({ row, field }) => {
    const name = `connections[${row}].${field}`;
    const { validation, props: validationProps = {} } = useValidations(field);
    const props = {
        name,
        placeholder: getConnectionFieldName(field),
        validate: validation,
        ...validationProps,
    };

    const typeOptions: TypeOption[] = [
        { label: "Public", value: "PUBLIC" },
        { label: "Prod", value: "PROD" },
        { label: "UAT", value: "UAT" },
    ];
    switch (field) {
        case "name":
        case "code":
        case "apiUrl":
            return <FormField {...props} component={InputFieldFF} />;
        case "type":
            return <FormField {...props} options={typeOptions} component={SingleSelectFieldFF} />;
        default:
            return null;
    }
};
