// @vitest-environment node
// node: fetch, FormData and Blob must come from the same runtime for the multipart body to be serialised.
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { PublicClientApplication } from "@azure/msal-browser";
import { Future, FutureData } from "../../../domain/entities/Future";
import { DataMart } from "../../../domain/entities/xmart/DataMart";
import { AzureRepository } from "../../../domain/repositories/AzureRepository";
import { MockWebServer } from "../../../utils/tests/MockWebServer";
import { XMartDefaultRepository } from "../XMartDefaultRepository";

import runPipelineSuccessResponse from "./fixtures/RunPipelineSuccessResponse.json";
import batchStatusSuccessResponse from "./fixtures/BatchStatusSuccessResponse.json";

const mockWebServer = new MockWebServer();

const token = "user-token";
const table = "POC_TABLE";
const rows: ReadonlyArray<object> = [
    { ID: "a", NAME: "first" },
    { ID: "b", NAME: "second" },
];

/* Matches the xMART external API whether the request goes direct or through the CORS proxy. */
const xMartApi = "*/xmart4/external";

const dataMart: Readonly<DataMart> = {
    id: "dataMartId1",
    name: "Training",
    owner: { id: "userId00001", name: "Admin" },
    created: new Date(2026, 0, 1),
    lastUpdated: new Date(2026, 0, 1),
    lastUpdatedBy: { id: "userId00001", name: "Admin" },
    publicAccess: "--------",
    userAccesses: [],
    userGroupAccesses: [],
    environment: "UAT",
    martCode: "TRAINING_EYESEETEA",
    dataEndpoint: "https://portal-uat.who.int/xmart-api/odata/TRAINING_EYESEETEA",
    connectionWorks: true,
};

describe("XMartDefaultRepository", () => {
    beforeAll(() => mockWebServer.start());
    afterEach(() => mockWebServer.resetHandlers());
    afterAll(() => mockWebServer.close());

    describe("loadData", () => {
        it("sends the rows to LOAD_DATA_V2 as a JSON file in a multipart/form-data body, with the table in the query string", async () => {
            const repository = givenAnXMartRepositoryWhosePipelinesSucceed();

            await repository.loadData(dataMart, table, rows).toPromise();

            const start = startRequest();
            expect(start.raw.method).toBe("POST");
            expect(start.params.get("martCode")).toBe(dataMart.martCode);
            expect(start.params.get("originCode")).toBe("LOAD_DATA_V2");
            expect(start.params.get("table")).toBe(table);
            expect(start.headers["authorization"]).toBe(`Bearer ${token}`);
            expect(start.headers["content-type"]).toMatch(/^multipart\/form-data; boundary=/);

            const sentFile = (await start.raw.formData()).get("file");
            expect(sentFile).toBeInstanceOf(Blob);
            expect(sentFile instanceof Blob ? JSON.parse(await sentFile.text()) : undefined).toEqual(rows);
        });
    });
});

/* An xMART that starts every run and finishes its batch with SUCCESS. */
function givenAnXMartRepositoryWhosePipelinesSucceed(): XMartDefaultRepository {
    mockWebServer.addRequestHandlers([
        {
            method: "post",
            endpoint: `${xMartApi}/origin/start`,
            httpStatusCode: 200,
            response: runPipelineSuccessResponse,
        },
        {
            method: "get",
            endpoint: `${xMartApi}/batch/${runPipelineSuccessResponse.BatchID}/status`,
            httpStatusCode: 200,
            response: batchStatusSuccessResponse,
        },
    ]);

    return new XMartDefaultRepository(new AzureTestRepository());
}

class AzureTestRepository implements AzureRepository {
    getInstance(): PublicClientApplication {
        throw new Error("Not used by XMartDefaultRepository");
    }

    getToken(_scope: string): FutureData<string> {
        return Future.success(token);
    }
}

function startRequest() {
    const start = mockWebServer.allRequests.find(request => request.url.pathname.endsWith("/origin/start"));
    if (!start) throw new Error("No request to /origin/start");
    return start;
}
