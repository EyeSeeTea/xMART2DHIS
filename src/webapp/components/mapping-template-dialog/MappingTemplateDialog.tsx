import { DialogContent } from "@material-ui/core";
import { ConfirmationDialog, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import i18n from "../../../locales";
import { Dropdown } from "../dropdown/Dropdown";
import { MappingTemplate } from "../../../domain/entities/mapping-template/MappingTemplate";
import { useAppContext } from "../../contexts/app-context";

export interface ModelMappingDialogProps {
    connectionId: string;
    onSave?: (mappingTemplate: MappingTemplate) => void;
    onCancel?: () => void;
}

const MappingTemplateDialog: React.FC<ModelMappingDialogProps> = ({ connectionId, onSave, onCancel }) => {
    const [mappingTemplateId, setMappingTemplateId] = useState("");
    const [mappingTemplates, setMappingTemplates] = useState<MappingTemplate[]>([]);

    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    useEffect(() => {
        compositionRoot.mappingTemplates.list(connectionId).run(
            mappingTemplates => {
                setMappingTemplates(mappingTemplates);
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar, connectionId]);

    const handleMappingTemplateChange = useCallback((id: string) => {
        setMappingTemplateId(id);
    }, []);

    const handleSave = useCallback(() => {
        const mappingTemplate = mappingTemplates?.find(template => template.id === mappingTemplateId);
        if (onSave && mappingTemplate) {
            onSave(mappingTemplate);
        }
    }, [onSave, mappingTemplateId, mappingTemplates]);

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Select mapping template")}
            onSave={handleSave}
            onCancel={onCancel}
            saveText={i18n.t("Save")}
            maxWidth={"md"}
            disableSave={mappingTemplateId === ""}
        >
            <DialogContent>
                <Dropdown
                    label={i18n.t("Mapping template")}
                    items={mappingTemplates}
                    value={mappingTemplateId}
                    onValueChange={handleMappingTemplateChange}
                    hideEmpty={true}
                />
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default MappingTemplateDialog;
