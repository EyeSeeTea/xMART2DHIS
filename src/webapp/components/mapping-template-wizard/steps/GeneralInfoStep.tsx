import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { makeStyles, TextField } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import { SyncAction } from "../../../../domain/entities/actions/SyncAction";
import { DataMart } from "../../../../domain/entities/xmart/DataMart";
import i18n from "../../../../locales";
import { Dictionary } from "../../../../types/utils";
import { useAppContext } from "../../../contexts/app-context";
import Dropdown from "../../dropdown/Dropdown";
import { MappingTemplateWizardStepProps } from "../MappingTemplateWizard";

export const GeneralInfoStep = ({ mappingTemplate, onChange }: MappingTemplateWizardStepProps) => {
    const classes = useStyles();

    const [connections, setConnections] = useState<DataMart[]>([]);
    const [errors, setErrors] = useState<Dictionary<string>>({});
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const onChangeField = useCallback(
        (field: keyof SyncAction) => {
            return (event: React.ChangeEvent<{ value: unknown }>) => {
                const newAction = mappingTemplate.update({ [field]: event.target.value });
                const messages = newAction.validate([field]).map(e => e.description);

                setErrors(errors => ({ ...errors, [field]: messages.join("\n") }));
                onChange(newAction);
            };
        },
        [mappingTemplate, onChange]
    );

    useEffect(() => {
        compositionRoot.connection.listAll().run(
            dataMarts => setConnections(dataMarts),
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar]);

    const onChangeConnection = useCallback(
        (connectionId?: string) => {
            onChange(mappingTemplate.update({ connectionId }));
        },
        [mappingTemplate, onChange]
    );

    return (
        <React.Fragment>
            <TextField
                className={classes.row}
                fullWidth={true}
                label={i18n.t("Name (*)")}
                value={mappingTemplate.name ?? ""}
                onChange={onChangeField("name")}
                error={!!errors["name"]}
                helperText={errors["name"]}
            />

            <div className={classes.row}>
                <Dropdown
                    items={connections}
                    value={mappingTemplate.connectionId ?? connections[0]?.id ?? ""}
                    onValueChange={onChangeConnection}
                    label={i18n.t("Connection")}
                    hideEmpty={true}
                    view={"full-width"}
                />
            </div>

            <TextField
                className={classes.row}
                fullWidth={true}
                multiline={true}
                rows={4}
                label={i18n.t("Description")}
                value={mappingTemplate.description ?? ""}
                onChange={onChangeField("description")}
                error={!!errors["description"]}
                helperText={errors["description"]}
            />
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    row: {
        marginBottom: 25,
    },
});

export default GeneralInfoStep;
