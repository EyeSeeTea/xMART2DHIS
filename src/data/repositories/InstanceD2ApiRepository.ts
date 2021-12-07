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
import _ from "lodash";


const AppRoles: {
    [key: string]: {
        name: string;
        description: string;
        initialize: boolean;
    };
} = {
    CONFIGURATION_ACCESS: {
        name: "METADATA_SYNC_CONFIGURATOR",
        description:
            "APP - This role allows to create new instances and synchronization rules in the Metadata Sync app",
        initialize: true,
    },
    SYNC_RULE_EXECUTION_ACCESS: {
        name: "METADATA_SYNC_EXECUTOR",
        description: "APP - This role allows to execute synchronization rules in the Metadata Sync app",
        initialize: true,
    },
    SHOW_DELETED_OBJECTS: {
        name: "METADATA_SYNC_SHOW_DELETED_OBJECTS",
        description: "APP - This role allows the user to synchronize deleted objects",
        initialize: false,
    },
};

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

    @cache()
    public getCurrentUser(): FutureData<User> {
        return apiToFuture(
            this.api.currentUser.get({
                fields: {
                    id: true,
                    displayName: true,
                    email: true,
                    userGroups: { id: true, name: true },
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true, authorities: true },
                    },
                    organisationUnits: { id: true, name: true },
                    dataViewOrganisationUnits: { id: true, name: true },
                },
            })
        ).map(user => {
            const isGlobalAdmin = !!user.userCredentials.userRoles.find((role: any) =>
            role.authorities.find((authority: string) => authority === "ALL")
            );
            return ({
                id: user.id,
                name: user.displayName,
                email: user.email,
                username: user.userCredentials.username,
                userGroups: user.userGroups,
                userRoles: user.userCredentials.userRoles,
                organisationUnits: user.organisationUnits,
                dataViewOrganisationUnits: user.dataViewOrganisationUnits,
                isGlobalAdmin,
                isAppConfigurator:
                    isGlobalAdmin ||
                    !!user.userCredentials.userRoles.find(
                        (role: any) => role.name === AppRoles?.CONFIGURATION_ACCESS?.name
                    ),
                isAppExecutor:
                    isGlobalAdmin ||
                    !!user.userCredentials.userRoles.find(
                        (role: any) => role.name === AppRoles?.SYNC_RULE_EXECUTION_ACCESS?.name
                    ),
            });
        }
           /* ({
            id: user.id,
            name: user.displayName,
            userGroups: user.userGroups,
            ...user.userCredentials,
        })*/
        
        );
    }

    @cache()
    public getInstanceVersion(): FutureData<string> {
        return apiToFuture(this.api.system.info).map(({ version }) => version);
    }
}
