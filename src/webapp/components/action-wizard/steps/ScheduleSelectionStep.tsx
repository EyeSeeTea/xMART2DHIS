import { TextField, Switch } from "@material-ui/core";
import React, { useCallback } from "react";
import styled from "styled-components";
import { Scheduling } from "../../../../domain/entities/actions/SyncAction";
import i18n from "../../../../locales";
import { ActionWizardStepProps } from "../ActionWizard";

export const ScheduleSelectionStep = ({ action, onChange }: ActionWizardStepProps) => {
    const onChangeField = useCallback(
        (field: keyof Scheduling) => {
            return (event: React.ChangeEvent<{ value: unknown }>) => {
                const newAction = action.update({ scheduling: { ...action.scheduling, [field]: event.target.value } });
                onChange(newAction);
            };
        },
        [action, onChange]
    );

    return (
        <React.Fragment>
            <Row>
                <Switch
                    checked={action.scheduling.enabled}
                    onChange={onChangeField("enabled")}
                    name="enabled"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
            </Row>
            <Row>
                <TextField
                    fullWidth={true}
                    label={i18n.t("Scheduling Sequence")}
                    value={action.scheduling.sequence ?? ""}
                    onChange={onChangeField("sequence")}
                    type={"number"}
                />
            </Row>
            <Row>
                <TextField
                    fullWidth={true}
                    label={i18n.t("Scheduling Variable")}
                    value={action.scheduling.variable ?? ""}
                    onChange={onChangeField("variable")}
                    type={"number"}
                />
            </Row>
        </React.Fragment>
    );
};

const Row = styled.div`
    margin-bottom: 25px;
`;
