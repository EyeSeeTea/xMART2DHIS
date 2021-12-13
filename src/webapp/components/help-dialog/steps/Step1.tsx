import step1Image from "../assets/step1.png";
import React from "react";
import i18n from "../../../../locales";

export const Step1 = (props: any) => {
    const xmartUrl = `https://portal-uat.who.int/xmart4/${props.code}`;
    return (
        <React.Fragment>
            <h2>
                {i18n.t("Step 1: Go to ")}
                <a href={xmartUrl} target="_blank" rel="noreferrer">
                    {i18n.t("your XMart URL")}
                </a>
            </h2>
            <img src={step1Image} width={"100%"} alt={"XMart dashboard"} />
        </React.Fragment>
    );
};
