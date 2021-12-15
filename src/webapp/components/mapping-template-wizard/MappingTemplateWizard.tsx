import { Wizard, WizardStep } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React from "react";
import { useLocation } from "react-router-dom";
import { SyncAction } from "../../../domain/entities/actions/SyncAction";
import { MappingTemplate } from "../../../domain/entities/mapping-template/MappingTemplate";
import i18n from "../../../locales";
import { GeneralInfoStep } from "./steps/GeneralInfoStep";
import { MappingSelectionStep } from "./steps/MappingSelectionStep";
import { SummaryStep } from "./steps/SummaryStep";

interface MappingTemplateWizardProps {
    mappingTemplate: MappingTemplate;
    onChange?(mappingTemplate: MappingTemplate): void;
    onCancel?(): void;
}

export const stepsBaseInfo: MappingTemplateWizardStep[] = [
    {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        validationKeys: ["name", "connectionId"],
    },
    {
        key: "mapping",
        label: i18n.t("Mapping"),
        component: MappingSelectionStep,
        validationKeys: ["modelMappings"],
    },
    {
        key: "summary",
        label: i18n.t("Summary"),
        component: SummaryStep,
        validationKeys: [],
    },
];

export interface MappingTemplateWizardStep extends WizardStep {
    validationKeys: string[];
    hidden?: (action: SyncAction) => boolean;
}

export interface MappingTemplateWizardStepProps {
    mappingTemplate: MappingTemplate;
    onChange: (mappingTemplate: MappingTemplate) => void;
    onCancel: () => void;
}

const MappingTemplateWizard: React.FC<MappingTemplateWizardProps> = ({ mappingTemplate, onCancel, onChange }) => {
    const location = useLocation();
    const steps = stepsBaseInfo.map(step => ({ ...step, props: { mappingTemplate, onCancel, onChange } }));

    const onStepChangeRequest = async (_currentStep: WizardStep, newStep: WizardStep) => {
        const index = _(steps).findIndex(step => step.key === newStep.key);
        const validationMessages = _.take(steps, index).map(({ validationKeys }) =>
            mappingTemplate.validate(validationKeys).map(({ description }) => description)
        );

        return _.flatten(validationMessages);
    };

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    return (
        <Wizard
            useSnackFeedback={true}
            onStepChangeRequest={onStepChangeRequest}
            initialStepKey={initialStepKey}
            lastClickableStepIndex={steps.length - 1}
            steps={steps}
        />
    );
};

export default MappingTemplateWizard;
