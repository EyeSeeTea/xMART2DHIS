import AbortController from "abort-controller";
import _ from "lodash";
import queryString from "query-string";
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
import i18n from "../../utils/i18n";
import { timeout } from "../../utils/futures";
import { joinUrl } from "../../utils/url";
import { Constants } from "../Constants";
import { PipelineCodes } from "../utils/pipelines/PipelineCodes";

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

    public loadData(mart: DataMart, table: string, rows: ReadonlyArray<unknown>): FutureData<number> {
        const file: PipelineFile = { name: `${table}.json`, content: JSON.stringify(rows) };
        return this.startPipeline(mart, PipelineCodes.loadData, { table }, file);
    }

    public runPipeline(
        mart: DataMart,
        pipeline: string,
        params: Record<string, string | number | boolean>
    ): FutureData<number> {
        return this.startPipeline(mart, pipeline, params);
    }

    /* Starts the pipeline, with the file in the request body when there is one, and waits for its batch. */
    private startPipeline(
        mart: DataMart,
        pipeline: string,
        params: Record<string, string | number | boolean>,
        file?: PipelineFile
    ): FutureData<number> {
        const { martCode, environment } = mart;
        const startParams = queryString.stringify({
            martCode,
            originCode: pipeline,
            comment: `[xMART2DHIS] Automated run of ${pipeline} in ${martCode}`,
            ...params,
        });

        return Future.joinObj({
            endpoint: this.getAPIEndpoint(environment),
            token: this.getAPIToken(environment),
        })
            .flatMap(({ endpoint, token }) => {
                const url = joinUrl(endpoint, `/origin/start`) + "?" + startParams;
                const body = file ? toFormData(file) : undefined;
                return futureFetch<XMartAPIBatchStartResponse>("post", url, { body, bearer: token });
            })
            .flatMap(response => {
                const { BatchID, ErrorMessage } = response;

                if (ErrorMessage) {
                    return Future.error(ErrorMessage);
                } else if (BatchID === null) {
                    return Future.error("Unknown batch id");
                }

                return this.getBatchStatusPolling(mart, BatchID).flatMap(checkBatchSucceeded);
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
                return Future.success("https://extranet.who.int/xmart4/api");
            case "UAT":
                return Future.success("https://portal-uat.who.int/xmart4/api");
            default:
                return Future.error("Unknown data mart type");
        }
    }

    private getAPIEndpoint(environment: DataMartEnvironment): FutureData<string> {
        switch (environment) {
            case "PROD":
                return Future.success("https://extranet.who.int/xmart4/external");
            case "UAT":
                return Future.success("https://portal-uat.who.int/xmart4/external");
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
        interval = 1000
    ): FutureData<XMartAPICompletedBatchStatus> {
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
                if (response.ProcessStepCode === "COMPLETED") {
                    return Future.success<XMartAPICompletedBatchStatus, string>(response);
                }

                return timeout(interval).flatMap(() => this.getBatchStatusPolling(mart, batch, interval));
            });
    }
}

/* xMART reports a finished batch as COMPLETED; only a SUCCESS result means the load was done. */
function checkBatchSucceeded(status: XMartAPICompletedBatchStatus): FutureData<number> {
    if (status.ProcessResultCode !== "SUCCESS") {
        return Future.error(
            i18n.t("xMART batch {{batchId}} finished with {{result}}: {{title}}", {
                nsSeparator: false,
                batchId: status.BatchID,
                result: status.ProcessResultCode,
                title: status.ProcessResultTitle,
            })
        );
    }

    return Future.success(status.BatchID);
}

function buildParams(params?: Record<string, string | number | boolean>): string | undefined {
    if (!params) return undefined;
    return _.map(params, (value, key) => `$${key}=${value}`).join("&");
}

function toFormData(file: PipelineFile): FormData {
    const formData = new FormData();
    formData.append("file", new Blob([file.content], { type: "application/json" }), file.name);
    return formData;
}

function compactObject<Obj extends object>(object: Obj) {
    return _.pickBy(object, _.identity);
}

function futureFetch<Data>(
    method: "get" | "post",
    path: string,
    options: {
        body?: string | FormData;
        textResponse?: boolean;
        params?: Record<string, string | number | boolean>;
        bearer?: string;
        corsProxy?: boolean;
    } = {}
): FutureData<Data> {
    const { body, textResponse = false, params, bearer, corsProxy = import.meta.env.DEV } = options;
    const controller = new AbortController();
    const qs = buildParams(params);
    const url = `${path}${qs ? `?${qs}` : ""}`;
    const fetchUrl = corsProxy ? addCORSProxy(url) : url;

    return Future.fromComputation<string, Data>((resolve, reject) => {
        fetch(fetchUrl, {
            // Evita conflicto entre AbortSignal (DOM vs @types/node) al compilar.
            signal: controller.signal as unknown as AbortSignal,
            method,
            headers: {
                // With FormData, the browser sets multipart/form-data and its boundary
                ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
                "x-requested-with": "XMLHttpRequest",
                Authorization: bearer ? `Bearer ${bearer}` : "",
            },
            body,
        })
            .then(async response => {
                if (!response.ok) {
                    reject(
                        i18n.t(`API error code: {{statusText}} ({{status}})`, {
                            nsSeparator: false,
                            statusText: response.statusText,
                            status: response.status,
                        })
                    );
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
    }).flatMapError(err => {
        if (corsProxy) return Future.error(err);
        return futureFetch<Data>(method, path, { ...options, corsProxy: true });
    });
}

type ODataResponse<Data> = { value: Data; [key: string]: any };

/* A file sent to an xMART pipeline in the request that starts its run. */
type PipelineFile = Readonly<{ name: string; content: string }>;

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

type XMartAPICompletedBatchStatus = Extract<XMartAPIBatchStatusResponse, { ProcessStepCode: "COMPLETED" }>;

function addCORSProxy(url: string): string {
    return url.replace(/^(.*?:\/\/)(.*)/, "$1dev.eyeseetea.com/cors/$2");
}
