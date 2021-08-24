import { FutureData } from "../entities/Future";
import { ProgramEvent } from "../entities/ProgramEvent";
import { SynchronizationResult } from "../entities/SynchronizationResult";
import { User } from "../entities/User";

export interface InstanceRepository {
    getBaseUrl(): string;
    getCurrentUser(): FutureData<User>;
    getInstanceVersion(): FutureData<string>;
    postEvents(events: ProgramEvent[]): FutureData<SynchronizationResult>;
    mapCategoryOptionCombo(key: string | undefined): string | undefined;
}
