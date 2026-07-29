import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/instance/Instance";
import { TrackedEntityInstance } from "../../domain/entities/data/TrackedEntityInstance";
import { getTEIsFilters, TEIRepository } from "../../domain/repositories/TEIRepository";
import { buildPeriodFromParams, cleanOrgUnitPaths } from "../../domain/utils";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";
import { D2TrackerTrackedEntity, toTrackedEntityInstance } from "../utils/TrackerTrackedEntity";

export class TEID2ApiRepository implements TEIRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    get(filters: getTEIsFilters): FutureData<TrackedEntityInstance[]> {
        const { programIds, period, orgUnitPaths = [], startDate, endDate } = filters;

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0) return Future.success([]);

        const dates = buildEnrolledDates({ period, startDate, endDate });

        return Future.sequential(
            programIds.map(program => this.getAllPages({ ...dates, program, orgUnits: orgUnits.join(";") }))
        )
            .flatMapError(() => Future.error("An error has occurred rerieving TEIs"))
            .map(result => _.flatten(result));
    }

    /* Traversed by the nextPage link, as the events endpoint is: see EventsD2ApiRepository. */
    private getAllPages(params: TrackedEntitiesQuery, page = 1): FutureData<TrackedEntityInstance[]> {
        return apiToFuture(
            this.api.get<TrackedEntitiesResponse>("/tracker/trackedEntities", {
                ...params,
                orgUnitMode: "SELECTED",
                fields,
                page,
                pageSize,
            })
        ).flatMap(({ trackedEntities, pager }) => {
            const teis = trackedEntities.map(toTrackedEntityInstance);
            const isLastPage = !pager?.nextPage && trackedEntities.length < pageSize;

            return isLastPage
                ? Future.success(teis)
                : this.getAllPages(params, page + 1).map(nextTeis => [...teis, ...nextTeis]);
        });
    }
}

const pageSize = 250;

/* Requesting `enrollments` without a selection nests every event of every enrollment. */
const fields = [
    "trackedEntity,trackedEntityType,orgUnit,createdAt,createdAtClient,updatedAt,inactive,deleted",
    "programOwners[orgUnit,program,trackedEntity]",
    "attributes[attribute,code,displayName,value,valueType,createdAt,updatedAt]",
    "enrollments[enrollment,program,orgUnit,trackedEntity,enrolledAt,occurredAt,createdAt,createdAtClient,updatedAt,status,followUp,deleted]",
].join(",");

type TrackedEntitiesQuery = {
    program: string;
    orgUnits: string;
    enrollmentEnrolledAfter?: string;
    enrollmentEnrolledBefore?: string;
};

type TrackedEntitiesResponse = {
    trackedEntities: D2TrackerTrackedEntity[];
    pager?: { nextPage?: string };
};

type PeriodFilter = Pick<getTEIsFilters, "period" | "startDate" | "endDate">;

function buildEnrolledDates({ period, startDate, endDate }: PeriodFilter) {
    if (period === "ALL") return {};

    const { startDate: start, endDate: end } = buildPeriodFromParams({ period, startDate, endDate });

    return {
        enrollmentEnrolledAfter: start.format("YYYY-MM-DD"),
        enrollmentEnrolledBefore: end.format("YYYY-MM-DD"),
    };
}
