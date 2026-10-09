import { describe, expect, it } from "vitest";
import { anything, capture, imock, instance, when } from "@johanblumenberg/ts-mockito";
import { SyncAction } from "../../../entities/actions/SyncAction";
import { Future } from "../../../entities/Future";
import { DataMart } from "../../../entities/xmart/DataMart";
import { XMartLoadModelData } from "../../../entities/xmart/xMartSyncTableTemplates";
import { ActionRepository } from "../../../repositories/ActionRepository";
import { ConnectionsRepository } from "../../../repositories/ConnectionsRepository";
import { MetadataRepository } from "../../../repositories/MetadataRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";
import { SaveActionUseCase } from "../SaveActionsUseCase";
import { dataMart } from "../../../../utils/tests/dataMart";

const metadataTable = "METADATA";

describe("SaveActionUseCase", () => {
    describe("loading the model into xMART", () => {
        it("loads the action's tables and their fields into the mart", async () => {
            const { useCase, action, xMartRepositoryMock } = givenAnActionWithOnlyAMetadataTable();

            await useCase.execute(action).toPromise();

            const [mart, model] = theOnlyLoadedModel(xMartRepositoryMock);
            expect(mart).toEqual(dataMart);
            expect(model.tables).toEqual([{ CODE: metadataTable, TITLE: metadataTable }]);
            expect(model.fields.map(({ TABLE_CODE, CODE, SEQUENCE }) => ({ TABLE_CODE, CODE, SEQUENCE }))).toEqual([
                { TABLE_CODE: metadataTable, CODE: "metadataType", SEQUENCE: 1 },
                { TABLE_CODE: metadataTable, CODE: "id", SEQUENCE: 2 },
                { TABLE_CODE: metadataTable, CODE: "name", SEQUENCE: 3 },
                { TABLE_CODE: metadataTable, CODE: "shortName", SEQUENCE: 4 },
                { TABLE_CODE: metadataTable, CODE: "formName", SEQUENCE: 5 },
                { TABLE_CODE: metadataTable, CODE: "code", SEQUENCE: 6 },
                { TABLE_CODE: metadataTable, CODE: "description", SEQUENCE: 7 },
                { TABLE_CODE: metadataTable, CODE: "created", SEQUENCE: 8 },
            ]);
        });
    });
});

type ActionScenario = {
    useCase: SaveActionUseCase;
    action: SyncAction;
    xMartRepositoryMock: XMartRepository;
};

/* An action with no metadata and a single mapping, metadata to the xMART table. */
function givenAnActionWithOnlyAMetadataTable(): ActionScenario {
    const action = new SyncAction({
        id: "actionId001",
        name: "Action",
        connectionId: dataMart.id,
        period: "ALL",
        orgUnitPaths: [],
        metadataIds: [],
        modelMappings: [{ dhis2Model: "metadata", xMARTTable: metadataTable }],
    });
    const xMartRepositoryMock = mockXMartRepository();

    const useCase = new SaveActionUseCase(
        fakeActionRepository(),
        fakeMetadataRepository(),
        instance(xMartRepositoryMock),
        fakeConnectionsRepository()
    );

    return { useCase, action, xMartRepositoryMock };
}

/* The arguments of the single loadModel call; fails when there is not exactly one. */
function theOnlyLoadedModel(xMartRepositoryMock: XMartRepository): [DataMart, XMartLoadModelData] {
    const calls = capture(xMartRepositoryMock.loadModel).all();
    const [call] = calls;
    if (calls.length !== 1 || !call) throw new Error(`Expected one model load, got ${calls.length}`);
    return call;
}

function fakeActionRepository(): ActionRepository {
    const repository = imock<ActionRepository>();
    when(repository.save(anything())).thenReturn(Future.success(undefined));
    return instance(repository);
}

/* Holds no metadata. */
function fakeMetadataRepository(): MetadataRepository {
    const repository = imock<MetadataRepository>();
    when(repository.getMetadataByIds(anything(), anything())).thenReturn(Future.success({}));
    when(repository.getMetadataByIds(anything(), anything(), anything())).thenReturn(Future.success({}));
    return instance(repository);
}

/* An xMART that accepts every load. */
function mockXMartRepository(): XMartRepository {
    const repository = imock<XMartRepository>();
    when(repository.loadModel(anything(), anything())).thenReturn(Future.success(1));
    return repository;
}

function fakeConnectionsRepository(): ConnectionsRepository {
    const repository = imock<ConnectionsRepository>();
    when(repository.getById(dataMart.id)).thenReturn(Future.success(dataMart));
    return instance(repository);
}
