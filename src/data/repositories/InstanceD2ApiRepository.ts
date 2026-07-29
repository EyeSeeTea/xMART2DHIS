import { FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/instance/Instance";
import { User } from "../../domain/entities/metadata/User";
import { AggregatedRepository } from "../../domain/repositories/AggregatedRepository";
import { EventsRepository } from "../../domain/repositories/EventsRepository";
import { InstanceRepository } from "../../domain/repositories/InstanceRepository";
import { MetadataRepository } from "../../domain/repositories/MetadataRepository";
import { D2Api, D2UserSchema, SelectedPick } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";
import { StorageDataStoreRepository } from "./StorageDataStoreRepository";
import { StorageRepository } from "../../domain/repositories/StorageRepository";
import { AggregatedD2ApiRepository } from "./AggregatedD2ApiRepository";
import { EventsD2ApiRepository } from "./EventsD2ApiRepository";
import { MetadataD2ApiRepository } from "./MetadataD2ApiRepository";
import { UserSearch } from "../../domain/entities/SearchUser";

import _ from "lodash";

export class InstanceD2ApiRepository implements InstanceRepository {
    private api: D2Api;

    public metadata: MetadataRepository;
    public events: EventsRepository;
    public aggregated: AggregatedRepository;
    public dataStore: StorageRepository;

    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(instance);
        this.metadata = new MetadataD2ApiRepository(instance);
        this.events = new EventsD2ApiRepository(instance);
        this.aggregated = new AggregatedD2ApiRepository(instance);
        this.dataStore = new StorageDataStoreRepository("global", instance);
    }

    public getInstance(): Instance {
        return this.instance;
    }

    public getBaseUrl(): string {
        return this.api.baseUrl;
    }

    public isAdmin(user: User): boolean {
        return _.flatMap(user.userRoles, ({ authorities }) => authorities).includes("ALL");
    }

    public async searchUsers(query: string): Promise<UserSearch> {
        const options = { fields: searchFields, filter: { displayName: { ilike: query } } };
        return this.api.metadata.get({ users: options, userGroups: options }).getData();
    }

    @cache()
    public getCurrentUser(): FutureData<User> {
        return apiToFuture(this.api.currentUser.get({ fields: userFields })).map(user => this.mapUser(user));
    }

    @cache()
    public getInstanceVersion(): FutureData<string> {
        return apiToFuture(this.api.system.info).map(({ version }) => version);
    }
    private mapUser(user: D2ApiUser): User {
        return {
            id: user.id,
            name: user.displayName,
            username: user.username,
            userRoles: user.userRoles,
            userGroups: user.userGroups,
        };
    }
}

const userFields = {
    id: true,
    displayName: true,
    username: true,
    userRoles: { id: true, name: true, authorities: true },
    userGroups: { id: true, name: true },
} as const;

const searchFields = { id: true, name: true } as const;

type D2ApiUser = SelectedPick<D2UserSchema, typeof userFields>;
