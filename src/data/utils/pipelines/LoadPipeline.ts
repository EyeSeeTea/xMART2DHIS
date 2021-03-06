export const LoadPipeline = `<XmartPipeline IsStructure="true">
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
