// @vitest-environment node
// node: fetch, FormData and Blob must come from the same runtime for the multipart body to be serialised.
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { PublicClientApplication } from "@azure/msal-browser";
import { Future, FutureData } from "../../../domain/entities/Future";
import { DataMart } from "../../../domain/entities/xmart/DataMart";
import { AzureRepository } from "../../../domain/repositories/AzureRepository";
import { MockHandler, MockWebServer } from "../../../utils/tests/MockWebServer";
import { XMartDefaultRepository } from "../XMartDefaultRepository";

import runPipelineSuccessResponse from "./fixtures/RunPipelineSuccessResponse.json";
import runPipelineErrorResponse from "./fixtures/RunPipelineErrorResponse.json";
import batchStatusSuccessResponse from "./fixtures/BatchStatusSuccessResponse.json";

const mockWebServer = new MockWebServer();

const batchStatusStagingResponse = {
    ...batchStatusSuccessResponse,
    ProcessStepCode: "STAGING",
    ProcessStepTitle: "Staging",
    ProcessResultCode: null,
    ProcessResultTitle: null,
};

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

        it("resolves to the batch id when xMART finishes the batch with SUCCESS", async () => {
            const repository = givenAnXMartRepositoryWhosePipelinesSucceed();

            const batchId = await repository.loadData(dataMart, table, rows).toPromise();

            expect(batchId).toBe(runPipelineSuccessResponse.BatchID);
        });

        it("waits for a batch that is still running and resolves to its id once xMART finishes it", async () => {
            const repository = givenAnXMartRepositoryWhoseBatchesAreStillRunningOnTheFirstCheck();

            const batchId = await repository.loadData(dataMart, table, rows).toPromise();

            expect(batchId).toBe(runPipelineSuccessResponse.BatchID);
        });

        it.each(["INVALID", "REJECTED", "SYSTEM_ERROR", "CANCELED", "TIMEOUT_CANCELED"])(
            "fails with the result and the batch id when xMART finishes the batch with %s",
            async resultCode => {
                const repository = givenAnXMartRepositoryWhoseBatchesFinishWith(resultCode);

                const error = await loadDataError(repository);

                expect(error).toContain(resultCode);
                expect(error).toContain(String(runPipelineSuccessResponse.BatchID));
            }
        );

        it("fails with xMART's message when xMART does not start the batch", async () => {
            const repository = givenAnXMartRepositoryWhoseStartAnswers(runPipelineErrorResponse);

            const error = await loadDataError(repository);

            expect(error).toBe(runPipelineErrorResponse.ErrorMessage);
        });

        it("fails with an unknown batch id when xMART starts the run without a batch id", async () => {
            const repository = givenAnXMartRepositoryWhoseStartAnswers({ BatchID: null, ErrorMessage: null });

            const error = await loadDataError(repository);

            expect(error).toBe("Unknown batch id");
        });
    });
});

function loadDataError(repository: XMartDefaultRepository): Promise<string | undefined> {
    return repository
        .loadData(dataMart, table, rows)
        .toPromise()
        .then(
            () => undefined,
            (error: string) => error
        );
}

/* An xMART that starts every run and finishes its batch with SUCCESS. */
function givenAnXMartRepositoryWhosePipelinesSucceed(): XMartDefaultRepository {
    return givenAnXMartRepositoryWhoseBatchesFinishWith("SUCCESS");
}

/* An xMART whose batches are still staging on the first status check and finish with SUCCESS on the next. */
function givenAnXMartRepositoryWhoseBatchesAreStillRunningOnTheFirstCheck(): XMartDefaultRepository {
    return givenAnXMartRepositoryWhoseBatchStatusIs(() =>
        statusRequests().length === 1 ? batchStatusStagingResponse : batchStatusSuccessResponse
    );
}

/* An xMART that starts every run and finishes its batch with the given result. */
function givenAnXMartRepositoryWhoseBatchesFinishWith(resultCode: string): XMartDefaultRepository {
    return givenAnXMartRepositoryWhoseBatchStatusIs({ ...batchStatusSuccessResponse, ProcessResultCode: resultCode });
}

/* An xMART that answers every start request with the given response and has no batch status to report. */
function givenAnXMartRepositoryWhoseStartAnswers(startResponse: MockHandler["response"]): XMartDefaultRepository {
    return givenAnXMartRepositoryWith(startResponse);
}

/* An xMART that starts every run and answers the status of its batch with the given response. */
function givenAnXMartRepositoryWhoseBatchStatusIs(statusResponse: MockHandler["response"]): XMartDefaultRepository {
    return givenAnXMartRepositoryWith(runPipelineSuccessResponse, [
        {
            method: "get",
            endpoint: `${xMartApi}/batch/${runPipelineSuccessResponse.BatchID}/status`,
            httpStatusCode: 200,
            response: statusResponse,
        },
    ]);
}

/* An xMART that answers every start request with the given response and the batch status with the given handlers. */
function givenAnXMartRepositoryWith(
    startResponse: MockHandler["response"],
    statusHandlers: ReadonlyArray<MockHandler> = []
): XMartDefaultRepository {
    mockWebServer.addRequestHandlers([
        {
            method: "post",
            endpoint: `${xMartApi}/origin/start`,
            httpStatusCode: 200,
            response: startResponse,
        },
        ...statusHandlers,
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

function statusRequests() {
    return mockWebServer.allRequests.filter(request => request.url.pathname.endsWith("/status"));
}

function startRequest() {
    const start = mockWebServer.allRequests.find(request => request.url.pathname.endsWith("/origin/start"));
    if (!start) throw new Error("No request to /origin/start");
    return start;
}
