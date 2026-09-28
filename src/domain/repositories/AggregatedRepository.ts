import { DataSyncPeriod } from "../entities/metadata/DataSyncPeriod";
import { DataValueSet } from "../entities/data/DataValue";
import { FutureData } from "../entities/Future";

export interface AggregatedRepository {
    get(filters: GetAggregatedFilters): FutureData<DataValueSet>;
}

export type GetAggregatedFilters = {
    orgUnitPaths?: string[];
    dataSetIds: string[];
    period?: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
};
