import AbortController from "abort-controller";
import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import {
    DataMart,
    DataMartEnvironment,
    MartTable,
    XMartContent,
    XMartResponse,
} from "../../domain/entities/xmart/DataMart";
import { AzureRepository } from "../../domain/repositories/AzureRepository";
import {
    ListAllOptions,
    ListXMartOptions,
    MartSuggestions,
    XMartRepository,
} from "../../domain/repositories/XMartRepository";
import i18n from "../../locales";
import { timeout } from "../../utils/futures";
import { joinUrl } from "../../utils/url";
import { Constants } from "../Constants";

export class XMartDefaultRepository implements XMartRepository {
    constructor(private azureRepository: AzureRepository) {}

    public listMartSuggestions(): FutureData<MartSuggestions> {
        const getSuggestions = (environment: DataMartEnvironment) =>
            Future.joinObj({
                endpoint: this.getInternalAPIEndpoint(environment),
                token: this.getAPIToken(environment),
            }).flatMap(({ endpoint, token }) =>
                futureFetch<{ CODE: string; TITLE: string }[]>("post", `${endpoint}/mart`, {
                    body: "{}",
                    bearer: token,
                })
                    .flatMapError(error => {
                        console.error(error);
                        return Future.success<{ CODE: string; TITLE: string }[], string>([]);
                    })
                    .map(marts => marts.map(({ CODE, TITLE }) => ({ value: CODE, label: TITLE })))
            );

        return Future.joinObj({
            PROD: getSuggestions("PROD"),
            UAT: getSuggestions("UAT"),
        });
    }

