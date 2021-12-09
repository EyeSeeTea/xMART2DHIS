import { SharedRef } from "../metadata/Ref";

export type DataMartEnvironment = "PROD" | "UAT";

export interface DataMart extends SharedRef {
    environment: DataMartEnvironment;
    martCode: string;
    // If public, manually set by the user in the UI ie: https://frontdoor-r5quteqglawbs.azurefd.net/REFMART
    // If private, set with a dropdown in the UI https://portal-uat.who.int/xmart-api/odata/REFMART (UAT) or https://extranet.who.int/xmart-api/odata/REFMART (PROD)
    dataEndpoint: string;
}

export interface MartTable {
    name: string;
    mart: string;
    kind: string;
}

export interface XMartContent {
    [key: string]: string | number | boolean | null;
}

export interface XMartResponse {
    objects: XMartContent[];
    pager: XMartPager;
}

export interface XMartPager {
    page: number;
    pageSize: number;
    total: number;
}
