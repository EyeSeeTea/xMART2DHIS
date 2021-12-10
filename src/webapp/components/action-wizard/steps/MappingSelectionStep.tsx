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

import { ActionWizardStepProps } from "../ActionWizard";
import i18n from "../../../../locales";
import { MappingTemplate, ModelMapping } from "../../../../domain/entities/mapping-template/MappingTemplate";
import React from "react";
import { Button, Icon } from "@material-ui/core";
import styled from "styled-components";
import ModelMappingDialog from "../../model-mapping-dialog/ModelMappingDialog";
import MappingTemplateDialog from "../../mapping-template-dialog/MappingTemplateDialog";

const StyledButton = styled(Button)`
    margin-left: 8px;
`;

export interface ModelMappingRow extends ModelMapping {
    id: string;
}

export default function MappingSelectionStep({ action, onChange }: ActionWizardStepProps) {
    const [currentModelMapping, setCurrentModelMapping] = useState<ModelMapping | undefined>(undefined);
    const [rows, setRows] = useState<ModelMappingRow[]>([]);
    const [toDelete, setToDelete] = useState<string[]>([]);
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const [openMappingTemplateDialog, setOpenMappingTemplateDialog] = useState(false);

    useEffect(() => {
        setRows(action.modelMappings.map(m => ({ ...m, id: m.dhis2Model })));
    }, [action]);

    const columns: TableColumn<ModelMappingRow>[] = useMemo(
        () => [
            { name: "dhis2Model", text: i18n.t("Dhis2 Model") },
            { name: "xMARTTable", text: i18n.t("xMART Table") },
        ],
        []
    );

    const details: ObjectsTableDetailField<ModelMappingRow>[] = useMemo(
        () => [
            { name: "dhis2Model", text: i18n.t("Dhis2 Model") },
            { name: "xMARTTable", text: i18n.t("xMART Table") },
        ],
        []
    );

    const changeModelMapping = useCallback(() => {
        const modelMapping: ModelMapping = { dhis2Model: "dataValues", xMARTTable: "" };
        setCurrentModelMapping(modelMapping);
    }, []);

    const handleImportTemplate = useCallback(() => {
        setOpenMappingTemplateDialog(true);
    }, []);

    const handleModelMappingDialogSave = useCallback(
        (modelMapping: ModelMapping) => {
            const existedModelMapping = action.modelMappings.find(item => item.dhis2Model === modelMapping.dhis2Model);

            const editedModelMappings = existedModelMapping
                ? action.modelMappings.map(item => (item.dhis2Model === modelMapping.dhis2Model ? modelMapping : item))
                : [...action.modelMappings, modelMapping];

            onChange(action.update({ modelMappings: editedModelMappings }));

            setCurrentModelMapping(undefined);
        },
        [action, onChange]
    );

    const handleModelMappingDialogCancel = useCallback(() => {
        setCurrentModelMapping(undefined);
    }, []);

    const handleMappingTemplateDialogSave = useCallback(
        (mappingTemplate: MappingTemplate) => {
            const modelMappingsToOverwrite = mappingTemplate.modelMappings.filter(templateMappings =>
                action.modelMappings.some(actionMappings => actionMappings.dhis2Model === templateMappings.dhis2Model)
            );
            const newModelMappings = mappingTemplate.modelMappings.filter(
                templateMappings =>
                    !action.modelMappings.some(
                        actionMappings => actionMappings.dhis2Model === templateMappings.dhis2Model
                    )
            );
            const modelMappingsToMaintain = action.modelMappings.filter(
                actionMappings =>
                    !mappingTemplate.modelMappings.some(
                        templateMappings => templateMappings.dhis2Model === actionMappings.dhis2Model
                    )
            );

            onChange(
                action.update({
                    modelMappings: [...modelMappingsToOverwrite, ...newModelMappings, ...modelMappingsToMaintain],
                })
            );

            setOpenMappingTemplateDialog(false);
        },
        [action, onChange]
    );

    const handleMappingTemplateDialogCancel = useCallback(() => {
        setOpenMappingTemplateDialog(false);
    }, []);

    const confirmDelete = useCallback(async () => {
        onChange(
            action.update({ modelMappings: action.modelMappings.filter(item => !toDelete.includes(item.dhis2Model)) })
        );
        updateSelection([]);
        setToDelete([]);
    }, [onChange, action, toDelete]);

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
        ],
        []
    );

    const handleTableChange = useCallback((tableState: TableState<ReferenceObject>) => {
        const { selection } = tableState;
        updateSelection(selection);
    }, []);

    return (
        <React.Fragment>
            {currentModelMapping && (
                <ModelMappingDialog
                    connectionId={action.connectionId}
                    modelMapping={currentModelMapping}
                    onSave={handleModelMappingDialogSave}
                    onCancel={handleModelMappingDialogCancel}
                ></ModelMappingDialog>
            )}

            {openMappingTemplateDialog && (
                <MappingTemplateDialog
                    connectionId={action.connectionId}
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

            <StyledButton
                color="primary"
                variant="contained"
                startIcon={<Icon>edit</Icon>}
                onClick={changeModelMapping}
            >
                {i18n.t("Model Mapping")}
            </StyledButton>

            <StyledButton
                color="primary"
                variant="contained"
                startIcon={<Icon>arrow_downward</Icon>}
                onClick={handleImportTemplate}
            >
                {i18n.t("Import Template")}
            </StyledButton>

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
