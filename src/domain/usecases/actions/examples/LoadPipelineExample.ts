import { UseCase } from "../../../../compositionRoot";
import { getD2APiFromInstance } from "../../../../utils/d2-api";
import { apiToFuture } from "../../../../utils/futures";
import { getUid } from "../../../../utils/uid";
import { Future, FutureData } from "../../../entities/Future";
import { XMartPipelineDefinition } from "../../../entities/xmart/xMartSyncTables";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

// TODO: This is an example use case, should be more generic and use table metadata, validations and mapping
export class LoadPipelineExample implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) {}

    public execute(): FutureData<number> {
        const instance = this.instanceRepository.getInstance();
        const api = getD2APiFromInstance(instance);

        const pipelines: XMartPipelineDefinition[] = [
            {
                CODE: "LOAD_PIPELINE",
                TITLE: "[xMART2DHIS] Load pipeline from URL",
                XML: loadPipelineXml,
            },
            {
                CODE: "LOAD_DATA",
                TITLE: "[xMART2DHIS] Load data from URL",
                XML: loadDataPipelineXml,
            },
            {
                CODE: "LOAD_MODEL",
                TITLE: "[xMART2DHIS] Load model from URL",
                XML: loadModelPipelineXml,
            },
        ];

        const value = JSON.stringify(pipelines);
        const data = new Blob([value], { type: "application/json" });

        return apiToFuture(api.files.upload({ id: getUid("LOAD_PIPELINES"), name: "Example file", data }))
            .flatMap(({ id }) => {
                const baseUrl =
                    process.env.NODE_ENV === "development"
                        ? process.env.REACT_APP_DHIS2_BASE_URL
                        : this.instanceRepository.getBaseUrl();

                const url = `${baseUrl}/api/documents/${id}/data`;
                return Future.joinObj({
                    url: Future.success(url),
                    sharing: apiToFuture(
                        api.sharing.post({ id, type: "document" }, { publicAccess: "--------", externalAccess: true })
                    ),
                });
            })
            .flatMap(({ url }) => this.martRepository.runPipeline(TRAINING_MART, "LOAD_PIPELINE", { url }));
    }
}

const TRAINING_MART = {
    id: "TRAINING",
    name: "TRAINING",
    code: "TRAINING_ARC",
    type: "UAT",
    apiUrl: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/TRAINING_ARC",
} as const;

const loadPipelineXml = `
<XmartPipeline IsStructure="true">
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

const loadDataPipelineXml = `
<XmartPipeline>
  <Context>
    <Inputs>
      <Add Key="url" Type="text" />
      <Add Key="table" Type="text" />
    </Inputs>
  </Context>
  <Extract>
    <GetWebService Url="\${url}">
      <GetJson OutputTableName="data">
        <Path>$</Path>
      </GetJson>
    </GetWebService>
  </Extract>
  <Load>
    <LoadTable SourceTable="data" TargetTable="\${table}" LoadStrategy="MERGE" DeleteNotInSource="false">
      <ColumnMappings Auto="true" />
    </LoadTable>
  </Load>
