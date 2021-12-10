import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { TextField } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { SyncAction } from "../../../../domain/entities/actions/SyncAction";
import { DataMart } from "../../../../domain/entities/xmart/DataMart";
import i18n from "../../../../locales";
import { Dictionary } from "../../../../types/utils";
import { useAppContext } from "../../../contexts/app-context";
import Dropdown from "../../dropdown/Dropdown";
import { ActionWizardStepProps } from "../ActionWizard";

export const GeneralInfoStep = ({ action, onChange }: ActionWizardStepProps) => {
    const [connections, setConnections] = useState<DataMart[]>([]);
    const [errors, setErrors] = useState<Dictionary<string>>({});
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const onChangeField = useCallback(
        (field: keyof SyncAction) => {
            return (event: React.ChangeEvent<{ value: unknown }>) => {
                const newAction = action.update({ [field]: event.target.value });
                const messages = newAction.validate(["name"]).map(e => e.description);
                setErrors(errors => ({ ...errors, [field]: messages.join("\n") }));
                onChange(newAction);
            };
        },
        [action, onChange]
    );

    useEffect(() => {
        compositionRoot.xmart.listDataMarts().run(
            dataMarts => setConnections(dataMarts),
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar]);

    const onChangeConnection = useCallback(
        (connectionId?: string) => {
            onChange(action.update({ connectionId }));
        },
        [action, onChange]
    );

    return (
        <React.Fragment>
            <Row>
                <TextField
                    fullWidth={true}
                    label={i18n.t("Name (*)")}
                    value={action.name ?? ""}
                    onChange={onChangeField("name")}
                    error={!!errors["name"]}
                    helperText={errors["name"]}
                />
            </Row>

            <Row>
                <Dropdown
                    items={connections}
                    value={action.connectionId ?? connections[0]?.id ?? ""}
                    onValueChange={onChangeConnection}
                    label={i18n.t("Connection")}
                    hideEmpty={true}
                    view={"full-width"}
                />
            </Row>

            <Row>
                <TextField
                    fullWidth={true}
                    multiline={true}
                    rows={4}
                    label={i18n.t("Description")}
                    value={action.description ?? ""}
                    onChange={onChangeField("description")}
                    error={!!errors["description"]}
                    helperText={errors["description"]}
                />
            </Row>
        </React.Fragment>
    );
};

const Row = styled.div`
    margin-bottom: 25px;
`;
