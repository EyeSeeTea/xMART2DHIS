import AbortController from "abort-controller";
import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { XMartContent, XMartResponse, XMartTable } from "../../domain/entities/XMart";
import { ListAllOptions, ListOptions, XMartRepository } from "../../domain/repositories/XMartRepository";

const BASE_URL = "https://frontdoor-r5quteqglawbs.azurefd.net";
const MART = `VECTORS_IR`;

export class XMartDefaultRepository implements XMartRepository {
    public listTables(): FutureData<XMartTable[]> {
        return futureFetch<XMartTable[]>("get", MART).map(({ value: tables }) =>
            tables.map(({ name, kind }) => ({ name, kind }))
        );
    }

    public list(table: string, options: ListOptions = {}): FutureData<XMartResponse> {
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

        return this.query<XMartContent[]>(table, params).map(response => ({
            objects: response.value,
            pager: { pageSize, page, total: response["@odata.count"] },
        }));
    }

    public listAll(table: string, options: ListAllOptions = {}): FutureData<XMartContent[]> {
        return this.list(table, options).flatMap(response => {
            const { objects, pager } = response;
            if (pager.total <= pager.pageSize) return Future.success(objects);

            const maxPage = Math.ceil(pager.total / pager.pageSize) + 1;
            const futures = _.range(2, maxPage).map(page =>
                this.list(table, { ...options, page, pageSize: pager.pageSize })
            );

            return Future.parallel(futures, { maxConcurrency: 5 }).map(arrays =>
                _.flatten([objects, ...arrays.map(({ objects }) => objects)])
            );
        });
    }

    public count(table: string): FutureData<number> {
        return futureFetch<number>("get", `${MART}/${table}/$count`, { textResponse: true }).map(({ value }) => value);
    }

    private query<Data>(
        table: string,
        params: Record<string, string | number | boolean>
    ): FutureData<ODataResponse<Data>> {
        const qs = buildParams(params);
        return futureFetch("get", `${MART}/${table}?${qs}`);
    }
}

function futureFetch<Data>(
    method: "get" | "post",
    path: string,
    options: { body?: string; textResponse?: boolean } = {}
): FutureData<ODataResponse<Data>> {
    const { body, textResponse = false } = options;
    const controller = new AbortController();

    return Future.fromComputation((resolve, reject) => {
        fetch(`${BASE_URL}/${path}`, {
            signal: controller.signal,
            method,
            headers: { "Content-Type": "application/json" },
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

function buildParams(params: Record<string, string | number | boolean>) {
    return _.map(params, (value, key) => `$${key}=${value}`).join("&");
}

function compactObject<Obj extends object>(object: Obj) {
    return _.pickBy(object, _.identity);
}

type ODataResponse<Data> = { value: Data; [key: string]: any };
