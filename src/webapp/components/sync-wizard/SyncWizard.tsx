import { Wizard, WizardStep } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React from "react";
import { useLocation } from "react-router-dom";
import { SyncAction } from "../../../domain/entities/actions/SyncAction";
import i18n from "../../../locales";
import { GeneralInfoStep } from "./steps/GeneralInfoStep";
import MappingSelectionStep from "./steps/MappingSelectionStep";
import MetadataSelectionStep from "./steps/MetadataSelectionStep";
import OrganisationUnitsSelectionStep from "./steps/OrganisationUnitsSelectionStep";
import PeriodSelectionStep from "./steps/PeriodSelectionStep";
import { SummaryStep } from "./steps/SummaryStep";

interface SyncWizardProps {
    action: SyncAction;
    isDialog?: boolean;
    onChange?(action: SyncAction): void;
    onCancel?(): void;
}

export const stepsBaseInfo: SyncWizardStep[] = [
    {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        validationKeys: ["name"],
    },
    {
        key: "organisations-units",
        label: i18n.t("Organisation units"),
        component: OrganisationUnitsSelectionStep,
        validationKeys: ["orgUnitPaths"],
    },
    {
        key: "metadata",
        label: i18n.t("Metadata"),
        component: MetadataSelectionStep,
        validationKeys: ["metadataIds"],
    },
    {
        key: "period",
        label: i18n.t("Period"),
        component: PeriodSelectionStep,
        validationKeys: ["startDate", "endDate"],
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

export interface SyncWizardStep extends WizardStep {
    validationKeys: string[];
    hidden?: (action: SyncAction) => boolean;
}

export interface SyncWizardStepProps {
    action: SyncAction;
    onChange: (action: SyncAction) => void;
    onCancel: () => void;
}

const SyncWizard: React.FC<SyncWizardProps> = ({ action, onCancel, onChange }) => {
    const location = useLocation();
    const steps = stepsBaseInfo.map(step => ({ ...step, props: { action, onCancel, onChange } }));

    const onStepChangeRequest = async (_currentStep: WizardStep, newStep: WizardStep) => {
        const index = _(steps).findIndex(step => step.key === newStep.key);
        const validationMessages = _.take(steps, index).map(({ validationKeys }) =>
            action.validate(validationKeys).map(({ description }) => description)
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

export default SyncWizard;
