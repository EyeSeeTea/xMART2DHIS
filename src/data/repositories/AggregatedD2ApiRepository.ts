import { DataValue } from "../../domain/entities/DataValue";
import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/Instance";
import { SyncResult } from "../../domain/entities/SyncResult";
import {
    AggregatedRepository,
    GetAggregatedFilters,
    SaveAggregatedParams,
} from "../../domain/repositories/AggregatedRepository";
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

    public get(_filters: GetAggregatedFilters): FutureData<DataValue[]> {
        throw new Error("Method not implemented.");
    }
}