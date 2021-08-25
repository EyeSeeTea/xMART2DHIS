import { Params } from "@eyeseetea/d2-api/api/common";
import { FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/Instance";
import { ProgramEvent } from "../../domain/entities/ProgramEvent";
import { SynchronizationResult } from "../../domain/entities/SynchronizationResult";
import { User } from "../../domain/entities/User";
import { InstanceRepository } from "../../domain/repositories/InstanceRepository";
import i18n from "../../locales";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";
import { ImportPostResponse, postImport } from "../clients/dhis-import/Dhis2Import";

export class InstanceDefaultRepository implements InstanceRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
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

    public postEvents(events: ProgramEvent[], params?: Params): FutureData<SynchronizationResult> {
        return apiToFuture(this.api.post<ImportPostResponse>("/events", params, { events })).map(response =>
            postImport(response, {
                title: i18n.t("Data values - Create/update"),
                model: i18n.t("Event"),
                splitStatsList: true,
            })
        );
    }
}
