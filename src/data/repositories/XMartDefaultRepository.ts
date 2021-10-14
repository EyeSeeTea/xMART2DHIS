import AbortController from "abort-controller";
import _ from "lodash";
import { XMartEndpoint, XMartEndpoints } from "../../compositionRoot";
import { Future, FutureData } from "../../domain/entities/Future";
import { XMartContent, XMartResponse, XMartTable } from "../../domain/entities/XMart";
import { ListAllOptions, ListOptions, XMartRepository } from "../../domain/repositories/XMartRepository";

export class XMartDefaultRepository implements XMartRepository {
    public listTables(endpoint: XMartEndpoint): FutureData<XMartTable[]> {
        return futureFetch<XMartTable[]>("get", endpoint, "").map(({ value: tables }) =>
            tables.map(({ name, kind }) => ({ name, kind }))
        );
    }

    public list(endpoint: XMartEndpoint, table: string, options: ListOptions = {}): FutureData<XMartResponse> {
        const { pageSize = 100, page = 1, ...extra } = options;
        const params = compactObject({
            top: pageSize,
            $top: pageSize,
            skip: (page - 1) * pageSize,
            $skip: (page - 1) * pageSize,
            count: true,
            $count: true,
            ...extra,
        });

        return this.query<XMartContent[]>(endpoint, table, params).map(response => ({
            objects: response.value,
            pager: { pageSize, page, total: response["@odata.count"] },
        }));
    }

    public listAll(endpoint: XMartEndpoint, table: string, options: ListAllOptions = {}): FutureData<XMartContent[]> {
        return this.list(endpoint, table, options).flatMap(response => {
            const { objects, pager } = response;
            if (pager.total <= pager.pageSize) return Future.success(objects);

            const maxPage = Math.ceil(pager.total / pager.pageSize) + 1;
            const futures = _.range(2, maxPage).map(page =>
                this.list(endpoint, table, { ...options, page, pageSize: pager.pageSize })
            );

            return Future.parallel(futures, { maxConcurrency: 5 }).map(arrays =>
                _.flatten([objects, ...arrays.map(({ objects }) => objects)])
            );
        });
    }

    public count(endpoint: XMartEndpoint, table: string): FutureData<number> {
        return futureFetch<number>("get", endpoint, `/${table}/$count`, { textResponse: true }).map(
            ({ value }) => value
        );
    }

    private query<Data>(
        endpoint: XMartEndpoint,
        table: string,
        params: Record<string, string | number | boolean>
    ): FutureData<ODataResponse<Data>> {
        const qs = buildParams(params);
        //todo fix pagination
        return futureFetch("get", endpoint, `/${table}?${qs}`);
    }
}

function futureFetch<Data>(
    method: "get" | "post",
    endpoint: XMartEndpoint,
    path: string,
    options: { body?: string; textResponse?: boolean } = {}
): FutureData<ODataResponse<Data>> {
    const { body, textResponse = false } = options;
    const controller = new AbortController();
    const url = XMartEndpoints[endpoint];

    return Future.fromComputation((resolve, reject) => {
        fetch(url + path, {
            signal: controller.signal,
            method,
            headers: { "Content-Type": "application/json", "x-requested-with": "XMLHttpRequest" },
            body,
        })
            .then(async response => {
                if (textResponse) {
                    const text = await response.text();
                    resolve({ value: text as unknown as Data });
                } else {
                    const json = await response.json();
                    resolve(json);
                }
            })
            .catch(err => reject(err ? err.message : "Unknown error"));
        return controller.abort;
    });
}

const specialParams = ["select", "expand", "apply", "filter", "orderBy"];

function buildParams(params: Record<string, string | number | boolean>) {
    return _.map(params, (value, key) => `${specialParams.includes(key) ? "$" : ""}${key}=${value}`).join("&");
}

function compactObject<Obj extends object>(object: Obj) {
    return _.pickBy(object, _.identity);
}

type ODataResponse<Data> = { value: Data;[key: string]: any };
