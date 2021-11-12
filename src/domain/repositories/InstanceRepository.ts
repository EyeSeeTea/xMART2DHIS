import { StorageRepository } from "./StorageRepository";
import { FutureData } from "../entities/Future";
import { User } from "../entities/User";
import { AggregatedRepository } from "./AggregatedRepository";
import { EventsRepository } from "./EventsRepository";
import { MetadataRepository } from "./MetadataRepository";
import { Instance } from "../entities/Instance";

export interface InstanceRepository {
    metadata: MetadataRepository;
    events: EventsRepository;
    aggregated: AggregatedRepository;
    dataStore: StorageRepository;

    getInstance(): Instance;
    getBaseUrl(): string;
    getCurrentUser(): FutureData<User>;
    getInstanceVersion(): FutureData<string>;
    isAdmin(user: User): boolean;
}
