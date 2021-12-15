import { DataSyncPeriod } from "../entities/metadata/DataSyncPeriod";
import { FutureData } from "../entities/Future";
import { ProgramEvent } from "../entities/data/ProgramEvent";
import { SyncResult } from "../entities/data/SyncResult";

export interface EventsRepository {
    save(events: ProgramEvent[], params?: SaveEventsParams): FutureData<SyncResult>;
    get(filters: GetEventsFilters): FutureData<ProgramEvent[]>;
}

export type SaveEventsParams = {
    idScheme?: "UID" | "CODE";
    dataElementIdScheme?: "UID" | "CODE";
    orgUnitIdScheme?: "UID" | "CODE";
    eventIdScheme?: "UID" | "CODE";
    dryRun?: boolean;
};

export type GetEventsFilters = {
    orgUnitPaths?: string[];
    programIds: string[];
    period?: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
};
