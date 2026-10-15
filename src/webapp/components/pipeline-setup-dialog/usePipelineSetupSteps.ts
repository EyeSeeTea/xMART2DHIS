import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "../../contexts/app-context";
import { useFuture } from "../../hooks/useFuture";
import { PipelineSetupDialogProps } from "./PipelineSetupDialog";
import { PipelineWizardSteps } from "./steps";

export function usePipelineSetupSteps(props: PipelineSetupDialogProps) {
    const { compositionRoot } = useAppContext();
    const { data: instructions } = useFuture(compositionRoot.connection.getSetupInstructions, []);
    const location = useLocation();

    const steps = useMemo(
        () => (instructions ? PipelineWizardSteps.map(step => ({ ...step, props: { ...props, instructions } })) : []),
        [props, instructions]
    );

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    return { steps, initialStepKey };
}
