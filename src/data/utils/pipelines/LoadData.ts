export const LoadData = `<XmartPipeline>
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
