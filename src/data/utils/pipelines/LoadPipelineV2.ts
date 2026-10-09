export const LoadPipelineV2 = `<XmartPipeline IsStructure="true">
  <Extract>
    <GetJson OutputTableName="PIPELINE">
      <Path>$</Path>
    </GetJson>
  </Extract>
  <Load>
    <LoadTable SourceTable="PIPELINE" TargetTable="PIPELINE" LoadStrategy="MERGE" DeleteNotInSource="false">
      <Transform>
        <AddColumn Name="DESCRIPTION" />
        <AddColumn Name="_Delete" FillWith="0" />
        <AddColumn Name="MART_ID" FillWith="\${MART_ID}" />
        <AddColumn Name="TYPE_ID" FillWith="2" />
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
        <ColumnMapping Source="TYPE_ID" Target="TypeID" />
      </ColumnMappings>
    </LoadTable>
    <LoadTable SourceTable="PIPELINE" TargetTable="ORIGIN" LoadStrategy="MERGE" DeleteNotInSource="false">
      <Transform>
        <AddColumn Name="DESCRIPTION" />
        <AddColumn Name="_Delete" FillWith="0" />
        <AddColumn Name="MART_ID" FillWith="\${MART_ID}" />
        <AddColumn Name="IS_FILE_BASED" FillWith="1" />
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
        <ColumnMapping Source="IS_FILE_BASED" Target="IsFileBased" />
      </ColumnMappings>
    </LoadTable>
  </Load>
</XmartPipeline>
`;
