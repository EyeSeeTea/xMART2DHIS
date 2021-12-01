import { makeStyles, TextField } from "@material-ui/core";
import React, { useCallback, useState } from "react";
import { SyncAction } from "../../../../domain/entities/SyncAction";
import i18n from "../../../../locales";
import { Dictionary } from "../../../../types/utils";
import { SyncWizardStepProps } from "../SyncWizard";

export const GeneralInfoStep = ({ action, onChange }: SyncWizardStepProps) => {
    const classes = useStyles();

    const [errors, setErrors] = useState<Dictionary<string>>({});

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

    // const onChangeInstance = useCallback(
    //     (_type: InstanceSelectionOption, instance?: Instance | Store) => {
    //         const originInstance = instance?.id ?? "LOCAL";
    //         const targetInstances = originInstance === "LOCAL" ? [] : ["LOCAL"];

    //         onChange(
    //             syncRule
    //                 .updateBuilder({ originInstance })
    //                 .updateTargetInstances(targetInstances)
    //                 .updateMetadataIds([])
    //                 .updateExcludedIds([])
    //         );
    //     },
    //     [syncRule, onChange]
    // );

    return (
        <React.Fragment>
            <TextField
                className={classes.row}
                fullWidth={true}
                label={i18n.t("Name (*)")}
                value={action.name ?? ""}
                onChange={onChangeField("name")}
                error={!!errors["name"]}
                helperText={errors["name"]}
            />

            {/* <div className={classes.row}>
                <InstanceSelectionDropdown
                    showInstances={{ local: true, remote: true }}
                    selectedInstance={syncRule.originInstance}
                    onChangeSelected={onChangeInstance}
                    view="full-width"
                    title={i18n.t("Source instance")}
                />
            </div> */}

            <TextField
                className={classes.row}
                fullWidth={true}
                multiline={true}
                rows={4}
                label={i18n.t("Description")}
                value={action.description ?? ""}
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
