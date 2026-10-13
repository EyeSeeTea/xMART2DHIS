import step2Image from "../assets/step2.gif";
import React from "react";
import { PipelineCodes } from "../../../../data/utils/pipelines/PipelineCodes";
import i18n from "../../../../utils/i18n";
import { PipelineSetupDialogProps } from "../PipelineSetupDialog";

export const Step2: React.FC<PipelineSetupDialogProps> = () => (
    <React.Fragment>
        <h2>
            {i18n.t("Step 2: Create '{{code}}' pipeline", { code: PipelineCodes.loadPipeline, nsSeparator: false })}
        </h2>
        <p>
            {i18n.t(
                "Click 'New' above the list of pipelines ('Create a Pipeline' if the mart has no pipelines yet). The code needs to be exactly '{{code}}'.",
                { code: PipelineCodes.loadPipeline }
            )}
        </p>
        <p>
            {i18n.t("Choose the type 'Normal', not 'Flow': the pipeline does not work as a Flow pipeline.", {
                nsSeparator: false,
            })}
        </p>
        <img src={step2Image} width={"100%"} alt={"Pipeline screen"} />
    </React.Fragment>
);
