import { FutureData } from "../entities/Future";
import { User } from "../entities/User";
import { AggregatedRepository } from "./AggregatedRepository";
import { EventsRepository } from "./EventsRepository";
import { MetadataRepository } from "./MetadataRepository";

export interface InstanceRepository {
    metadata: MetadataRepository;
    events: EventsRepository;
    aggregated: AggregatedRepository;

    getBaseUrl(): string;
    getCurrentUser(): FutureData<User>;
    getInstanceVersion(): FutureData<string>;
}
