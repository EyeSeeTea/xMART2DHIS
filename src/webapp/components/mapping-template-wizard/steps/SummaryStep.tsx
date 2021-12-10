import { ConfirmationDialog, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Button, LinearProgress, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataMart } from "../../../../domain/entities/xmart/DataMart";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { MappingTemplateWizardStepProps } from "../MappingTemplateWizard";
import { MappingTemplate } from "../../../../domain/entities/mapping-template/MappingTemplate";

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

export const SummaryStep = ({ mappingTemplate, onCancel }: MappingTemplateWizardStepProps) => {
    const { compositionRoot } = useAppContext();

    const snackbar = useSnackbar();
    const classes = useStyles();
    const navigate = useNavigate();

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const openCancelDialog = () => setCancelDialogOpen(true);

    const closeCancelDialog = () => setCancelDialogOpen(false);

    const save = async () => {
        setIsSaving(true);

        const errors = mappingTemplate.validate().map(e => e.description);
        if (errors.length > 0) {
            snackbar.error(errors.join("\n"));
        } else {
            compositionRoot.mappingTemplates.save(mappingTemplate).run(
                () => {
                    navigate(`/mapping-templates/edit/${mappingTemplate.id}`);
                    onCancel();
                    setIsSaving(false);
                },
                error => {
                    snackbar.error(error);
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
                title={i18n.t("Cancel mapping template wizard")}
                description={i18n.t(
                    "You are about to exit the Mapping template Creation Wizard. All your changes will be lost. Are you sure you want to proceed?"
                )}
                saveText={i18n.t("Yes")}
            />

            <SummaryStepContent mappingTemplate={mappingTemplate} />

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
    mappingTemplate: MappingTemplate;
}

export const SummaryStepContent = (props: SummaryStepContentProps) => {
    const { mappingTemplate } = props;
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [connection, setConnection] = useState<DataMart>();

    useEffect(() => {
        compositionRoot.connection.listAll().run(
            dataMarts => {
                const connection = dataMarts.find(d => d.id === mappingTemplate.connectionId);
                setConnection(connection);
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar, mappingTemplate]);

    return (
        <ul>
            <LiEntry label={i18n.t("Name")} value={mappingTemplate.name} />

            <LiEntry label={i18n.t("Connection")} value={connection?.name} />

            <LiEntry label={i18n.t("Description")} value={mappingTemplate.description} />

            <LiEntry
                //@ts-ignore
                label={i18n.t("Model mappings")}
            >
                <ul>
                    {mappingTemplate.modelMappings.map(modelMapping => (
                        <LiEntry
                            key={modelMapping.dhis2Model}
                            label={`${modelMapping.dhis2Model} -> ${modelMapping.xMARTTable}`}
                        />
                    ))}
                </ul>
            </LiEntry>
        </ul>
    );
};
