import {
    ConfirmationDialog,
    ObjectsTable,
    ObjectsTableDetailField,
    ReferenceObject,
    TableAction,
    TableColumn,
    TableSelection,
    TableState
} from "@eyeseetea/d2-ui-components";
import { Button, Icon } from "@material-ui/core";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ModelMapping } from "../../../../domain/entities/mapping-template/MappingTemplate";
import i18n from "../../../../locales";
import ModelMappingDialog from "../../model-mapping-dialog/ModelMappingDialog";
import { MappingTemplateWizardStepProps } from "../MappingTemplateWizard";

const StyledButton = styled(Button)`
    margin-left: 8px;
`;

export interface ModelMappingRow extends ModelMapping {
    id: string;
}

export function MappingSelectionStep({ mappingTemplate, onChange }: MappingTemplateWizardStepProps) {
    const [currentModelMapping, setCurrentModelMapping] = useState<ModelMapping | undefined>(undefined);
    const [rows, setRows] = useState<ModelMappingRow[]>([]);
    const [toDelete, setToDelete] = useState<string[]>([]);
    const [selection, updateSelection] = useState<TableSelection[]>([]);

    useEffect(() => {
        setRows(mappingTemplate.modelMappings.map(m => ({ ...m, id: m.dhis2Model })));
    }, [mappingTemplate]);

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

    const handleSave = useCallback(
        (modelMapping: ModelMapping) => {
            const existedModelMapping = mappingTemplate.modelMappings.find(
                item => item.dhis2Model === modelMapping.dhis2Model
            );

            const editedModelMappings = existedModelMapping
                ? mappingTemplate.modelMappings.map(item =>
                      item.dhis2Model === modelMapping.dhis2Model ? modelMapping : item
                  )
                : [...mappingTemplate.modelMappings, modelMapping];

            onChange(mappingTemplate.update({ modelMappings: editedModelMappings }));

            setCurrentModelMapping(undefined);
        },
        [mappingTemplate, onChange]
    );

    const handleCancel = useCallback(() => {
        setCurrentModelMapping(undefined);
    }, []);

    const confirmDelete = useCallback(async () => {
        onChange(
            mappingTemplate.update({
                modelMappings: mappingTemplate.modelMappings.filter(item => !toDelete.includes(item.dhis2Model)),
            })
        );
        updateSelection([]);
        setToDelete([]);
    }, [onChange, mappingTemplate, toDelete]);

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
                    connectionId={mappingTemplate.connectionId}
                    modelMapping={currentModelMapping}
                    onSave={handleSave}
                    onCancel={handleCancel}
                ></ModelMappingDialog>
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
