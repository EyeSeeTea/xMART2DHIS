import AbortController from "abort-controller";
import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { DataMart, MartTable, XMartContent, XMartResponse } from "../../domain/entities/XMart";
import { AzureRepository } from "../../domain/repositories/AzureRepository";
import { ListAllOptions, ListXMartOptions, XMartRepository } from "../../domain/repositories/XMartRepository";

export class XMartDefaultRepository implements XMartRepository {
    constructor(private azureRepository: AzureRepository) {}

    public listTables(mart: DataMart): FutureData<MartTable[]> {
        return this.request<MartTable[]>("get", mart, "").map(({ value: tables }) =>
            tables.map(({ name, kind }) => ({ name, kind, mart: mart.id }))
        );
    }

    public listTableContent(mart: DataMart, table: string, options: ListXMartOptions = {}): FutureData<XMartResponse> {
        const { pageSize = 25, page = 1, select, expand, apply, filter, orderBy } = options;
        const params = compactObject({
            top: pageSize,
            skip: (page - 1) * pageSize,
            count: true,
            select,
            expand,
            apply,
            filter,
            orderBy,
        });

        return this.request<XMartContent[]>("get", mart, table, { params }).map(response => ({
            objects: response.value,
            pager: { pageSize, page, total: response["@odata.count"] },
        }));
    }

    public listAllTableContent(
        mart: DataMart,
        table: string,
        options: ListAllOptions = {}
    ): FutureData<XMartContent[]> {
        return this.listTableContent(mart, table, options).flatMap(response => {
            const { objects, pager } = response;
            if (pager.total <= pager.pageSize) return Future.success(objects);

            const maxPage = Math.ceil(pager.total / pager.pageSize) + 1;
            const futures = _.range(2, maxPage).map(page =>
                this.listTableContent(mart, table, { ...options, page, pageSize: pager.pageSize })
            );

            return Future.parallel(futures, { maxConcurrency: 5 }).map(arrays =>
                _.flatten([objects, ...arrays.map(({ objects }) => objects)])
            );
        });
    }

    public countTableElements(mart: DataMart, table: string): FutureData<number> {
        return this.request<number>("get", mart, `/${table}/$count`, { textResponse: true }).map(({ value }) => value);
    }

    private request<Data>(
        method: "get" | "post",
        mart: DataMart,
        path: string,
        options: { body?: string; textResponse?: boolean; params?: Record<string, string | number | boolean> } = {}
    ): FutureData<ODataResponse<Data>> {
        const { body, textResponse = false, params } = options;
        const controller = new AbortController();
        const qs = buildParams(params);
        const url = `${joinUrl(mart.apiUrl, path)}${qs ? `?${qs}` : ""}`;

        return this.getToken(mart).flatMap(token =>
            Future.fromComputation((resolve, reject) => {
                fetch(url, {
                    signal: controller.signal,
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        "x-requested-with": "XMLHttpRequest",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                    body,
                })
                    .then(async response => {
                        if (!response.ok) {
                            reject("Fetch request failed");
                        } else if (textResponse) {
                            const text = await response.text();
                            resolve({ value: text as unknown as Data });
                        } else {
                            const json = await response.json();
                            resolve(json);
                        }
                    })
                    .catch(err => reject(err ? err.message : "Unknown error"));

                return controller.abort;
            })
        );
    }

    private getToken(mart: DataMart): FutureData<string | undefined> {
        switch (mart.type) {
            case "PROD":
                return this.azureRepository.getTokenPROD();
            case "UAT":
                return this.azureRepository.getTokenUAT();
            default:
                return Future.success(undefined);
        }
    }
}

function joinUrl(...urls: string[]): string {
    return urls.join("/").replace(/\/+/g, "/");
}

function buildParams(params?: Record<string, string | number | boolean>): string | undefined {
    if (!params) return undefined;
    return _.map(params, (value, key) => `$${key}=${value}`).join("&");
}

function compactObject<Obj extends object>(object: Obj) {
    return _.pickBy(object, _.identity);
}

type ODataResponse<Data> = { value: Data; [key: string]: any };
