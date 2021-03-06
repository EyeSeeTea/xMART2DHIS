export const LoadModel = `<XmartPipeline IsStructure="true">
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
        <FindReplace Find=" " ReplaceWith="_" Column="TABLE_CODE" />
        <FindReplace Find="-" ReplaceWith="_" Column="TABLE_CODE" />
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
