import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/Instance";
import { ProgramEvent } from "../../domain/entities/ProgramEvent";
import { SyncResult } from "../../domain/entities/SyncResult";
import { EventsRepository, GetEventsFilters, SaveEventsParams } from "../../domain/repositories/EventsRepository";
import i18n from "../../locales";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";
import { postImport } from "../utils/Dhis2Import";

export class EventsD2ApiRepository implements EventsRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public save(events: ProgramEvent[], params: SaveEventsParams = {}): FutureData<SyncResult> {
        return apiToFuture(this.api.events.postAsync(params, { events })).flatMap(({ response }) =>
            apiToFuture(this.api.system.waitFor(response.jobType, response.id)).flatMap(response => {
                if (!response) return Future.error("Unknown error saving events");

                return Future.success(
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

    public get(_filters: GetEventsFilters): FutureData<ProgramEvent[]> {
        throw new Error("Method not implemented.");
    }
}
