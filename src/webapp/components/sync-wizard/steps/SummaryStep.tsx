import { ConfirmationDialog, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Button, LinearProgress, makeStyles } from "@material-ui/core";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { availablePeriods } from "../../../../domain/entities/DataSyncPeriod";
import { SyncAction } from "../../../../domain/entities/SyncAction";
import { DataMart } from "../../../../domain/entities/XMart";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { SyncWizardStepProps } from "../SyncWizard";

const LiEntry: React.FC<{ label: string; value?: string }> = ({ label, value, children }) => {
    return (
        <li key={label}>
            {label}
            {value || children ? ": " : ""}
            {value}
            {children}
        </li>
    );
};

const useStyles = makeStyles({
    saveButton: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
    },
});

export const SummaryStep = ({ action, onCancel }: SyncWizardStepProps) => {
    const { compositionRoot } = useAppContext();

    const snackbar = useSnackbar();
    const classes = useStyles();
    const history = useHistory();

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const openCancelDialog = () => setCancelDialogOpen(true);

    const closeCancelDialog = () => setCancelDialogOpen(false);

    const save = async () => {
        setIsSaving(true);

        const errors = action.validate().map(e => e.description);
        if (errors.length > 0) {
            snackbar.error(errors.join("\n"));
        } else {
            compositionRoot.actions.save(action).run(
                () => {
                    history.push(`/actions/edit/${action.id}`);
                    onCancel();
                    setIsSaving(false);
                },
                () => {
                    snackbar.error("An error has occurred saving the action");
                    setIsSaving(false);
                }
            );
        }
    };

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={cancelDialogOpen}
                onSave={onCancel}
                onCancel={closeCancelDialog}
                title={i18n.t("Cancel action wizard")}
                description={i18n.t(
                    "You are about to exit the Action Creation Wizard. All your changes will be lost. Are you sure you want to proceed?"
                )}
                saveText={i18n.t("Yes")}
            />

            <SummaryStepContent action={action} />

            <div className={classes.buttonContainer}>
                <div>
                    <Button onClick={openCancelDialog} variant="contained">
                        {i18n.t("Cancel")}
                    </Button>

                    <Button className={classes.saveButton} onClick={save} variant="contained">
                        {i18n.t("Save")}
                    </Button>
                </div>
            </div>

            {isSaving && <LinearProgress />}
        </React.Fragment>
    );
};

interface SummaryStepContentProps {
    action: SyncAction;
}

export const SummaryStepContent = (props: SummaryStepContentProps) => {
    const { action } = props;
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [connection, setConnection] = useState<DataMart>();

    useEffect(() => {
        compositionRoot.xmart.listDataMarts().run(
            dataMarts => {
                const connection = dataMarts.find(d => d.id === action.connectionId);
                setConnection(connection);
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar, action]);

    return (
        <ul>
            <LiEntry label={i18n.t("Name")} value={action.name} />

            <LiEntry label={i18n.t("Connection")} value={connection?.name} />

            <LiEntry label={i18n.t("Description")} value={action.description} />

            <LiEntry label={i18n.t("Period")} value={availablePeriods[action.period]?.name}>
                {action.period === "FIXED" && (
                    <ul>
                        <LiEntry label={i18n.t("Start date")} value={moment(action.startDate).format("YYYY-MM-DD")} />
                    </ul>
                )}
                {action.period === "FIXED" && (
                    <ul>
                        <LiEntry label={i18n.t("End date")} value={moment(action.endDate).format("YYYY-MM-DD")} />
                    </ul>
                )}
            </LiEntry>
        </ul>
    );
};
