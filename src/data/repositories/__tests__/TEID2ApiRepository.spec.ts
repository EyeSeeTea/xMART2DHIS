import { afterEach, describe, expect, it, vi } from "vitest";
import { Instance } from "../../../domain/entities/instance/Instance";
import { getTEIsFilters } from "../../../domain/repositories/TEIRepository";
import { getMockApi } from "../../../types/d2-api";
import { TEID2ApiRepository } from "../TEID2ApiRepository";

const mockApi = getMockApi();

vi.mock("../../../utils/d2-api", () => ({ getD2APiFromInstance: () => mockApi.api }));

const trackedEntitiesUrl = "/tracker/trackedEntities";
const programId = "IpHINAT79UW";
const otherProgramId = "ur1Edk5Oe2n";
const orgUnitPaths: ReadonlyArray<string> = ["/ImspTQPwCqd/O6uvpzGd5pu/DiszpKrYNg8", "/ImspTQPwCqd/g8upMTyEZGZ"];
const fields = [
    "trackedEntity,trackedEntityType,orgUnit,createdAt,createdAtClient,updatedAt,inactive,deleted",
    "programOwners[orgUnit,program,trackedEntity]",
    "attributes[attribute,code,displayName,value,valueType,createdAt,updatedAt]",
    "enrollments[enrollment,program,orgUnit,trackedEntity,enrolledAt,occurredAt,createdAt,createdAtClient,updatedAt,status,followUp,deleted]",
].join(",");

function givenRepository(): TEID2ApiRepository {
    mockApi.mock.onGet(trackedEntitiesUrl).reply(200, { trackedEntities: [], pager: {} });
    return new TEID2ApiRepository(new Instance({ url: "http://dhis2.test" }));
}

function whenGettingTEIs(filters: Partial<getTEIsFilters> = {}) {
    return givenRepository()
        .get({ programIds: [programId], orgUnitPaths: [...orgUnitPaths], period: "ALL", ...filters })
        .runAsync();
}

function expectedQuery(query: Readonly<Record<string, string>> = {}): Readonly<Record<string, unknown>> {
    return {
        program: programId,
        orgUnits: "DiszpKrYNg8,g8upMTyEZGZ",
        orgUnitMode: "SELECTED",
        fields,
        page: 1,
        pageSize: 250,
        ...query,
    };
}

function sentQueries(): ReadonlyArray<unknown> {
    return (mockApi.mock.history.get ?? []).map(request => request.params);
}

describe("TEID2ApiRepository", () => {
    afterEach(() => mockApi.mock.reset());

    describe("query parameters sent to /tracker/trackedEntities", () => {
        it("sends the org units comma-separated, as the orgUnits parameter expects", async () => {
            const { data } = await whenGettingTEIs();

            expect(data).toEqual([]);
            expect(sentQueries()).toEqual([expectedQuery()]);
        });

        it("sends one query per program", async () => {
            await whenGettingTEIs({ programIds: [programId, otherProgramId] });

            expect(sentQueries()).toEqual([expectedQuery(), expectedQuery({ program: otherProgramId })]);
        });

        it("filters by enrollment date when the period is not ALL", async () => {
            await whenGettingTEIs({
                period: "FIXED",
                startDate: new Date(2026, 0, 1),
                endDate: new Date(2026, 5, 30),
            });

            expect(sentQueries()).toEqual([
                expectedQuery({ enrollmentEnrolledAfter: "2026-01-01", enrollmentEnrolledBefore: "2026-06-30" }),
            ]);
        });
    });

    describe("without org units", () => {
        it("resolves to no tracked entities without querying the server", async () => {
            const { data } = await whenGettingTEIs({ orgUnitPaths: [] });

            expect(data).toEqual([]);
            expect(sentQueries()).toEqual([]);
        });
    });
});
