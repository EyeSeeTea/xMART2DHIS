import { useCallback } from "react";

import { MappingTemplateWizardStepProps } from "../MappingTemplateWizard";
import { ModelMapping } from "../../../../domain/entities/mapping-template/MappingTemplate";
import MappingSelection from "../../mapping-selection/MappingSelection";

export default function MappingSelectionStep({ mappingTemplate, onChange }: MappingTemplateWizardStepProps) {
    const handleModelMappingsChange = useCallback(
        (modelMappings: ModelMapping[]) => {
            onChange(mappingTemplate.update({ modelMappings }));
        },
        [mappingTemplate, onChange]
    );

    return (
        <MappingSelection
            connectionId={mappingTemplate.connectionId}
            modelMappings={mappingTemplate.modelMappings}
            onChange={handleModelMappingsChange}
        />
    );
}
