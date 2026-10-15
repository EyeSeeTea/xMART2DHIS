import React from "react";
import { CopyBlock, dracula } from "react-code-blocks";
import { DataMart } from "../../../../domain/entities/xmart/DataMart";
import i18n from "../../../../utils/i18n";
import { PipelineSetupStepProps } from "../PipelineSetupDialog";

export const Step3: React.FC<PipelineSetupStepProps> = ({ mart, instructions }) => (
    <React.Fragment>
        <h2>
            {i18n.t("Step 3: ", { nsSeparator: false })}
            <a href={getUrl(mart, instructions.pipelineCode)} target="_blank" rel="noreferrer">
                {i18n.t("Configure the pipeline")}
            </a>
            {i18n.t(" with:", { nsSeparator: false })}
        </h2>
        <p>{i18n.t("Remember to click on the 'Publish' button.")}</p>
        <CopyBlock
            text={instructions.definition}
            language={"html"}
            showLineNumbers={true}
            startingLineNumber={1}
            wrapLines
            codeBlock
            theme={{ ...dracula, mode: "dark" }}
            copied={false}
            wrapLongLines={false}
            onCopy={() => undefined}
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

const getUrl = (mart: DataMart, pipelineCode: string) => {
    switch (mart.environment) {
        case "PROD":
            return `https://extranet.who.int/xmart4/${mart.martCode}/pipelines/configure/${pipelineCode}`;
        case "UAT":
            return `https://portal-uat.who.int/xmart4/${mart.martCode}/pipelines/configure/${pipelineCode}`;
        default:
            return "";
    }
};
