import { FutureData } from "../entities/Future";
import { DataMart, DataMartEnvironment, MartTable, XMartContent, XMartResponse } from "../entities/xmart/DataMart";
import { XMartLoadModelData } from "../entities/xmart/xMartSyncTableTemplates";

export interface XMartRepository {
    listMartSuggestions(): FutureData<MartSuggestions>;
    listTables(mart: DataMart): FutureData<MartTable[]>;
    listTableContent(mart: DataMart, table: string, options?: ListXMartOptions): FutureData<XMartResponse>;
    listAllTableContent(mart: DataMart, table: string, options?: ListAllOptions): FutureData<XMartContent[]>;
    countTableElements(mart: DataMart, table: string): FutureData<number>;
    /** Creates or updates the tables and fields of the mart. Resolves to the xMART batch id. */
    loadModel(mart: DataMart, model: XMartLoadModelData): FutureData<number>;
    /** Loads the rows into a table of the mart. Resolves to the xMART batch id. */
    loadData(mart: DataMart, table: string, rows: ReadonlyArray<unknown>): FutureData<number>;
    /** Checks that the mart is ready to receive the app's data. Resolves to the xMART batch id. */
    checkConnection(mart: DataMart): FutureData<number>;
    runPipeline(
        mart: DataMart,
        pipeline: string,
        params: Record<string, string | number | boolean>
    ): FutureData<number>;
}

export type ListXMartOptions = ListAllOptions & {
    pageSize?: number;
    page?: number;
};

export type ListAllOptions = {
    select?: string; // Selects a subset of properties to include in the response
    expand?: string; // Related entities to be included inline in the response
    apply?: string; // Group-by properties in the response
    filter?: string; // Filter results to be included in the response (ie: "contains(TEST_TYPE_FK, 'value')")
    orderBy?: string; // Order the results by properties
};

export type MartSuggestions = Record<DataMartEnvironment, { label: string; value: string }[]>;
