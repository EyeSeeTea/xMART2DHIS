import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/instance/Instance";
import { ProgramEvent } from "../../domain/entities/data/ProgramEvent";
import { SyncResult } from "../../domain/entities/data/SyncResult";
import { EventsRepository, GetEventsFilters, SaveEventsParams } from "../../domain/repositories/EventsRepository";
import { buildPeriodFromParams, cleanOrgUnitPaths } from "../../domain/utils";
import i18n from "../../locales";
import { D2Api } from "../../types/d2-api";
import { promiseMap } from "../../utils/common";
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

    public get(filters: GetEventsFilters): FutureData<ProgramEvent[]> {
        const { orgUnitPaths = [] } = filters;

        if (orgUnitPaths.length < 25) {
            return this.getEventsByOrgUnit(filters);
        } else {
            return this.getAllEvents(filters);
        }
    }

    /**
     * Design choices and heads-up:
     *  - The events endpoint does not support multiple values for a given filter
     *    meaning you cannot query for multiple programs or multiple orgUnits in
     *    the same API call. Instead you need to query one by one
     *  - Querying one by one is not performant, instead we query for all events
     *    available in the instance and manually filter them in this method
     *  - For big databases querying for all events available in a given instance
     *    with paging=false makes the instance to eventually go offline
     *  - Instead of disabling paging we traverse all the events by paginating all
     *    the available pages so that we can filter them afterwards
     */
    private getAllEvents(filters: GetEventsFilters): FutureData<ProgramEvent[]> {
        const { orgUnitPaths = [], programIds = [], period = "ALL", startDate, endDate } = filters;
        if (programIds.length === 0) return Future.success([]);

        const { startDate: start, endDate: end } = buildPeriodFromParams({ period, startDate, endDate });

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0) return Future.success([]);

        const fetchApi = (orgUnit: string, page: number) => {
            return this.api.events
                .get({
                    pageSize: 250,
                    totalPages: true,
                    page,
                    orgUnit,
                    startDate: period !== "ALL" ? start.format("YYYY-MM-DD") : undefined,
                    endDate: period !== "ALL" ? end.format("YYYY-MM-DD") : undefined,
                })
                .getData();
        };

        //TODO: avoid use Future.fromPromise and promiseMap and to use futures
        return Future.fromPromise(
            promiseMap(orgUnits, async orgUnit => {
                const { events, pager } = await fetchApi(orgUnit, 1);

                const paginatedEvents = await promiseMap(_.range(2, pager.pageCount + 1), async page => {
                    const { events } = await fetchApi(orgUnit, page);
                    return events;
                });

                return [...events, ..._.flatten(paginatedEvents)];
            })
        )
            .flatMapError(error => Future.error(`An error has occurred retrieving events\n${String(error)}`))
            .map(result =>
                _(result)
                    .flatten()
                    .filter(({ program }) => programIds.includes(program))
                    .map(object => ({ ...object, id: object.event }))
                    .value()
            );
    }

    private getEventsByOrgUnit(filters: GetEventsFilters): FutureData<ProgramEvent[]> {
        const { programIds, orgUnitPaths = [], period = "ALL", startDate, endDate } = filters;

        if (programIds.length === 0) return Future.success([]);

        const { startDate: start, endDate: end } = buildPeriodFromParams({ period, startDate, endDate });

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        const fetchApi = async (program: string, orgUnit: string, page: number) => {
            return this.api.events
                .get({
                    pageSize: 250,
                    totalPages: true,
                    page,
                    program,
                    orgUnit,
                    startDate: period !== "ALL" ? start.format("YYYY-MM-DD") : undefined,
                    endDate: period !== "ALL" ? end.format("YYYY-MM-DD") : undefined,
                })
                .getData();
        };

        return Future.fromPromise(
            promiseMap(programIds, async programId => {
                const filteredEvents = await promiseMap(orgUnits, async orgUnit => {
                    const { events, pager } = await fetchApi(programId, orgUnit, 1);

                    const paginatedEvents = await promiseMap(_.range(2, pager.pageCount + 1), async page => {
                        const { events } = await fetchApi(programId, orgUnit, page);
                        return events;
                    });

                    return [...events, ..._.flatten(paginatedEvents)];
                });

                return _.flatten(filteredEvents);
            })
        )
            .flatMapError(error => Future.error(`An error has occurred retrieving events\n${String(error)}`))
            .map(result =>
                _(result)
                    .flatten()
                    .map(object => ({ ...object, id: object.event }))
                    .value()
            );
    }
}
