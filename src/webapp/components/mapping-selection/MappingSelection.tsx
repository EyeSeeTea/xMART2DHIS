import {
    ConfirmationDialog,
    ObjectsTable,
    ObjectsTableDetailField,
    ReferenceObject,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
} from "@eyeseetea/d2-ui-components";
import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import { Button, Icon } from "@material-ui/core";
import styled from "styled-components";
import i18n from "../../../locales";
import {
    MappingTemplate,
    ModelMapping,
    modelMappingComplexId,
} from "../../../domain/entities/mapping-template/MappingTemplate";
import ModelMappingDialog from "../model-mapping-dialog/ModelMappingDialog";
import MappingTemplateDialog from "../mapping-template-dialog/MappingTemplateDialog";
import _ from "lodash";

const StyledButton = styled(Button)`
    margin-left: 8px;
`;

export interface ModelMappingRow extends ModelMapping {
    id: string;
}

export interface MappingSelectionProps {
    enableImportTemplate?: boolean;
    connectionId: string;
    modelMappings: ModelMapping[];
    onChange: (modelMappings: ModelMapping[]) => void;
}

export default function MappingSelection({
    enableImportTemplate = false,
    connectionId,
    modelMappings,
    onChange,
}: MappingSelectionProps) {
    const [editModelMapping, setEditModelMapping] = useState<ModelMapping | undefined>(undefined);
    const [newModelMapping, setNewModelMapping] = useState<ModelMapping | undefined>(undefined);
    const [rows, setRows] = useState<ModelMappingRow[]>([]);
    const [toDelete, setToDelete] = useState<string[]>([]);
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const [openMappingTemplateDialog, setOpenMappingTemplateDialog] = useState(false);

    useEffect(() => {
        setRows(modelMappings.map(m => ({ ...m, id: modelMappingComplexId(m) })));
    }, [modelMappings]);

    const columns: TableColumn<ModelMappingRow>[] = useMemo(
        () => [
            { name: "dhis2Model", text: i18n.t("Dhis2 Model") },
            { name: "metadataType", text: i18n.t("Metadata Type") },
            { name: "metadataId", text: i18n.t("Metadata Id") },
            {
                name: "valuesAsColumns",
                text: i18n.t("Values as Columns"),
                getValue: (row: ModelMappingRow) => (row.valuesAsColumns ? <Icon>check</Icon> : null),
            },
            { name: "xMARTTable", text: i18n.t("xMART Table") },
        ],
        []
    );

    const details: ObjectsTableDetailField<ModelMappingRow>[] = useMemo(
        () => [
            { name: "dhis2Model", text: i18n.t("Dhis2 Model") },
            { name: "metadataType", text: i18n.t("Metadata Type") },
            { name: "metadataId", text: i18n.t("Metadata Id") },
            {
                name: "valuesAsColumns",
                text: i18n.t("Values as Columns"),
                getValue: (row: ModelMappingRow) => (row.valuesAsColumns ? <Icon>check</Icon> : null),
            },
            { name: "xMARTTable", text: i18n.t("xMART Table") },
        ],
        []
    );

    const addModelMapping = useCallback(() => {
        const modelMapping: ModelMapping = { dhis2Model: "dataValues", xMARTTable: "" };
        setNewModelMapping(modelMapping);
    }, []);

    const handleImportTemplate = useCallback(() => {
        setOpenMappingTemplateDialog(true);
    }, []);

    const handleModelMappingDialogSave = useCallback(
        (modelMapping: ModelMapping) => {
            const editedModelMappings = editModelMapping
                ? modelMappings.map(item =>
                      modelMappingComplexId(item) === modelMappingComplexId(editModelMapping) ? modelMapping : item
                  )
                : [...modelMappings, modelMapping];

            onChange(editedModelMappings);
            setNewModelMapping(undefined);
            setEditModelMapping(undefined);
        },
        [modelMappings, onChange, editModelMapping]
    );

    const handleModelMappingDialogCancel = useCallback(() => {
        setNewModelMapping(undefined);
        setEditModelMapping(undefined);
    }, []);

    const handleMappingTemplateDialogSave = useCallback(
        (mappingTemplate: MappingTemplate) => {
            const modelMappingsToOverwrite = mappingTemplate.modelMappings.filter(templateMappings =>
                modelMappings.some(
                    actionMappings => modelMappingComplexId(templateMappings) === modelMappingComplexId(actionMappings)
                )
            );
            const newModelMappings = mappingTemplate.modelMappings.filter(
                templateMappings =>
                    !modelMappings.some(
                        actionMappings =>
                            modelMappingComplexId(templateMappings) === modelMappingComplexId(actionMappings)
                    )
            );
            const modelMappingsToMaintain = modelMappings.filter(
                actionMappings =>
                    !mappingTemplate.modelMappings.some(
                        templateMappings =>
                            modelMappingComplexId(templateMappings) === modelMappingComplexId(actionMappings)
                    )
            );

            onChange([...modelMappingsToOverwrite, ...newModelMappings, ...modelMappingsToMaintain]);

            setOpenMappingTemplateDialog(false);
        },
        [modelMappings, onChange]
    );

    const handleMappingTemplateDialogCancel = useCallback(() => {
        setOpenMappingTemplateDialog(false);
    }, []);

    const confirmDelete = useCallback(async () => {
        onChange(modelMappings.filter(item => !toDelete.includes(modelMappingComplexId(item))));
        updateSelection([]);
        setToDelete([]);
    }, [onChange, modelMappings, toDelete]);

    const handleEdit = useCallback(
        async (ids: []) => {
            const id = _.first(ids);
            if (!id) return;

            setEditModelMapping(modelMappings.find(item => modelMappingComplexId(item) === id));
        },
        [modelMappings]
    );

    const actions: TableAction<ModelMappingRow>[] = useMemo(
        () => [
            {
                name: "details",
                text: i18n.t("Details"),
                multiple: false,
                type: "details",
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                multiple: true,
                onClick: setToDelete,
                icon: <Icon>delete</Icon>,
            },
            {
                name: "edit",
                text: i18n.t("Edit"),
                multiple: false,
                primary: true,
                onClick: handleEdit,
                icon: <Icon>edit</Icon>,
            },
        ],
        [handleEdit]
    );

    const handleTableChange = useCallback((tableState: TableState<ReferenceObject>) => {
        const { selection } = tableState;
        updateSelection(selection);
    }, []);

    const currentModelMapping = useMemo(() => newModelMapping ?? editModelMapping, [newModelMapping, editModelMapping]);

    return (
        <React.Fragment>
            {currentModelMapping && (
                <ModelMappingDialog
                    connectionId={connectionId}
                    modelMapping={currentModelMapping}
                    onSave={handleModelMappingDialogSave}
                    onCancel={handleModelMappingDialogCancel}
                ></ModelMappingDialog>
            )}

            {openMappingTemplateDialog && (
                <MappingTemplateDialog
                    connectionId={connectionId}
                    onSave={handleMappingTemplateDialogSave}
                    onCancel={handleMappingTemplateDialogCancel}
                ></MappingTemplateDialog>
            )}

            {toDelete.length > 0 && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={confirmDelete}
                    onCancel={() => setToDelete([])}
                    title={i18n.t("Delete Actions?")}
                    description={
                        toDelete
                            ? i18n.t("Are you sure you want to delete {{total}} model mappings?", {
                                  total: toDelete.length,
                              })
                            : ""
                    }
                    saveText={i18n.t("Ok")}
                />
            )}

            <StyledButton color="primary" variant="contained" startIcon={<Icon>add</Icon>} onClick={addModelMapping}>
                {i18n.t("Add")}
            </StyledButton>

            {enableImportTemplate && (
                <StyledButton
                    color="primary"
                    variant="contained"
                    startIcon={<Icon>arrow_downward</Icon>}
                    onClick={handleImportTemplate}
                >
                    {i18n.t("Import Template")}
                </StyledButton>
            )}

            <ObjectsTable<ModelMappingRow>
                rows={rows}
                columns={columns}
                details={details}
                actions={actions}
                selection={selection}
                onChange={handleTableChange}
            />
        </React.Fragment>
    );
}
