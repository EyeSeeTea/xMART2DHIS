import step2Image from "../assets/step2.gif";
import React from "react";
import i18n from "../../../../locales";
import { PipelineSetupDialogProps } from "../PipelineSetupDialog";

export const Step2: React.FC<PipelineSetupDialogProps> = () => (
    <React.Fragment>
        <h2>{i18n.t("Step 2: Create 'LOAD_PIPELINE' pipeline", { nsSeparator: false })}</h2>
        <p>{i18n.t("The code needs to be exactly 'LOAD_PIPELINE'.")}</p>
        <img src={step2Image} width={"100%"} alt={"Pipeline screen"} />
    </React.Fragment>
);
