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
import { toProgramEvent, toTrackerEvent, trackerEventFields } from "../utils/TrackerEvent";
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

    /**
     *  The tracker events endpoint takes a single value per filter, so neither several
     *  programs nor several org units fit in one call: each combination is queried on its own
     */
    public get(filters: GetEventsFilters): FutureData<ProgramEvent[]> {
        const { programIds, orgUnitPaths = [], period = "ALL", startDate, endDate } = filters;

        if (programIds.length === 0) return Future.success([]);

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0) return Future.success([]);

        const dates = buildOccurredDates({ period, startDate, endDate });
        const queries = programIds.flatMap(program => orgUnits.map(orgUnit => ({ ...dates, program, orgUnit })));

        return Future.parallel(
            queries.map(query => this.getAllPages(query)),
            { maxConcurrency }
        )
            .flatMapError(error => Future.error(`An error has occurred retrieving events\n${String(error)}`))
            .map(events => _.flatten(events));
    }

    private getAllPages(params: EventsQuery, page = 1): FutureData<ProgramEvent[]> {
        return apiToFuture(
            this.api.tracker.events.get({ ...params, fields: trackerEventFields, page, pageSize })
        ).flatMap(({ instances, pager }) => {
            const events = instances.map(toProgramEvent);
            /* A full page without a link is ambiguous, so it is followed as well: an instance
               that did not link pages would otherwise be traversed no further than its first. */
            const isLastPage = !hasNextPage(pager) && instances.length < pageSize;

            return isLastPage
                ? Future.success(events)
                : this.getAllPages(params, page + 1).map(nextEvents => [...events, ...nextEvents]);
        });
    }
}

const pageSize = 250;

const maxConcurrency = 4;

function hasNextPage(pager: unknown): boolean {
    return typeof pager === "object" && pager !== null && "nextPage" in pager;
}

type EventsQuery = Readonly<{
    program: string;
    orgUnit: string;
    occurredAfter?: string;
    occurredBefore?: string;
}>;

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
