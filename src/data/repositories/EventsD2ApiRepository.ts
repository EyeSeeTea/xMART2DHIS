import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/instance/Instance";
import { ProgramEvent } from "../../domain/entities/data/ProgramEvent";
import { SyncResult } from "../../domain/entities/data/SyncResult";
import { EventsRepository, GetEventsFilters, SaveEventsParams } from "../../domain/repositories/EventsRepository";
import { buildPeriodFromParams, cleanOrgUnitPaths } from "../../domain/utils";
import i18n from "../../utils/i18n";
import { D2Api, TrackerPostParams } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";
import { toProgramEvent, toTrackerEvent } from "../utils/TrackerEvent";
import { postTrackerImport } from "../utils/TrackerImport";

export class EventsD2ApiRepository implements EventsRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public save(events: ProgramEvent[], params: SaveEventsParams = {}): FutureData<SyncResult> {
        const trackerEvents = events.map(toTrackerEvent);

        return apiToFuture(this.api.tracker.postAsync(buildTrackerPostParams(params), { events: trackerEvents }))
            .flatMap(({ response }) => apiToFuture(this.api.system.waitFor(response.jobType, response.id)))
            .flatMap(response => {
                if (!response) return Future.error<string, SyncResult>("Unknown error saving events");

                return Future.success(postTrackerImport(response, { title: i18n.t("Events - Create/update") }));
            });
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
     *  - The tracker events endpoint does not support multiple values for a given filter
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

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0) return Future.success([]);

        const dates = buildOccurredDates({ period, startDate, endDate });

        return Future.sequential(orgUnits.map(orgUnit => this.getAllPages({ ...dates, orgUnit })))
            .flatMapError(error => Future.error(`An error has occurred retrieving events\n${String(error)}`))
            .map(result =>
                _(result)
                    .flatten()
                    .filter(({ program }) => programIds.includes(program))
                    .value()
            );
    }

    private getEventsByOrgUnit(filters: GetEventsFilters): FutureData<ProgramEvent[]> {
        const { programIds, orgUnitPaths = [], period = "ALL", startDate, endDate } = filters;

        if (programIds.length === 0) return Future.success([]);

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        const dates = buildOccurredDates({ period, startDate, endDate });

        return Future.sequential(
            programIds.map(program =>
                Future.sequential(orgUnits.map(orgUnit => this.getAllPages({ ...dates, program, orgUnit }))).map(
                    events => _.flatten(events)
                )
            )
        )
            .flatMapError(error => Future.error(`An error has occurred retrieving events\n${String(error)}`))
            .map(result => _.flatten(result));
    }

    /**
     * The endpoint reports a page count only under `totalPages=true`, which makes the server count
     * every match on each request: measured at ~45% slower, on the kind of query the comment above
     * warns about. It links the following page instead, and that link is what drives the traversal.
     */
    private getAllPages(params: EventsQuery, page = 1): FutureData<ProgramEvent[]> {
        return apiToFuture(this.api.tracker.events.get({ ...params, fields: { $all: true }, page, pageSize })).flatMap(
            ({ instances, pager }) => {
                const events = instances.map(toProgramEvent);
                /* A full page without a link is ambiguous, so it is followed as well: an instance
                   that did not link pages would otherwise be traversed no further than its first. */
                const isLastPage = !hasNextPage(pager) && instances.length < pageSize;

                return isLastPage
                    ? Future.success(events)
                    : this.getAllPages(params, page + 1).map(nextEvents => [...events, ...nextEvents]);
            }
        );
    }
}

const pageSize = 250;

/* `nextPage` is absent from the pager typed by d2-api, but the tracker endpoint does return it. */
function hasNextPage(pager: unknown): boolean {
    return typeof pager === "object" && pager !== null && "nextPage" in pager;
}

type EventsQuery = {
    orgUnit: string;
    program?: string;
    occurredAfter?: string;
    occurredBefore?: string;
};

type PeriodFilter = Pick<GetEventsFilters, "period" | "startDate" | "endDate">;

function buildOccurredDates({ period = "ALL", startDate, endDate }: PeriodFilter) {
    if (period === "ALL") return {};

    const { startDate: start, endDate: end } = buildPeriodFromParams({ period, startDate, endDate });

    return { occurredAfter: start.format("YYYY-MM-DD"), occurredBefore: end.format("YYYY-MM-DD") };
}

function buildTrackerPostParams(params: SaveEventsParams): TrackerPostParams {
    const { idScheme, dataElementIdScheme, orgUnitIdScheme, dryRun } = params;

    return {
        idScheme,
        dataElementIdScheme,
        orgUnitIdScheme,
        importMode: dryRun ? "VALIDATE" : "COMMIT",
    };
}
