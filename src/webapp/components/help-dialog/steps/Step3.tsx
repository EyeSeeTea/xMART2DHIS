import React from "react";
import step3Image from "../assets/step3.png";
import i18n from "../../../../locales";

export const Step3 = (props: any) => (
    <React.Fragment>
        <h2>{i18n.t("Step 3: Fill in the code, title and description (optional)")}</h2>
        <p>
            {i18n.t("Your code: ")}
            {props.code}
        </p>
        <p>
            {i18n.t("Your title:")} {props.name}
        </p>
        <img src={step3Image} width={"100%"} alt="Create new pipeline modal" />
    </React.Fragment>
);
