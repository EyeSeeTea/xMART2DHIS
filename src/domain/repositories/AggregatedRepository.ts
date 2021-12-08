import { DataSyncPeriod } from "../entities/metadata/DataSyncPeriod";
import { DataValue } from "../entities/data/DataValue";
import { FutureData } from "../entities/Future";
import { SyncResult } from "../entities/data/SyncResult";

export interface AggregatedRepository {
    save(dataValues: DataValue[], params: SaveAggregatedParams): FutureData<SyncResult>;
    get(filters: GetAggregatedFilters): FutureData<DataValue[]>;
}

export type SaveAggregatedParams = {
    idScheme?: "UID" | "CODE";
    dataElementIdScheme?: "UID" | "CODE";
    orgUnitIdScheme?: "UID" | "CODE";
    eventIdScheme?: "UID" | "CODE";
    dryRun?: boolean;
};

export type GetAggregatedFilters = {
    orgUnitPaths?: string[];
    dataSetIds: string[];
    period?: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
};
