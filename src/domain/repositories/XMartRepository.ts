import { FutureData } from "../entities/Future";
import { DataMart, DataMartEnvironment, MartTable, XMartContent, XMartResponse } from "../entities/xmart/DataMart";

export interface XMartRepository {
    listMartSuggestions(): FutureData<MartSuggestions>;
    listTables(mart: DataMart): FutureData<MartTable[]>;
    listTableContent(mart: DataMart, table: string, options?: ListXMartOptions): FutureData<XMartResponse>;
    listAllTableContent(mart: DataMart, table: string, options?: ListAllOptions): FutureData<XMartContent[]>;
    countTableElements(mart: DataMart, table: string): FutureData<number>;
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
