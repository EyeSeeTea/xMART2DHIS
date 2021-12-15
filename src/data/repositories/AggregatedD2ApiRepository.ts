import { DataValue } from "../../domain/entities/data/DataValue";
import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/instance/Instance";
import { SyncResult } from "../../domain/entities/data/SyncResult";
import {
    AggregatedRepository,
    GetAggregatedFilters,
    SaveAggregatedParams,
} from "../../domain/repositories/AggregatedRepository";
import { buildPeriodFromParams, cleanOrgUnitPaths } from "../../domain/utils";
import i18n from "../../locales";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";

export class AggregatedD2ApiRepository implements AggregatedRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public save(dataValues: DataValue[], params: SaveAggregatedParams): FutureData<SyncResult> {
        return apiToFuture(this.api.dataValues.postSetAsync(params, { dataValues })).flatMap(({ response }) =>
            apiToFuture(this.api.system.waitFor(response.jobType, response.id)).flatMap(importSummary => {
                if (!importSummary) return Future.error("Unknown error saving data values");

                const { status, description, conflicts, importCount } = importSummary;
                const { imported, deleted, updated, ignored } = importCount;
                const errors = conflicts?.map(({ object, value }) => ({ id: object, message: value })) ?? [];

                return Future.success({
                    title: i18n.t("Data values - Create/update"),
                    status,
                    message: description,
                    stats: [{ imported, deleted, updated, ignored }],
                    errors,
                    rawResponse: importSummary,
                });
            })
        );
    }

    public get(filters: GetAggregatedFilters): FutureData<DataValue[]> {
        const { orgUnitPaths = [], dataSetIds = [], period = "ALL", startDate, endDate } = filters;
        if (dataSetIds.length === 0) return Future.success([]);

        const { startDate: start, endDate: end } = buildPeriodFromParams({ period, startDate, endDate });

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0) return Future.success([]);

        return apiToFuture(
            this.api.dataValues
                .getSet({
                    dataSet: dataSetIds,
                    orgUnit: orgUnits,
                    startDate: start.format("YYYY-MM-DD"),
                    endDate: end.format("YYYY-MM-DD"),
                })
                .map(response => response.data.dataValues)
        );
    }
}
