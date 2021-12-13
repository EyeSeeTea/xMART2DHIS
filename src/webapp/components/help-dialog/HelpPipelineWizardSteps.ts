import { WizardStep } from "@eyeseetea/d2-ui-components";
import i18n from "../../../locales";
import { Step1 } from "./steps/Step1";
import { Step2 } from "./steps/Step2";
import { Step3 } from "./steps/Step3";
import { Step4 } from "./steps/Step4";
import { Step5 } from "./steps/Step5";

export interface HelpPipelineWizardStep extends WizardStep {
    props?: HelpPipelineWizardStepProps;
}

export interface HelpPipelineWizardStepProps {
    onCancel: () => void;
}

export const helpPipelineWizardSteps: HelpPipelineWizardStep[] = [
    {
        key: "step1",
        label: i18n.t("Go to XMart dashboard"),
        component: Step1,
    },
    {
        key: "step2",
        label: i18n.t("Pipelines page"),
        component: Step2,
    },
    {
        key: "step3",
        label: i18n.t("Create new pipeline"),
        component: Step3,
    },
    {
        key: "step4",
        label: i18n.t("Configure pipeline"),
        component: Step4,
    },
    {
        key: "step5",
        label: i18n.t("Copy XML"),
        component: Step5,
    },
];
