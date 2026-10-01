import { DataSyncPeriod } from "../entities/metadata/DataSyncPeriod";
import { FutureData } from "../entities/Future";
import { ProgramEvent } from "../entities/data/ProgramEvent";

export interface EventsRepository {
    get(filters: GetEventsFilters): FutureData<ProgramEvent[]>;
}

export type GetEventsFilters = {
    orgUnitPaths?: string[];
    programIds: string[];
    period?: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
};
