import { StorageRepository } from "./StorageRepository";
import { FutureData } from "../entities/Future";
import { User } from "../entities/User";
import { UserSearch } from "../entities/SearchUser";
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
    searchUsers(query: string): Promise<UserSearch>;

}
