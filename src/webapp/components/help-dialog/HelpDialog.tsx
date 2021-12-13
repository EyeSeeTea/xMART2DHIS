import { ConfirmationDialog, Wizard } from "@eyeseetea/d2-ui-components";
import React, { useMemo } from "react";
import i18n from "../../../locales";
import { useLocation } from "react-router-dom";
import { helpPipelineWizardSteps } from "./HelpPipelineWizardSteps";

export interface HelpDialogProps {
    onCancel?: () => void;
    code?: string;
    name?: string;
}

const HelpDialog: React.FC<HelpDialogProps> = props => {
    const location = useLocation();
    const steps = useMemo(() => helpPipelineWizardSteps.map(step => ({ ...step, props })), [props]);
    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Instructions to set up pipeline")}
            cancelText={i18n.t("Close")}
            onCancel={props.onCancel}
            maxWidth={"md"}
            fullWidth={true}
        >
            <Wizard
                useSnackFeedback={true}
                initialStepKey={initialStepKey}
                lastClickableStepIndex={steps.length - 1}
                steps={steps}
            />
        </ConfirmationDialog>
    );
};

export default HelpDialog;
