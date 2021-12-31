import { useCallback } from "react";

import { ActionWizardStepProps } from "../ActionWizard";
import { ModelMapping } from "../../../../domain/entities/mapping-template/MappingTemplate";
import MappingSelection from "../../mapping-selection/MappingSelection";

export default function MappingSelectionStep({ action, onChange }: ActionWizardStepProps) {
    const handleModelMappingsChange = useCallback(
        (modelMappings: ModelMapping[]) => {
            onChange(action.update({ modelMappings }));
        },
        [action, onChange]
    );

    return (
        <MappingSelection
            enableImportTemplate={true}
            connectionId={action.connectionId}
            modelMappings={action.modelMappings}
            onChange={handleModelMappingsChange}
        />
    );
}
