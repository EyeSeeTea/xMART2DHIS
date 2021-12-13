import React from "react";
import i18n from "../../../../locales";
import step4Image from "../assets/step4.png";

export const Step4 = () => (
    <React.Fragment>
        <h2>{i18n.t("Step 4: Click 'configure' on the pipeline row that you created")}</h2>
        <img src={step4Image} width={"100%"} alt={"Edit pipeline"} />
    </React.Fragment>
);
