import { DataValueSet } from "../../domain/entities/data/DataValue";
import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/instance/Instance";
import { AggregatedRepository, GetAggregatedFilters } from "../../domain/repositories/AggregatedRepository";
import { buildPeriodFromParams, cleanOrgUnitPaths } from "../../domain/utils";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";

export class AggregatedD2ApiRepository implements AggregatedRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public get(filters: GetAggregatedFilters): FutureData<DataValueSet> {
        const { orgUnitPaths = [], dataSetIds = [], period = "ALL", startDate, endDate } = filters;
        if (dataSetIds.length === 0) return Future.success({ dataValues: [] });

        const { startDate: start, endDate: end } = buildPeriodFromParams({ period, startDate, endDate });

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0) return Future.success({ dataValues: [] });

        return apiToFuture(
            this.api.dataValues.getSet({
                dataSet: dataSetIds,
                orgUnit: orgUnits,
                startDate: start.format("YYYY-MM-DD"),
                endDate: end.format("YYYY-MM-DD"),
            })
        ).map(dataValuesSet =>
            filters.dataSetIds.length === 1 && !dataValuesSet.dataSet
                ? { ...dataValuesSet, dataSet: filters.dataSetIds[0] }
                : dataValuesSet
        );
    }
}
