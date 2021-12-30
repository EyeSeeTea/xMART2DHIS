import { Wizard, WizardStep } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React from "react";
import { useLocation } from "react-router-dom";
import { SyncCustomAction } from "../../../domain/entities/actions/SyncCustomAction";

import i18n from "../../../locales";
import { GeneralInfoStep } from "./steps/GeneralInfoStep";
import { SummaryStep } from "./steps/SummaryStep";
import { CustomCodeStep } from "./steps/CustomCodeStep";

interface CustomActionWizardProps {
    action: SyncCustomAction;
    isDialog?: boolean;
    onChange?(action: SyncCustomAction): void;
    onCancel?(): void;
}

export const stepsBaseInfo: CustomActionWizardStep[] = [
    {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        validationKeys: ["name", "connectionId"],
    },
    {
        key: "custom-code",
        label: i18n.t("Custom code"),
        component: CustomCodeStep,
        validationKeys: [],
    },
    {
        key: "summary",
        label: i18n.t("Summary"),
        component: SummaryStep,
        validationKeys: [],
    },
];
export interface CustomActionWizardStep extends WizardStep {
    validationKeys: string[];
    hidden?: (action: SyncCustomAction) => boolean;
}

export interface CustomActionWizardStepProps {
    action: SyncCustomAction;
    onChange: (action: SyncCustomAction) => void;
    onCancel: () => void;
}

const CustomActionWizard: React.FC<CustomActionWizardProps> = ({ action, onCancel, onChange }) => {
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

export default CustomActionWizard;