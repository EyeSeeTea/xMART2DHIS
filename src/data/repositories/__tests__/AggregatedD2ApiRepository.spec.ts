// @vitest-environment node
// node: MSW intercepts the requests d2-api sends through Node's HTTP stack.
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { DataValueSet } from "../../../domain/entities/data/DataValue";
import { Instance } from "../../../domain/entities/instance/Instance";
import { MockWebServer } from "../../../utils/tests/MockWebServer";
import { AggregatedD2ApiRepository } from "../AggregatedD2ApiRepository";

const mockWebServer = new MockWebServer();

const dataSetId = "BfMAe6Itzgt";
const orgUnitId = "DiszpKrYNg8";
const otherOrgUnitId = "g8upMTyEZGZ";
const dataElementId = "fbfJHSPpUQD";
const otherDataElementId = "cYeuwXTCPkU";
const period = "202601";

describe("AggregatedD2ApiRepository", () => {
    beforeAll(() => mockWebServer.start());
    afterEach(() => mockWebServer.resetHandlers());
    afterAll(() => mockWebServer.close());

    describe("get", () => {
        it("sets the org unit of the response on each data value when DHIS2 (2.43+, a single org unit) sends it only once", async () => {
            const repository = givenADHIS2WhoseDataValueSetIs({
                dataSet: dataSetId,
                orgUnit: orgUnitId,
                dataValues: [
                    { dataElement: dataElementId, period, value: "1" },
                    { dataElement: otherDataElementId, period, value: "2" },
                ],
            });

            const dataValueSet = await getDataValues(repository, [orgUnitId]);

            expect(orgUnitsOf(dataValueSet)).toEqual([orgUnitId, orgUnitId]);
        });

        it("keeps the org unit of each data value when DHIS2 sends it on each one", async () => {
            const repository = givenADHIS2WhoseDataValueSetIs({
                dataSet: dataSetId,
                dataValues: [
                    { dataElement: dataElementId, period, orgUnit: orgUnitId, value: "1" },
                    { dataElement: dataElementId, period, orgUnit: otherOrgUnitId, value: "2" },
                ],
            });

            const dataValueSet = await getDataValues(repository, [orgUnitId, otherOrgUnitId]);

            expect(orgUnitsOf(dataValueSet)).toEqual([orgUnitId, otherOrgUnitId]);
        });
    });
});

/* A DHIS2 that answers every data value set request with the given response. */
function givenADHIS2WhoseDataValueSetIs(response: Readonly<Record<string, unknown>>): AggregatedD2ApiRepository {
    mockWebServer.addRequestHandlers([
        { method: "get", endpoint: "*/api/dataValueSets*", httpStatusCode: 200, response },
    ]);

    return new AggregatedD2ApiRepository(new Instance({ url: "http://dhis2.test" }));
}

function getDataValues(repository: AggregatedD2ApiRepository, orgUnitIds: ReadonlyArray<string>) {
    return repository
        .get({ dataSetIds: [dataSetId], orgUnitPaths: orgUnitIds.map(id => `/ImspTQPwCqd/${id}`), period: "ALL" })
        .toPromise();
}

function orgUnitsOf(dataValueSet: DataValueSet): ReadonlyArray<string | undefined> {
    return dataValueSet.dataValues.map(dataValue => dataValue.orgUnit);
}
