import { DataSyncPeriod } from "../entities/DataSyncPeriod";
import { FutureData } from "../entities/Future";
import { TrackedEntityInstance } from "../entities/TrackedEntityInstance";

export interface TEIRepository {
    get(filters: getTEIsFilters): FutureData<TrackedEntityInstance[]>;
}

export type getTEIsFilters = {
    orgUnitPaths: string[];
    programIds: string[];
    period: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
};
