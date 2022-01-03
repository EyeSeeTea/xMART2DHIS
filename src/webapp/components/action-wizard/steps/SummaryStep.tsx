import { ConfirmationDialog, useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Button, makeStyles } from "@material-ui/core";
import _ from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { SyncAction } from "../../../../domain/entities/actions/SyncAction";
import { availablePeriods } from "../../../../domain/entities/metadata/DataSyncPeriod";
import { MetadataEntities, MetadataPackage } from "../../../../domain/entities/metadata/Metadata";
import { DataMart } from "../../../../domain/entities/xmart/DataMart";
import { cleanOrgUnitPaths } from "../../../../domain/utils";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { ActionWizardStepProps } from "../ActionWizard";

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

export const SummaryStep = ({ action, onCancel }: ActionWizardStepProps) => {
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
    action: SyncAction;
}

export const SummaryStepContent: React.FC<SummaryStepContentProps> = ({ action }) => {
    const { compositionRoot, api } = useAppContext();
    const snackbar = useSnackbar();

    const [connection, setConnection] = useState<DataMart>();
    const [metadata, updateMetadata] = useState<MetadataPackage>({});

    useEffect(() => {
        compositionRoot.connection.listAll().run(
            dataMarts => {
                const connection = dataMarts.find(d => d.id === action.connectionId);
                setConnection(connection);
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar, action]);

    useEffect(() => {
        const ids = [...action.metadataIds, ...cleanOrgUnitPaths(action.orgUnitPaths)];

        compositionRoot.metadata
            .getByIds(ids, "id,name,type")
            .run(updateMetadata, () => snackbar.error("An error has ocurred loading metadata"));
    }, [compositionRoot, action, snackbar]);

    return (
        <ul>
            <LiEntry label={i18n.t("Name")} value={action.name} />

            <LiEntry label={i18n.t("Connection")} value={connection?.name} />

            <LiEntry label={i18n.t("Description")} value={action.description} />

            {_.keys(metadata).map(metadataType => {
                const itemsByType = metadata[metadataType as keyof MetadataEntities] || [];

                return (
                    itemsByType.length > 0 && (
                        <LiEntry
                            key={metadataType}
                            //@ts-ignore
                            label={`${api.models[metadataType].schema.displayName} [${itemsByType.length}]`}
                        >
                            <ul>
                                {itemsByType.map(({ id, name }) => (
                                    <LiEntry key={id} label={`${name} (${id})`} />
                                ))}
                            </ul>
                        </LiEntry>
                    )
                );
            })}

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

            <LiEntry label={i18n.t("Scheduling")}>
                    <ul>
                        <LiEntry label={i18n.t("Sequence")} value={action.scheduling.sequence.toString()} />
                    </ul>
                    <ul>
                        <LiEntry label={i18n.t("Variable")} value={action.scheduling.variable.toString()} />
                    </ul>
            </LiEntry>

            <LiEntry label={i18n.t("Model mappings")}>
                <ul>
                    {action.modelMappings.map(modelMapping => (
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
