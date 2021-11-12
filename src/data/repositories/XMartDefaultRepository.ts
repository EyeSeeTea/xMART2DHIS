import AbortController from "abort-controller";
import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { DataMart, MartTable, XMartContent, XMartResponse } from "../../domain/entities/XMart";
import { AzureRepository } from "../../domain/repositories/AzureRepository";
import { ListAllOptions, ListXMartOptions, XMartRepository } from "../../domain/repositories/XMartRepository";

export class XMartDefaultRepository implements XMartRepository {
    constructor(private azureRepository: AzureRepository) {}

    public listTables(mart: DataMart): FutureData<MartTable[]> {
        return this.futureFetch<MartTable[]>("get", mart, "").map(({ value: tables }) =>
            tables.map(({ name, kind }) => ({ name, kind, mart: mart.id }))
        );
    }

    public list(mart: DataMart, table: string, options: ListXMartOptions = {}): FutureData<XMartResponse> {
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

        return this.query<XMartContent[]>(mart, table, params).map(response => ({
            objects: response.value,
            pager: { pageSize, page, total: response["@odata.count"] },
        }));
    }

    public listAll(mart: DataMart, table: string, options: ListAllOptions = {}): FutureData<XMartContent[]> {
        return this.list(mart, table, options).flatMap(response => {
            const { objects, pager } = response;
            if (pager.total <= pager.pageSize) return Future.success(objects);

            const maxPage = Math.ceil(pager.total / pager.pageSize) + 1;
            const futures = _.range(2, maxPage).map(page =>
                this.list(mart, table, { ...options, page, pageSize: pager.pageSize })
            );

            return Future.parallel(futures, { maxConcurrency: 5 }).map(arrays =>
                _.flatten([objects, ...arrays.map(({ objects }) => objects)])
            );
        });
    }

    public count(mart: DataMart, table: string): FutureData<number> {
        return this.futureFetch<number>("get", mart, `/${table}/$count`, { textResponse: true }).map(
            ({ value }) => value
        );
    }

    private query<Data>(
        mart: DataMart,
        table: string,
        params: Record<string, string | number | boolean>
    ): FutureData<ODataResponse<Data>> {
        const qs = buildParams(params);

        /**console.log(response);
        fetch("https://portal-uat.who.int/xmart-api/odata/TRAINING_ARC/AGGREGATED", {
            headers: { Authorization: `Bearer ${response.accessToken}` },
        })
            .then(response => response.json())
            .then(data => console.log(data));**/

        return this.futureFetch("get", mart, `/${table}?${qs}`);
    }

    private futureFetch<Data>(
        method: "get" | "post",
        mart: DataMart,
        path: string,
        options: { body?: string; textResponse?: boolean } = {}
    ): FutureData<ODataResponse<Data>> {
        const { body, textResponse = false } = options;
        const controller = new AbortController();

        return this.getToken(mart).flatMap(token =>
            Future.fromComputation((resolve, reject) => {
                fetch(mart.apiUrl + path, {
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

function buildParams(params: Record<string, string | number | boolean>) {
    return _.map(params, (value, key) => `$${key}=${value}`).join("&");
}

function compactObject<Obj extends object>(object: Obj) {
    return _.pickBy(object, _.identity);
}

type ODataResponse<Data> = { value: Data; [key: string]: any };
