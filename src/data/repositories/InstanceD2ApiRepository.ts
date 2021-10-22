import { FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/Instance";
import { User } from "../../domain/entities/User";
import { AggregatedRepository } from "../../domain/repositories/AggregatedRepository";
import { EventsRepository } from "../../domain/repositories/EventsRepository";
import { InstanceRepository } from "../../domain/repositories/InstanceRepository";
import { MetadataRepository } from "../../domain/repositories/MetadataRepository";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";
import { StorageDataStoreRepository } from "./StorageDataStoreRepository";
import { StorageRepository } from "../../domain/repositories/StorageRepository";
import { AggregatedD2ApiRepository } from "./AggregatedD2ApiRepository";
import { EventsD2ApiRepository } from "./EventsD2ApiRepository";
import { MetadataD2ApiRepository } from "./MetadataD2ApiRepository";

export class InstanceD2ApiRepository implements InstanceRepository {
    private api: D2Api;

    public metadata: MetadataRepository;
    public events: EventsRepository;
    public aggregated: AggregatedRepository;
    public dataStore: StorageRepository;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
        this.metadata = new MetadataD2ApiRepository(instance);
        this.events = new EventsD2ApiRepository(instance);
        this.aggregated = new AggregatedD2ApiRepository(instance);
        this.dataStore = new StorageDataStoreRepository("global", instance);
    }

    public getBaseUrl(): string {
        return this.api.baseUrl;
    }

    @cache()
    public getCurrentUser(): FutureData<User> {
        return apiToFuture(
            this.api.currentUser.get({
                fields: {
                    id: true,
                    displayName: true,
                    userGroups: { id: true, name: true },
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true, authorities: true },
                    },
                },
            })
        ).map(user => ({
            id: user.id,
            name: user.displayName,
            userGroups: user.userGroups,
            ...user.userCredentials,
        }));
    }

    @cache()
    public getInstanceVersion(): FutureData<string> {
        return apiToFuture(this.api.system.info).map(({ version }) => version);
    }
}
