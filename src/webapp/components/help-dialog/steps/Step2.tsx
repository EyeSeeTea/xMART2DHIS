import step2Image from "../assets/step2.png";
import React from "react";
import i18n from "../../../../locales";

export const Step2 = () => (
    <React.Fragment>
        <h2>{i18n.t("Step 2: Click on Pipelines button")}</h2>
        <p>{i18n.t("Then click on the 'Create a Pipeline' button.")}</p>
        <img src={step2Image} width={"100%"} alt={"Pipelines screen"} />
    </React.Fragment>
);
