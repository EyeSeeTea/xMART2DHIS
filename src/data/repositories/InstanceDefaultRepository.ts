import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/Instance";
import { ProgramEvent } from "../../domain/entities/ProgramEvent";
import { SyncResult } from "../../domain/entities/SyncResult";
import { User } from "../../domain/entities/User";
import { GetEventsFilters, InstanceRepository, PostEventsParams } from "../../domain/repositories/InstanceRepository";
import i18n from "../../locales";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";
import { postImport } from "../clients/dhis-import/Dhis2Import";

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

    public postEvents(events: ProgramEvent[], params: PostEventsParams = {}): FutureData<SyncResult> {
        return apiToFuture(this.api.events.postAsync(params, { events })).flatMap(({ response }) =>
            apiToFuture(this.api.system.waitFor(response.jobType, response.id)).flatMap(response => {
                if (!response) return Future.error("Unknown error saving events");

                return Future.success(
                    //@ts-ignore TODO: Alexis will review the types
                    postImport(
                        { status: response.status, response },
                        {
                            title: i18n.t("Events - Create/update"),
                            model: i18n.t("Event"),
                            splitStatsList: true,
                        }
                    )
                );
            })
        );
    }

    /**public postDataValueSet(dataValues: DataValue[], params: PostDataValuesParams): FutureData<SyncResult> {
        return apiToFuture(this.api.dataValues.postSetAsync(params, { dataValues })).flatMap(({ response }) =>
            apiToFuture(this.api.system.waitFor(response.jobType, response.id)).flatMap(importSummary => {
                if (!importSummary) return Future.error("Unknown error saving data values");

                const { status, description, conflicts, importCount } = importSummary;
                const { imported, deleted, updated, ignored } = importCount;
                const errors = conflicts?.map(({ object, value }) => ({ id: object, message: value })) ?? [];

                return Future.success({
                    title: i18n.t("Data values - Create/update"),
                    status,
                    message: description,
                    stats: [{ imported, deleted, updated, ignored }],
                    errors,
                    rawResponse: importSummary,
                });
            })
        );
    }**/

    public getEvents(_filters: GetEventsFilters): FutureData<ProgramEvent[]> {
        throw new Error("Method not implemented.");
    }
}
