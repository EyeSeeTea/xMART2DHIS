import React from "react";
import { DataMart } from "../../../../domain/entities/xmart/DataMart";
import i18n from "../../../../locales";
import step1Image from "../assets/step1.png";
import { PipelineSetupDialogProps } from "../PipelineSetupDialog";

export const Step1: React.FC<PipelineSetupDialogProps> = ({ mart }) => {
    return (
        <React.Fragment>
            <h2>
                {i18n.t("Step 1: Go to the pipeline creation ", { nsSeparator: false })}
                <a href={getUrl(mart)} target="_blank" rel="noreferrer">
                    {i18n.t("page")}
                </a>
            </h2>
            <img src={step1Image} width={"100%"} alt={"XMart dashboard"} />
        </React.Fragment>
    );
};

const getUrl = (mart: DataMart) => {
    switch (mart.environment) {
        case "PROD":
            return `https://extranet.who.int/xmart4/${mart.martCode}/pipelines`;
        case "UAT":
            return `https://portal-uat.who.int/xmart4/${mart.martCode}/pipelines`;
        default:
            return "";
    }
};
