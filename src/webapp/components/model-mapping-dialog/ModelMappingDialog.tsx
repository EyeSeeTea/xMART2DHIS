import {
    DialogContent,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    CircularProgress,
} from "@material-ui/core";
import { ConfirmationDialog, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "../../../locales";
import { Dropdown, DropdownOption } from "../dropdown/Dropdown";
import { Dhis2ModelKey, ModelMapping } from "../../../domain/entities/mapping-template/MappingTemplate";
import { DataMart, MartTable } from "../../../domain/entities/xmart/DataMart";
import { useAppContext } from "../../contexts/app-context";
import styled from "styled-components";
import { MetadataEntity } from "../../../domain/entities/metadata/Metadata";
import { DataSetModel, AllProgramsModel, TrackerProgramsModel } from "../../../domain/entities/models/D2Models";
import { D2Model } from "../../../domain/entities/models/D2Model";

const Container = styled.div`
    margin-bottom: 16px;
`;

const dhis2Models: DropdownOption<Dhis2ModelKey>[] = [
    {
        id: "dataValues",
        name: i18n.t("Data Values"),
    },
    {
        id: "events",
        name: i18n.t("Events"),
    },
    {
        id: "eventValues",
        name: i18n.t("Event Values"),
    },
    {
        id: "teis",
        name: i18n.t("Tracked Entity Instances"),
    },
    {
        id: "teiAttributes",
        name: i18n.t("TEI Attributes"),
    },
    {
        id: "enrollments",
        name: i18n.t("Enrollments"),
    },
];

const metadataModelByData: Record<Dhis2ModelKey, typeof D2Model> = {
    dataValues: DataSetModel,
    events: AllProgramsModel,
    eventValues: AllProgramsModel,
    teis: TrackerProgramsModel,
    teiAttributes: TrackerProgramsModel,
    enrollments: TrackerProgramsModel,
};

export interface ModelMappingDialogProps {
    connectionId: string;
    modelMapping: ModelMapping;
    onSave?: (modelMapping: ModelMapping) => void;
    onCancel?: () => void;
}

const ModelMappingDialog: React.FC<ModelMappingDialogProps> = ({ modelMapping, connectionId, onSave, onCancel }) => {
    const [modelMappingState, setModelMappingState] = useState(modelMapping);
    const [xMARTTables, setXMARTTables] = useState<MartTable[]>();
    const [xMARTConnection, setXMartConnection] = useState<DataMart>();
    const [xMartTableMode, setXMartTableMode] = useState<"existed" | "new">("new");
    const [metadataItems, setMetadataItems] = useState<MetadataEntity[]>([]);
    const [loadingMetadata, setLoadingMetadata] = useState(false);

    const metadataModel = useMemo(
        () => metadataModelByData[modelMappingState.dhis2Model],
        [modelMappingState.dhis2Model]
    );

    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    useEffect(() => {
        if (!xMARTConnection) return;

        compositionRoot.xmart.listTables(xMARTConnection).run(
            tables => {
                setXMARTTables(tables);
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar, xMARTConnection]);

    useEffect(() => {
        if (!xMARTTables) return;

        if (modelMapping.xMARTTable) {
            const existedTable = xMARTTables.find(table => table.name === modelMapping.xMARTTable);

            setXMartTableMode(existedTable ? "existed" : "new");
        }
    }, [xMARTTables, modelMapping]);

    useEffect(() => {
        compositionRoot.connection.getById(connectionId).run(
            dataMart => setXMartConnection(dataMart),
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar, connectionId]);

    useEffect(() => {
        setMetadataItems([]);
        setLoadingMetadata(true);
        compositionRoot.metadata
            .list({
                paging: false,
                model: metadataModel.getCollectionName(),
                aditionalFilters: metadataModel.getApiModelFilters(),
                sorting: { field: "displayName", order: "asc" },
            })
            .run(
                items => {
                    setMetadataItems(items.objects);
                    setLoadingMetadata(false);
                },
                error => snackbar.error(error)
            );
    }, [compositionRoot, snackbar, xMARTConnection, metadataModel]);

    const handleDhis2ModelChange = useCallback(
        (dhis2Model: Dhis2ModelKey) => {
            setModelMappingState({ ...modelMappingState, dhis2Model });
        },
        [modelMappingState]
    );

    const handleXMARTTableChange = useCallback(
        (xMARTTable: string) => {
            setModelMappingState({ ...modelMappingState, xMARTTable: xMARTTable });
        },
        [modelMappingState]
    );

    const handleMetadataItemChange = useCallback(
        (metadataId: string) => {
            const metadataType = metadataModel.getMetadataType();
            setModelMappingState({
                ...modelMappingState,
                metadataType,
                metadataId,
            });
        },
        [modelMappingState, metadataModel]
    );

    const handleSave = useCallback(() => {
        if (onSave) {
            onSave(modelMappingState);
        }
    }, [onSave, modelMappingState]);

    const handleXmartTableModeChange = useCallback(
        (_event, value) => {
            setXMartTableMode(value === "existed" ? "existed" : "new");

            if (value === "new") {
                setModelMappingState({ ...modelMappingState, xMARTTable: "" });
            }
        },
        [modelMappingState]
    );

    const onChangeNewTable = useCallback(
        (event: React.ChangeEvent<{ value: string }>) => {
            setModelMappingState({
                ...modelMappingState,
                xMARTTable: event.target.value.toUpperCase().replaceAll(/ |-/g, "_"),
            });
        },
        [modelMappingState]
    );

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Model Mapping")}
            onSave={handleSave}
            onCancel={onCancel}
            saveText={i18n.t("Save")}
            maxWidth={"md"}
            disableSave={modelMappingState.xMARTTable === ""}
        >
            <DialogContent>
                <Container>
                    <Dropdown
                        label={i18n.t("Dhis2 Model")}
                        items={dhis2Models}
                        value={modelMappingState.dhis2Model}
                        onValueChange={handleDhis2ModelChange}
                        hideEmpty={true}
                    />
                </Container>

                <Container>
                    {!loadingMetadata && (
                        <Dropdown
                            label={i18n.t("Metadata")}
                            items={metadataItems}
                            value={modelMappingState.metadataId ?? ""}
                            onValueChange={handleMetadataItemChange}
                            hideEmpty={true}
                        />
                    )}
                    {loadingMetadata && <CircularProgress />}
                </Container>

                <Container>
                    <FormLabel component="legend">{i18n.t("xMART Table")}</FormLabel>
                    <RadioGroup
                        aria-label="xMART Table"
                        name="xMARTTable"
                        value={xMartTableMode}
                        onChange={handleXmartTableModeChange}
                    >
                        <FormControlLabel value="existed" control={<Radio />} label={i18n.t("Existed Table")} />
                        <FormControlLabel value="new" control={<Radio />} label={i18n.t("New Table")} />
                    </RadioGroup>
                </Container>

                {xMartTableMode === "existed" && (
                    <Container>
                        <Dropdown
                            items={xMARTTables?.map(item => ({ id: item.name, name: item.name })) ?? []}
                            value={modelMappingState.xMARTTable ?? ""}
                            onValueChange={handleXMARTTableChange}
                        />
                    </Container>
                )}

                {xMartTableMode === "new" && (
                    <Container>
                        <TextField fullWidth={true} value={modelMappingState.xMARTTable} onChange={onChangeNewTable} />
                    </Container>
                )}
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default ModelMappingDialog;
