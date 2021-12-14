import React from "react";
import { CopyBlock, dracula } from "react-code-blocks";
import { LoadPipeline } from "../../../../data/utils/pipelines/LoadPipeline";
import { DataMart } from "../../../../domain/entities/xmart/DataMart";
import i18n from "../../../../locales";
import { PipelineSetupDialogProps } from "../PipelineSetupDialog";

export const Step3: React.FC<PipelineSetupDialogProps> = ({ mart }) => (
    <React.Fragment>
        <h2>
            {i18n.t("Step 3: ", { nsSeparator: false })}
            <a href={getUrl(mart)} target="_blank" rel="noreferrer">
                {i18n.t("Configure the pipeline")}
            </a>
            {i18n.t(" with:", { nsSeparator: false })}
        </h2>
        <p>{i18n.t("Remember to click on the 'Publish' button.")}</p>
        <CopyBlock
            text={LoadPipeline}
            language={"html"}
            showLineNumbers={true}
            startingLineNumber={1}
            wrapLines
            codeBlock
            theme={dracula}
            customStyle={{
                height: "400px",
                overflow: "auto",
                fontFamily: "monospace",
                fontWeight: "400",
                fontSize: "14px",
            }}
        />
    </React.Fragment>
);

const getUrl = (mart: DataMart) => {
    switch (mart.environment) {
        case "PROD":
            return `https://extranet.who.int/xmart4/${mart.martCode}/pipelines/LOAD_PIPELINE`;
        case "UAT":
            return `https://portal-uat.who.int/xmart4/${mart.martCode}/pipelines/LOAD_PIPELINE`;
        default:
            return "";
    }
};
