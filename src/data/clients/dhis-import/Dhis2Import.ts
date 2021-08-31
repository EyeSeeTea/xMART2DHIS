import _ from "lodash";
import { SyncResult, SyncStats, SyncStatus } from "../../../domain/entities/SyncResult";

type Status = "OK" | "ERROR" | "SUCCESS" | "ERROR" | "WARNING";

export interface ImportPostResponse {
    status: Status;
    message?: string;
    response?: {
        status: SyncStatus;
        imported: number;
        updated: number;
        deleted: number;
        ignored: number;
        total: number;
        importSummaries?: Array<{
            responseType: "ImportSummary";
            description?: string;
            status: SyncStatus;
            importCount: {
                imported: number;
                updated: number;
                deleted: number;
                ignored: number;
            };
            reference?: string;
            conflicts?: {
                object: string;
                value: string;
            }[];
            // Only for TEI import
            enrollments?: ImportPostResponse["response"];
        }>;
    };
}

function processImportResponse(options: {
    title: string;
    model: string;
    importResult: ImportPostResponse;
    splitStatsList: boolean;
}): SyncResult {
    const { title, model, importResult, splitStatsList } = options;
    const { message, response } = importResult;
    const status = response ? response.status : "ERROR";

    if (!response) return { title, status, message, rawResponse: importResult };

    // Add inner import summaries
    const importSummaries = _(response.importSummaries)
        .flatMap(importSummary => [importSummary, ...(importSummary.enrollments?.importSummaries || [])])
        .value();

    const aggregatedStatus =
        _(importSummaries)
            .map(summary => summary.status)
            .find(status => status !== "SUCCESS") || status;

    const errors =
        _.flatMap(
            importSummaries,
            ({ reference = "-", description, conflicts }) =>
                conflicts?.map(({ object, value }) => ({
                    id: reference,
                    message: _([description, object, value]).compact().join(" "),
                })) ?? (description ? [{ id: reference, message: description }] : [])
        ) ?? [];

    const fields = ["imported", "updated", "ignored", "deleted", "total"] as const;
    const totalStats: SyncStats = { type: "TOTAL", ..._.pick(response, fields) };

    const eventStatsList = (response.importSummaries || []).map((importSummary): SyncStats => {
        return {
            type: `${model} ${importSummary.reference || "-"}`,
            ...importSummary.importCount,
        };
    });

    const stats = splitStatsList
        ? _.compact([eventStatsList.length === 1 ? null : totalStats, ...eventStatsList])
        : [totalStats];

    return { title, status: aggregatedStatus, message, errors, stats, rawResponse: importResult };
}

export function postImport(
    response: ImportPostResponse,
    options: { title: string; model: string; splitStatsList: boolean }
): SyncResult {
    const { title, model, splitStatsList } = options;
    try {
        return processImportResponse({
            title,
            model: model,
            importResult: response,
            splitStatsList,
        });
    } catch (error) {
        if (error?.response?.data) {
            return processImportResponse({
                title,
                model: model,
                importResult: error.response.data,
                splitStatsList,
            });
        } else {
            return { title: model, status: "NETWORK ERROR", rawResponse: {} };
        }
    }
}
