import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/Instance";
import { TrackedEntityInstance } from "../../domain/entities/TrackedEntityInstance";
import { getTEIsFilters, TEIRepository } from "../../domain/repositories/TEIRepository";
import { buildPeriodFromParams, cleanOrgUnitPaths } from "../../domain/utils";
import { D2Api, Pager } from "../../types/d2-api";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-api";

export class TEID2ApiRepository implements TEIRepository {
    private api: D2Api;

    //Specify fields because without fields enrollment relation is not in response
    //and if assign fiedls: "*" return events inside enrollments
    private fields =
        "trackedEntityInstance, created,orgUnit,createdAtClient,lastUpdated,trackedEntityType,lastUpdatedAtClient,inactive,deleted,featureType,programOwners,enrollments,relationships,attributes";

    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    get(filters: getTEIsFilters): FutureData<TrackedEntityInstance[]> {
        const { programIds, period, orgUnitPaths = [], startDate, endDate } = filters;
        const { startDate: start, endDate: end } = buildPeriodFromParams({ period, startDate, endDate });

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

        if (orgUnits.length === 0) return Future.success([]);

        const fetchApi = async (program: string, page: number) => {
            return this.api
                .get<TEIsResponse>("/trackedEntityInstances", {
                    pageSize: 250,
                    totalPages: true,
                    page,
                    program,
                    ou: orgUnits.join(";"),
                    fields: this.fields,
                    programStartDate: period !== "ALL" ? start.format("YYYY-MM-DD") : undefined,
                    programEndDate: period !== "ALL" ? end.format("YYYY-MM-DD") : undefined,
                })
                .getData();
        };

        return Future.fromPromise(
            promiseMap(programIds, async programId => {
                const { trackedEntityInstances, pager } = await fetchApi(programId, 1);

                const paginatedETeis = await promiseMap(_.range(2, pager.pageCount + 1), async page => {
                    const { trackedEntityInstances } = await fetchApi(programId, page);
                    return trackedEntityInstances;
                });

                return [...trackedEntityInstances, ..._.flatten(paginatedETeis)];
            })
        )
            .flatMapError(() => Future.error("An error has occurred rerieving events"))
            .map(result => _(result).flatten().value());
    }
}

interface TEIsResponse {
    trackedEntityInstances: TrackedEntityInstance[];
    pager: Pager;
}
