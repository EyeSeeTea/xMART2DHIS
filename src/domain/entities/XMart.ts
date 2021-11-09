export interface XMartDataMart {
    id: string;
    name: string;
    type: "public" | "private";
    // If public, manually set by the user in the UI ie: https://frontdoor-r5quteqglawbs.azurefd.net/REFMART
    // If private, set with a dropdown in the UI https://portal-uat.who.int/xmart-api/odata/REFMART (UAT) or https://extranet.who.int/xmart-api/odata/REFMART (PROD)
    apiUrl: string;
}

export interface XMartTable {
    name: string;
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
