import { D2UserSchema, SelectedPick } from "@eyeseetea/d2-api/2.34";
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
        const options = { fields, filter: { displayName: { ilike: query } } };
        return this.api.metadata.get({ users: options, userGroups: options }).getData();
    }

    @cache()
    public getCurrentUser(): FutureData<User> {
        return apiToFuture(this.api.currentUser.get({ fields })).map(user => this.mapUser(user));
    }

    @cache()
    public getInstanceVersion(): FutureData<string> {
        return apiToFuture(this.api.system.info).map(({ version }) => version);
    }
    private mapUser(user: D2ApiUser): User {
        const { userCredentials } = user;
        return {
            id: user.id,
            name: user.displayName,
            firstName: user.firstName,
            surname: user.surname,
            email: user.email,
            lastUpdated: user.lastUpdated,
            created: user.created,
            userGroups: user.userGroups,
            username: user.userCredentials.username,
            apiUrl: `${this.api.baseUrl}/api/users/${user.id}.json`,
            userRoles: user.userCredentials.userRoles,
            lastLogin: userCredentials.lastLogin ? userCredentials.lastLogin : undefined,
            disabled: user.userCredentials.disabled,
            organisationUnits: user.organisationUnits,
            dataViewOrganisationUnits: user.dataViewOrganisationUnits,
            access: user.access,
            openId: userCredentials.openId,
        };
    }
}
const fields = {
    id: true,
    displayName: true,
    name: true,
    firstName: true,
    surname: true,
    email: true,
    lastUpdated: true,
    created: true,
    userGroups: { id: true, name: true },
    userCredentials: {
        username: true,
        userRoles: { id: true, name: true, authorities: true },
        lastLogin: true,
        disabled: true,
        openId: true,
    },
    organisationUnits: { id: true, name: true },
    dataViewOrganisationUnits: { id: true, name: true },
    access: true,
} as const;

type D2ApiUser = SelectedPick<D2UserSchema, typeof fields>;

