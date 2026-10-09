export const LoadDataV2 = `<XmartPipeline>
  <Context>
    <Inputs>
      <Add Key="table" Type="text" />
    </Inputs>
  </Context>
  <Extract>
    <GetJson OutputTableName="data">
      <Path>$</Path>
    </GetJson>
  </Extract>
  <Load>
    <LoadTable SourceTable="data" TargetTable="\${table}" LoadStrategy="MERGE" DeleteNotInSource="false">
      <ColumnMappings Auto="true" />
    </LoadTable>
  </Load>
</XmartPipeline>
`;
