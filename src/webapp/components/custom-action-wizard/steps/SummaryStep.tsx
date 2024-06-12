import { ConfirmationDialog, useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Button, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { SyncCustomAction } from "../../../../domain/entities/actions/SyncCustomAction";
import { DataMart } from "../../../../domain/entities/xmart/DataMart";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { CustomActionWizardStepProps } from "../CustomActionWizard";

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

export const SummaryStep = ({ action, onCancel }: CustomActionWizardStepProps) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const classes = useStyles();
    const loading = useLoading();

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    const openCancelDialog = () => setCancelDialogOpen(true);

    const closeCancelDialog = () => setCancelDialogOpen(false);

    const save = async () => {
        const errors = action.validate().map(e => e.description);
        if (errors.length > 0) {
            snackbar.error(errors.join("\n"));
        } else {
            loading.show(true, i18n.t("Saving action..."));
            compositionRoot.actions.save(action).run(
                () => {
                    onCancel();
                    loading.reset();
                },
                error => {
                    snackbar.error(error);
                    loading.reset();
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
        </React.Fragment>
    );
};

interface SummaryStepContentProps {
    action: SyncCustomAction;
}

const SummaryStepContent: React.FC<SummaryStepContentProps> = ({ action }) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [connection, setConnection] = useState<DataMart>();

    useEffect(() => {
        compositionRoot.connection.listAll().run(
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

            {action.description && <LiEntry label={i18n.t("Description")} value={action.description} />}

            <LiEntry label={i18n.t("Custom Code")} value={action.customCode} />
        </ul>
    );
};
