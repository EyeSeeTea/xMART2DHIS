import React from "react";
import i18n from "../../../../locales";
import step5Image from "../assets/step5.png";
import { CopyBlock, atomOneLight } from "react-code-blocks";

export const Step5 = () => (
    <React.Fragment>
        <h2>{i18n.t("Step 5: Copy the XML below into the code editor section")}</h2>
        <p>
            {i18n.t(
                "Remember to click on the 'Validate' button to check for errors. Then click on the 'Save' button then 'Publish' button."
            )}
        </p>
        <img src={step5Image} width={"100%"} alt={"Configure pipeline XML"} />
        <CopyBlock
            text={loadPipelineXml}
            language={"xml"}
            showLineNumbers={true}
            startingLineNumber={1}
            wrapLines
            codeBlock
            theme={atomOneLight}
        />
    </React.Fragment>
);

const loadPipelineXml = `<XmartPipeline IsStructure="true">
              <Context>
                <Inputs>
                  <Add Key="url" Type="text" />
                </Inputs>
              </Context>
              <Extract>
                <GetWebService Url="\${url}">
                  <GetJson OutputTableName="PIPELINE">
                    <Path>$</Path>
                  </GetJson>
                </GetWebService>
              </Extract>
              <Load>
                <LoadTable SourceTable="PIPELINE" TargetTable="PIPELINE" LoadStrategy="MERGE" DeleteNotInSource="false">
                  <Transform>
                    <AddColumn Name="DESCRIPTION" />
                    <AddColumn Name="_Delete" FillWith="0" />
                    <AddColumn Name="MART_ID" FillWith="\${MART_ID}" />
                    <FindReplace Find=" " ReplaceWith="_" Column="CODE" />
                    <FindReplace Find="-" ReplaceWith="_" Column="CODE" />
                  </Transform>
                  <ColumnMappings>
                    <ColumnMapping Source="CODE" Target="Code" />
                    <ColumnMapping Source="TITLE" Target="Title" />
                    <ColumnMapping Source="DESCRIPTION" Target="Description" />
                    <ColumnMapping Source="XML" Target="XML_Draft" />
                    <ColumnMapping Source="XML" Target="XML_Published" />
                    <ColumnMapping Source="_Delete" Target="_Delete" />
                  </ColumnMappings>
                </LoadTable>
                <LoadTable SourceTable="PIPELINE" TargetTable="ORIGIN" LoadStrategy="MERGE" DeleteNotInSource="false">
                  <Transform>
                    <AddColumn Name="DESCRIPTION" />
                    <AddColumn Name="_Delete" FillWith="0" />
                    <AddColumn Name="MART_ID" FillWith="\${MART_ID}" />
                    <FindReplace Find=" " ReplaceWith="_" Column="CODE" />
                    <FindReplace Find="-" ReplaceWith="_" Column="CODE" />
                  </Transform>
                  <LookupIDs>
                    <StoreLookup LookupTable="PIPELINE" SourceResultColumn="PipelineID" SourceColumns="[CODE], [MART_ID]" LookupResultColumn="Sys_ID" LookupColumns="Code, MartID__Sys_ID" RegisterMissingAsIssues="false" />
                    <StageLookup LookupTable="PIPELINE" SourceResultColumn="PipelineID" SourceColumns="[CODE]" LookupResultColumn="Sys_ID" LookupColumns="Code" />
                  </LookupIDs>
                  <ColumnMappings>
                    <ColumnMapping Source="CODE" Target="Code" />
                    <ColumnMapping Source="PipelineID" Target="PipelineID" />
                    <ColumnMapping Source="TITLE" Target="Title" />
                    <ColumnMapping Source="DESCRIPTION" Target="Description" />
                    <ColumnMapping Source="_Delete" Target="_Delete" />
                  </ColumnMappings>
                </LoadTable>
              </Load>
            </XmartPipeline>
            `;
