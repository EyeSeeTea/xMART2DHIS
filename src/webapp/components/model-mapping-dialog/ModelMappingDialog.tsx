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
import { Dropdown } from "../dropdown/Dropdown";
import { Dhis2ModelKey, ModelMapping } from "../../../domain/entities/mapping-template/MappingTemplate";
import { DataMart, MartTable } from "../../../domain/entities/xmart/DataMart";
import { useAppContext } from "../../contexts/app-context";
import styled from "styled-components";
import { MetadataEntity } from "../../../domain/entities/metadata/Metadata";
import {
    DataSetModel,
    AllProgramsModel,
    TrackerProgramsModel,
    AllProgramStagesModel,
} from "../../../domain/entities/models/D2Models";
import { D2Model } from "../../../domain/entities/models/D2Model";
import { Toggle } from "../toggle/Toggle";
import { applyXMartCodeRules } from "../../../domain/utils";
import { ProgramStage } from "../../../domain/entities/metadata/Program";
import _ from "lodash";

const Container = styled.div`
    margin-bottom: 16px;
`;

type dhis2DataModel = { id: Dhis2ModelKey; name: string; enableValuesAsColumn: boolean };

const dhis2DataModels: dhis2DataModel[] = [
    {
        id: "dataValues",
        name: i18n.t("Data Values"),
        enableValuesAsColumn: true,
    },
    {
        id: "events",
        name: i18n.t("Events"),
        enableValuesAsColumn: false,
    },
    {
        id: "eventValues",
        name: i18n.t("Event Values"),
        enableValuesAsColumn: true,
    },
    {
        id: "teis",
        name: i18n.t("Tracked Entity Instances"),
        enableValuesAsColumn: false,
    },
    {
        id: "teiAttributes",
        name: i18n.t("TEI Attributes"),
        enableValuesAsColumn: true,
    },
    {
        id: "enrollments",
        name: i18n.t("Enrollments"),
        enableValuesAsColumn: false,
    },
];

const metadataModelByData: Record<Dhis2ModelKey, typeof D2Model> = {
    dataValues: DataSetModel,
    events: AllProgramsModel,
    eventValues: AllProgramStagesModel,
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

    const dataModels = useMemo(() => dhis2DataModels.map(m => ({ id: m.id, name: m.name })), []);
    const selectedDataModel = useMemo(
        () => dhis2DataModels.find(m => m.id === modelMappingState.dhis2Model),
        [modelMappingState.dhis2Model]
    );

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
                fields: metadataModel.getFields(),
                model: metadataModel.getCollectionName(),
                aditionalFilters: metadataModel.getApiModelFilters(),
                sorting: { field: "displayName", order: "asc" },
            })
            .run(
                response => {
                    //TODO: this transformation should be not here
                    const items = _(
                        metadataModel === AllProgramStagesModel
                            ? response.objects.map(stage => {
                                  const programStage = stage as ProgramStage;

                                  const name =
                                      programStage.program !== undefined &&
                                      programStage.name !== programStage.program.name
                                          ? `${programStage.program.name} - ${programStage.name}`
                                          : programStage.name;

                                  return { ...programStage, name };
                              })
                            : response.objects
                    )
                        .sortBy("name")
                        .value();

                    setMetadataItems(items);
                    setLoadingMetadata(false);
                },
                error => snackbar.error(error)
            );
    }, [compositionRoot, snackbar, xMARTConnection, metadataModel]);

    const handleDhis2ModelChange = useCallback(
        (dhis2Model: Dhis2ModelKey) => {
            const valuesAsColumns = selectedDataModel?.enableValuesAsColumn ? modelMappingState.valuesAsColumns : false;
            setModelMappingState({ ...modelMappingState, dhis2Model, valuesAsColumns });
        },
        [modelMappingState, selectedDataModel]
    );

    const handleXMARTTableChange = useCallback(
        (xMARTTable: string) => {
            setModelMappingState({ ...modelMappingState, xMARTTable: xMARTTable });
        },
        [modelMappingState]
    );

    const handleMetadataItemChange = useCallback(
        (metadataId?: string) => {
            const metadataType = metadataModel.getMetadataType();

            const id = metadataId !== "" ? metadataId : undefined;

            const valuesAsColumns = id ? modelMappingState.valuesAsColumns : false;

            setModelMappingState({
                ...modelMappingState,
                metadataType,
                metadataId: id,
                valuesAsColumns,
            });
        },
        [modelMappingState, metadataModel]
    );

    const onChangeValuesAsColumns = useCallback(
        (value: boolean) => {
            setModelMappingState({
                ...modelMappingState,
                valuesAsColumns: value,
            });
        },
        [modelMappingState]
    );

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
                xMARTTable: applyXMartCodeRules(event.target.value.toUpperCase()),
            });
        },
        [modelMappingState]
    );

    const handleSave = useCallback(() => {
        if (onSave) {
            onSave(modelMappingState);
        }
    }, [onSave, modelMappingState]);

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
                        items={dataModels}
                        value={modelMappingState.dhis2Model}
                        onValueChange={handleDhis2ModelChange}
                        hideEmpty={true}
                    />
                </Container>

                <Container>
                    {!loadingMetadata && (
                        <Dropdown
                            label={metadataModel.getMetadataType()}
                            items={metadataItems}
                            value={modelMappingState.metadataId ?? ""}
                            onValueChange={handleMetadataItemChange}
                            hideEmpty={false}
                        />
                    )}
                    {loadingMetadata && <CircularProgress />}
                </Container>

                <Container>
                    <Toggle
                        disabled={
                            !(selectedDataModel?.enableValuesAsColumn && modelMappingState.metadataId !== undefined)
                        }
                        label={i18n.t("Values as Columns")}
                        onValueChange={onChangeValuesAsColumns}
                        value={modelMappingState.valuesAsColumns || false}
                    />
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
