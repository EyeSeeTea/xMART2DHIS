import _ from "lodash";
import { NamedRef, SharedRef } from "./Ref";
import { ShareableEntity } from "./ShareableEntity";

export type DataMartEndpoint = "PUBLIC" | "PROD" | "UAT";

export interface DataMart {
    id: string; // Auto-generated ID
    name: string; // User defined name
    code: string; // xMART code
    type: DataMartEndpoint;
    // If public, manually set by the user in the UI ie: https://frontdoor-r5quteqglawbs.azurefd.net/REFMART
    // If private, set with a dropdown in the UI https://portal-uat.who.int/xmart-api/odata/REFMART (UAT) or https://extranet.who.int/xmart-api/odata/REFMART (PROD)
    apiUrl: string;
}

export interface ConnectionData extends SharedRef {
    /*id: string; // Auto-generated ID
    name: string; // User defined name*/
    code: string; // xMART code
    type: string;
    // If public, manually set by the user in the UI ie: https://frontdoor-r5quteqglawbs.azurefd.net/REFMART
    // If private, set with a dropdown in the UI https://portal-uat.who.int/xmart-api/odata/REFMART (UAT) or https://extranet.who.int/xmart-api/odata/REFMART (PROD)
    apiUrl: string;
}


export const defaultConnection: DataMart = {
    id: "",
    name: "",
    code: "",
    type: "PUBLIC",
    apiUrl: "",
};

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
export interface Connection extends ShareableEntity<ConnectionData> {

}

