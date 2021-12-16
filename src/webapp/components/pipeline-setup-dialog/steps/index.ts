import { WizardStep } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import { PipelineSetupDialogProps } from "../PipelineSetupDialog";
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";

export interface HelpPipelineWizardStep extends WizardStep {
    props?: PipelineSetupDialogProps;
}

export const PipelineWizardSteps: HelpPipelineWizardStep[] = [
    {
        key: "step1",
        label: i18n.t("Go to xMART"),
        component: Step1,
    },
    {
        key: "step2",
        label: i18n.t("Create pipeline"),
        component: Step2,
    },
    {
        key: "step3",
        label: i18n.t("Configure pipeline"),
        component: Step3,
    },
];
