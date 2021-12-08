import { StorageRepository } from "./StorageRepository";
import { FutureData } from "../entities/Future";
import { UserSearch } from "../entities/SearchUser";
import { User } from "../entities/metadata/User";
import { AggregatedRepository } from "./AggregatedRepository";
import { EventsRepository } from "./EventsRepository";
import { MetadataRepository } from "./MetadataRepository";
import { Instance } from "../entities/instance/Instance";

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
    searchUsers(query: string): Promise<UserSearch>;
}
