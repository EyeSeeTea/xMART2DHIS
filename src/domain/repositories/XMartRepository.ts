import { FutureData } from "../entities/Future";
import { XMartContent, XMartResponse, XMartTable } from "../entities/XMart";

export interface XMartRepository {
    listTables(): FutureData<XMartTable[]>;
    list(table: string, options?: ListOptions): FutureData<XMartResponse>;
    listAll(table: string, options?: ListAllOptions): FutureData<XMartContent[]>;
    count(table: string): FutureData<number>;
}

export type ListOptions = ListAllOptions & {
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