</XmartPipeline>
`;

const loadModelPipelineXml = `
<XmartPipeline IsStructure="true">
  <Context>
    <Inputs>
      <Add Key="url" Type="text" />
    </Inputs>
  </Context>
  <Extract>
    <GetWebService Url="\${url}">
      <GetJson OutputTableName="tables">
        <Path>tables</Path>
      </GetJson>
    </GetWebService>
    <GetWebService Url="\${url}">
      <GetJson OutputTableName="fields">
        <Path>fields</Path>
      </GetJson>
    </GetWebService>
  </Extract>
  <Load>
    <LoadTable SourceTable="tables" TargetTable="TABLES" LoadStrategy="MERGE">
      <Transform>
        <AddColumn Name="DESCRIPTION" />
        <AddColumn Name="ON_DELETE_CASCADE" FillWith="0" />
        <AddColumn Name="_RecordID" />
        <AddColumn Name="_Delete" FillWith="0" />
        <AddColumn Name="MART_ID" FillWith="\${MART_ID}" />
        <FindReplace Find=" " ReplaceWith="_" Column="CODE" />
        <FindReplace Find="-" ReplaceWith="_" Column="CODE" />
      </Transform>
      <Validate>
        <TestPattern Impact="Error_RemoveRow" Tag="Table Code must only contain alpha-numeric or underscore characters" Column="CODE" Pattern="^[A-Za-z0-9_]+$" />
      </Validate>
      <ColumnMappings>
        <ColumnMapping Source="CODE" Target="CODE" />
        <ColumnMapping Source="TITLE" Target="TITLE" />
        <ColumnMapping Source="DESCRIPTION" Target="DESCRIPTION" />
        <ColumnMapping Source="ON_DELETE_CASCADE" Target="ON_DELETE_CASCADE" />
        <ColumnMapping Source="_Delete" Target="_Delete" />
        <ColumnMapping Source="_RecordID" Target="_RecordID" />
      </ColumnMappings>
    </LoadTable>
    <LoadTable SourceTable="fields" TargetTable="TABLE_FIELD" LoadStrategy="MERGE">
      <Transform>
        <AddColumn Name="DESCRIPTION" />
        <AddColumn Name="SEQUENCE" />
        <AddColumn Name="FK_TABLE_CODE" />
        <AddColumn Name="IS_ROW_TITLE" FillWith="0" />
        <AddColumn Name="IS_PRIMARY_KEY" FillWith="0" />
        <AddColumn Name="IS_REQUIRED" FillWith="0" />
        <AddColumn Name="DO_NOT_COMPARE" FillWith="0" />
        <AddColumn Name="_RecordID" />
        <AddColumn Name="_Delete" FillWith="0" />
        <AddColumn Name="MART_ID" FillWith="\${MART_ID}" />
        <FindReplace Find=" " ReplaceWith="_" Column="CODE" />
        <FindReplace Find="-" ReplaceWith="_" Column="CODE" />
        <FindReplace Find=" " ReplaceWith="_" Column="FK_TABLE_CODE" />
        <FindReplace Find="-" ReplaceWith="_" Column="FK_TABLE_CODE" />
      </Transform>
      <LookupIDs>
        <StoreLookup LookupTable="TABLES" SourceResultColumn="TABLE_ID" SourceColumns="[TABLE_CODE], [MART_ID]" LookupResultColumn="Sys_ID" LookupColumns="CODE, MART_ID__Sys_ID" RegisterMissingAsIssues="false" />
        <StageLookup LookupTable="TABLES" SourceResultColumn="TABLE_ID" SourceColumns="[TABLE_CODE]" LookupResultColumn="Sys_ID" LookupColumns="CODE" />
        <StoreLookup LookupTable="TABLES" SourceResultColumn="FK_TABLE_ID" SourceColumns="[FK_TABLE_CODE], [MART_ID]" LookupResultColumn="Sys_ID" LookupColumns="CODE, MART_ID__Sys_ID" RegisterMissingAsIssues="false" />
        <StageLookup LookupTable="TABLES" SourceResultColumn="FK_TABLE_ID" SourceColumns="[FK_TABLE_CODE]" LookupResultColumn="Sys_ID" LookupColumns="CODE" />
        <StoreLookup LookupTable="FIELD_TYPE" SourceResultColumn="FIELD_TYPE_ID" SourceColumns="[FIELD_TYPE_CODE]" LookupResultColumn="Sys_ID" LookupColumns="Code" />
      </LookupIDs>
      <Validate>
        <TestNotEmpty Impact="Error_RemoveRow" Tag="Field Type Not found." ContextColumns="CODE,FIELD_TYPE_CODE" Column="FIELD_TYPE_ID" />
        <TestPattern Impact="Error_RemoveRow" Tag="Field Code must not start with Sys_" Column="CODE" Pattern="^\\s*(?!sys_).*?$" />
        <TestPattern Impact="Error_RemoveRow" Tag="Field Code must not use reserved names _RecordID nor _Delete" Column="CODE" Pattern="^\\s*(?!_Record)(?!_Delete).*?$" />
        <TestPattern Impact="Error_RemoveRow" Tag="Field Code must only contain alpha-numeric or underscore characters" Column="CODE" Pattern="^[A-Za-z0-9_]+$" />
        <TestRow Impact="Error_RemoveRow" Tag="TEXT_MAX not allowed as BPK" ContextColumns="CODE,FIELD_TYPE,IS_PRIMARY_KEY">
          <Expression>row["IS_PRIMARY_KEY"].NumberValue == 0 || row["FIELD_TYPE_CODE"].StringValue != "TEXT_MAX"</Expression>
        </TestRow>
      </Validate>
      <ColumnMappings>
        <ColumnMapping Source="CODE" Target="CODE" />
        <ColumnMapping Source="TITLE" Target="TITLE" />
        <ColumnMapping Source="DESCRIPTION" Target="DESCRIPTION" />
        <ColumnMapping Source="SEQUENCE" Target="SEQUENCE" />
        <ColumnMapping Source="TABLE_ID" Target="TABLE_ID" />
        <ColumnMapping Source="FIELD_TYPE_ID" Target="FIELD_TYPE_ID" />
        <ColumnMapping Source="FK_TABLE_ID" Target="FK_TABLE_ID" />
        <ColumnMapping Source="IS_REQUIRED" Target="IS_REQUIRED" />
        <ColumnMapping Source="IS_PRIMARY_KEY" Target="IS_PRIMARY_KEY" />
        <ColumnMapping Source="IS_ROW_TITLE" Target="IS_ROW_TITLE" />
        <ColumnMapping Source="DO_NOT_COMPARE" Target="DO_NOT_COMPARE" />
        <ColumnMapping Source="_RecordID" Target="_RecordID" />
        <ColumnMapping Source="_Delete" Target="_Delete" />
      </ColumnMappings>
    </LoadTable>
  </Load>
</XmartPipeline>
`;
