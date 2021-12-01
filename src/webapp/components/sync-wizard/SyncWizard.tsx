import { Wizard, WizardStep } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React from "react";
import { useLocation } from "react-router-dom";
import { SyncAction } from "../../../domain/entities/SyncAction";
import i18n from "../../../locales";
import { GeneralInfoStep } from "./steps/GeneralInfoStep";
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
        key: "summary",
        label: i18n.t("Summary"),
        component: SummaryStep,
        validationKeys: [],
        showOnSyncDialog: true,
    },
];

export interface SyncWizardStep extends WizardStep {
    validationKeys: string[];
    showOnSyncDialog?: boolean;
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

    // This effect should only run in the first load
    // useEffect(() => {
    //     getMetadata(api, memoizedRule.current.metadataIds, "id").then(metadata => {
    //         const types = _.keys(metadata);
    //         onChange(
    //             memoizedRule.current
    //                 .updateMetadataTypes(types)
    //                 .updateDataSyncEnableAggregation(
    //                     types.includes("indicators") || types.includes("programIndicators")
    //                 )
    //         );
    //     });
    // }, [api, onChange, action]);

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
