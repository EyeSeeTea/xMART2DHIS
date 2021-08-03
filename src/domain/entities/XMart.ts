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
