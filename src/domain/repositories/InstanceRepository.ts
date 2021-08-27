import { FutureData } from "../entities/Future";
import { ProgramEvent } from "../entities/ProgramEvent";
import { SyncResult } from "../entities/SyncResult";
import { User } from "../entities/User";

export interface InstanceRepository {
    getBaseUrl(): string;
    getCurrentUser(): FutureData<User>;
    getInstanceVersion(): FutureData<string>;
    postEvents(events: ProgramEvent[], params?: PostEventsParams): FutureData<SyncResult>;
}

export type PostEventsParams = {
    idScheme?: "UID" | "CODE";
    dataElementIdScheme?: "UID" | "CODE";
    orgUnitIdScheme?: "UID" | "CODE";
    eventIdScheme?: "UID" | "CODE";
    dryRun?: boolean;
};
