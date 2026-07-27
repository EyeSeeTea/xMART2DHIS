import _ from "lodash";
import { SyncResult, SyncStats, SyncStatus } from "../../domain/entities/data/SyncResult";
import { TrackerPostResponse } from "../../types/d2-api";

type TrackerStats = TrackerPostResponse["stats"];

const syncStatusByTrackerStatus: Readonly<Record<TrackerPostResponse["status"], SyncStatus>> = {
    OK: "SUCCESS",
    WARNING: "WARNING",
    ERROR: "ERROR",
};

/* The tracker importer reports created/updated/deleted/ignored, while SyncStats speaks of imported. */
function toSyncStats(type: string, { created, updated, deleted, ignored, total }: TrackerStats): SyncStats {
    return { type, imported: created, updated, deleted, ignored, total };
}

function isEmpty({ imported, updated, deleted, ignored }: SyncStats): boolean {
    return imported === 0 && updated === 0 && deleted === 0 && ignored === 0;
}

export function postTrackerImport(response: TrackerPostResponse, options: { title: string }): SyncResult {
    const { title } = options;
    const { status, message, stats, validationReport, bundleReport } = response;

    const errors = _([...(validationReport?.errorReports ?? []), ...(validationReport?.warningReports ?? [])])
        .map(({ uid, errorCode, message }) => ({ id: uid, message: _([errorCode, message]).compact().join(" ") }))
        .value();

    const statsByType = _(bundleReport?.typeReportMap)
        .values()
        .map(({ trackerType, stats }) => toSyncStats(trackerType, stats))
        .reject(isEmpty)
        .value();

    return {
        title,
        status: syncStatusByTrackerStatus[status],
        message,
        errors,
        stats: [toSyncStats("TOTAL", stats), ...statsByType],
        rawResponse: response,
    };
}