    public listTables(mart: DataMart): FutureData<MartTable[]> {
        return this.requestMart<MartTable[]>("get", mart, "").map(({ value: tables }) =>
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

        return this.requestMart<XMartContent[]>("get", mart, table, { params }).map(response => ({
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
        return this.requestMart<number>("get", mart, `/${table}/$count`, { textResponse: true }).map(
            ({ value }) => value
        );
    }

    public runPipeline(
        mart: DataMart,
        pipeline: string,
        params: Record<string, string | number | boolean>
    ): FutureData<number> {
        const { martCode, environment } = mart;
        const body = JSON.stringify(
            {
                martCode,
                originCode: pipeline,
                inputValues: params,
                comment: `[xMART2DHIS] Automated run of ${pipeline} in ${martCode}`,
            },
            null,
            4
        );

        return Future.joinObj({
            endpoint: this.getAPIEndpoint(environment),
            token: this.getAPIToken(environment),
        })
            .flatMap(({ endpoint, token }) =>
                futureFetch<XMartAPIBatchStartResponse>("post", joinUrl(endpoint, `/origin/start`), {
                    body,
                    bearer: token,
                })
            )
            .flatMap(response => {
                const { BatchID, ErrorMessage } = response;

                if (ErrorMessage) {
                    return Future.error(ErrorMessage);
                } else if (BatchID === null) {
                    return Future.error("Unknown batch id");
                }

                return this.getBatchStatusPolling(mart, BatchID).map(({ BatchID }) => BatchID);
            });
    }

    private requestMart<Data>(
        method: "get" | "post",
        mart: DataMart,
        path: string,
        options: { body?: string; textResponse?: boolean; params?: Record<string, string | number | boolean> } = {}
    ): FutureData<ODataResponse<Data>> {
        const url = joinUrl(mart.dataEndpoint, path);
        return this.getODataToken(mart.environment).flatMap(token =>
            futureFetch<ODataResponse<Data>>(method, url, { ...options, bearer: token })
        );
    }

    private getInternalAPIEndpoint(environment: DataMartEnvironment): FutureData<string> {
        switch (environment) {
            case "PROD":
                return Future.success("https://dev.eyeseetea.com/cors/extranet.who.int/xmart4/api");
            case "UAT":
                return Future.success("https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart4/api");
            default:
                return Future.error("Unknown data mart type");
        }
    }

    private getAPIEndpoint(environment: DataMartEnvironment): FutureData<string> {
        switch (environment) {
            case "PROD":
                return Future.success("https://dev.eyeseetea.com/cors/extranet.who.int/xmart4/external");
            case "UAT":
                return Future.success("https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart4/external");
            default:
                return Future.error("Unknown data mart type");
        }
    }

    private getODataToken(environment: DataMartEnvironment): FutureData<string | undefined> {
        switch (environment) {
            case "PROD":
                return this.azureRepository.getToken(Constants.XMART_ODATA_PROD_SCOPE);
            case "UAT":
                return this.azureRepository.getToken(Constants.XMART_ODATA_UAT_SCOPE);
            default:
                return Future.success(undefined);
        }
    }

    private getAPIToken(environment: DataMartEnvironment): FutureData<string | undefined> {
        switch (environment) {
            case "PROD":
                return this.azureRepository.getToken(Constants.XMART_API_PROD_SCOPE);
            case "UAT":
                return this.azureRepository.getToken(Constants.XMART_API_UAT_SCOPE);
            default:
                return Future.error(i18n.t("Unable to call xMART API for public data marts"));
        }
    }

    private getBatchStatusPolling(
        mart: DataMart,
        batch: number,
        options: { interval?: number; maxRetries?: number; currentRetry?: number } = {}
    ): FutureData<XMartAPIBatchStatusResponse> {
        const { interval = 1000, maxRetries, currentRetry = 0 } = options;

        return Future.joinObj({
            endpoint: this.getAPIEndpoint(mart.environment),
            token: this.getAPIToken(mart.environment),
        })
            .flatMap(({ endpoint, token }) =>
                futureFetch<XMartAPIBatchStatusResponse>("get", joinUrl(endpoint, `/batch/${batch}/status`), {
                    bearer: token,
                })
            )
            .flatMap(response => {
                const hasFinished = response.ProcessStepCode === "COMPLETED";
                const hasReachedMaxRetries = maxRetries !== undefined && currentRetry > maxRetries;
                if (hasFinished || hasReachedMaxRetries) {
                    return Future.success(response);
                }

                return timeout(interval).flatMap(() =>
                    this.getBatchStatusPolling(mart, batch, {
                        interval,
                        maxRetries,
                        currentRetry: currentRetry + 1,
                    })
                );
            });
    }
}

function buildParams(params?: Record<string, string | number | boolean>): string | undefined {
    if (!params) return undefined;
    return _.map(params, (value, key) => `$${key}=${value}`).join("&");
}

function compactObject<Obj extends object>(object: Obj) {
    return _.pickBy(object, _.identity);
}

function futureFetch<Data>(
    method: "get" | "post",
    path: string,
    options: {
        body?: string;
        textResponse?: boolean;
        params?: Record<string, string | number | boolean>;
        bearer?: string;
    } = {}
): FutureData<Data> {
    const { body, textResponse = false, params, bearer } = options;
    const controller = new AbortController();
    const qs = buildParams(params);
    const url = `${path}${qs ? `?${qs}` : ""}`;

    return Future.fromComputation((resolve, reject) => {
        fetch(url, {
            signal: controller.signal,
            method,
            headers: {
                "Content-Type": "application/json",
                "x-requested-with": "XMLHttpRequest",
                Authorization: bearer ? `Bearer ${bearer}` : "",
            },
            body,
        })
            .then(async response => {
                if (!response.ok) {
                    reject("Fetch request failed");
                } else if (textResponse) {
                    const text = await response.text();
                    resolve(text as unknown as Data);
                } else {
                    const json = await response.json();
                    resolve(json);
                }
            })
            .catch(err => reject(err ? err.message : "Unknown error"));

        return controller.abort;
    });
}

type ODataResponse<Data> = { value: Data; [key: string]: any };

type XMartAPIBatchStartResponse = { BatchID: number; Success?: boolean; ErrorMessage: string | null };

type XMartAPIBatchStatusResponse = XMartAPIBatchStatusResponseStatus & {
    BatchID: number;
    MartCode: string;
    OriginCode: string;
    PipelineCode: string;
    OriginTitle: string;
    ProcessStepTitle: string;
    ProcessResultTitle: string;
};

type XMartAPIBatchStatusResponseStatus =
    | {
          ProcessStepCode:
              | "NONE"
              | "INITIATING"
              | "STAGING"
              | "PREVIEWING"
              | "APPROVING"
              | "COMMIT_QUEUING"
              | "COMMITTING"
              | "FINALIZING"
              | "STAGE_QUEUING";
          ProcessResultCode: never;
      }
    | {
          ProcessStepCode: "COMPLETED";
          ProcessResultCode: "SYSTEM_ERROR" | "REJECTED" | "INVALID" | "SUCCESS" | "CANCELED" | "TIMEOUT_CANCELED";
      };
