import { ConfirmationDialog, Wizard } from "@eyeseetea/d2-ui-components";
import React from "react";
import { DataMart } from "../../../domain/entities/xmart/DataMart";
import { MartSetupInstructions } from "../../../domain/entities/xmart/MartSetupInstructions";
import i18n from "../../../utils/i18n";
import { usePipelineSetupSteps } from "./usePipelineSetupSteps";

export interface PipelineSetupDialogProps {
    onCancel?: () => void;
    mart: DataMart;
}

export type PipelineSetupStepProps = PipelineSetupDialogProps & { instructions: MartSetupInstructions };

export const PipelineSetupDialog: React.FC<PipelineSetupDialogProps> = props => {
    const { steps, initialStepKey } = usePipelineSetupSteps(props);

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Instructions to set up pipeline")}
            cancelText={i18n.t("Close")}
            onCancel={props.onCancel}
            maxWidth={"md"}
            fullWidth={true}
        >
            {steps.length > 0 ? (
                <Wizard
                    useSnackFeedback={true}
                    initialStepKey={initialStepKey}
                    lastClickableStepIndex={steps.length - 1}
                    steps={steps}
                />
            ) : null}
        </ConfirmationDialog>
    );
};
