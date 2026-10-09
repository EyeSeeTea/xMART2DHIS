import { describe, expect, it } from "vitest";
import { anything, capture, imock, instance, when } from "@johanblumenberg/ts-mockito";
import { SyncAction } from "../../../entities/actions/SyncAction";
import { Future, FutureData } from "../../../entities/Future";
import { MetadataPackage } from "../../../entities/metadata/Metadata";
import { OrganisationUnit } from "../../../entities/metadata/OrganisationUnit";
import { Program } from "../../../entities/metadata/Program";
import { DataMart } from "../../../entities/xmart/DataMart";
import { ActionRepository } from "../../../repositories/ActionRepository";
import { AggregatedRepository } from "../../../repositories/AggregatedRepository";
import { ConnectionsRepository } from "../../../repositories/ConnectionsRepository";
import { EventsRepository } from "../../../repositories/EventsRepository";
import { MetadataRepository } from "../../../repositories/MetadataRepository";
import { getTEIsFilters, TEIRepository } from "../../../repositories/TEIRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";
import { ExecuteActionUseCase } from "../ExecuteActionUseCase";

const metadataTable = "METADATA";

const eventProgram: Readonly<Program> = {
    id: "lxAQ7Zs9VYR",
    name: "Antenatal care visit",
    programType: "WITHOUT_REGISTRATION",
    programStages: [],
    programTrackedEntityAttributes: [],
};

const trackerProgram: Readonly<Program> = {
    id: "IpHINAT79UW",
    name: "Child Programme",
    programType: "WITH_REGISTRATION",
    programStages: [],
    programTrackedEntityAttributes: [],
};

const orgUnit: Readonly<OrganisationUnit> = {
    id: "DiszpKrYNg8",
    name: "Ngelehun CHC",
    path: "/ImspTQPwCqd/O6uvpzGd5pu/YuQRtpLP10I/DiszpKrYNg8",
};

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

describe("ExecuteActionUseCase", () => {
    describe("tracked entities", () => {
        /* /tracker/trackedEntities answers 400 E1003 for an event program, which failed the whole action. */
        it("requests no tracked entities and loads the action's rows into its xMART table for an action with only an event program", async () => {
            const { useCase, action, teiRepositoryMock, xMartRepositoryMock } = givenAnActionWithOnlyAnEventProgram();

            const result = await useCase.execute(action.id).toPromise();

            expect(result).toBe(`${metadataTable} 2 rows`);
            expect(requestedPrograms(teiRepositoryMock)).toEqual([]);
            expect(loads(xMartRepositoryMock)).toEqual([
                [
                    dataMart,
                    metadataTable,
                    [
                        { id: eventProgram.id, name: eventProgram.name, metadataType: "programs" },
                        { id: orgUnit.id, name: orgUnit.name, metadataType: "organisationUnits" },
                    ],
                ],
            ]);
        });

        it("requests tracked entities only for the tracker programs of the action", async () => {
            const { useCase, action, teiRepositoryMock } = givenAnActionWithAnEventAndATrackerProgram();

            const result = await useCase.execute(action.id).toPromise();

            expect(result).toBe(`${metadataTable} 3 rows`);
            expect(requestedPrograms(teiRepositoryMock)).toEqual([trackerProgram.id]);
        });
    });
});

/* An action over an event program and an org unit: its metadata table gets 2 rows. */
function givenAnActionWithOnlyAnEventProgram(): ActionScenario {
    return givenAnActionWith([eventProgram], [orgUnit.path]);
}

/* An action over an event program, a tracker program and an org unit: its metadata table gets 3 rows. */
function givenAnActionWithAnEventAndATrackerProgram(): ActionScenario {
    return givenAnActionWith([eventProgram, trackerProgram], [orgUnit.path]);
}

type ActionScenario = {
    useCase: ExecuteActionUseCase;
    action: SyncAction;
    teiRepositoryMock: TEIRepository;
    xMartRepositoryMock: XMartRepository;
};

/* An action over the given programs and org units, mapping its metadata to the xMART table. */
function givenAnActionWith(programs: ReadonlyArray<Program>, orgUnitPaths: ReadonlyArray<string>): ActionScenario {
    const action = new SyncAction({
        id: "actionId001",
        name: "Action",
        connectionId: dataMart.id,
        period: "ALL",
        orgUnitPaths: [...orgUnitPaths],
        metadataIds: programs.map(program => program.id),
        modelMappings: [{ dhis2Model: "metadata", xMARTTable: metadataTable }],
    });
    const teiRepositoryMock = mockTEIRepository();
    const xMartRepositoryMock = mockXMartRepository();

    const useCase = new ExecuteActionUseCase(
        fakeActionRepository(action),
        fakeMetadataRepository(),
        fakeEventsRepository(),
        instance(teiRepositoryMock),
        instance(imock<AggregatedRepository>()),
        instance(xMartRepositoryMock),
        fakeConnectionsRepository()
    );

    return { useCase, action, teiRepositoryMock, xMartRepositoryMock };
}

function loads(xMartRepositoryMock: XMartRepository) {
    return capture(xMartRepositoryMock.loadData).all();
}

function requestedPrograms(teiRepositoryMock: TEIRepository): ReadonlyArray<string> {
    return capture(teiRepositoryMock.get)
        .all()
        .flatMap(([filters]) => filters.programIds);
}

function fakeActionRepository(action: SyncAction): ActionRepository {
    const repository = imock<ActionRepository>();
    when(repository.getById(action.id)).thenReturn(Future.success(action));
    return instance(repository);
}

function fakeMetadataRepository(): MetadataRepository {
    const repository = imock<MetadataRepository>();
    const getMetadataByIds = (ids: string[]): FutureData<MetadataPackage> =>
        Future.success({
            programs: [eventProgram, trackerProgram].filter(program => ids.includes(program.id)),
            organisationUnits: [orgUnit].filter(ou => ids.includes(ou.id)),
        });

    when(repository.getMetadataByIds(anything(), anything())).thenCall(getMetadataByIds);
    when(repository.getMetadataByIds(anything(), anything(), anything())).thenCall(getMetadataByIds);

    return instance(repository);
}

function fakeEventsRepository(): EventsRepository {
    const repository = imock<EventsRepository>();
    when(repository.get(anything())).thenReturn(Future.success([]));
    return instance(repository);
}

/* As /tracker/trackedEntities does, rejects event programs. */
function mockTEIRepository(): TEIRepository {
    const repository = imock<TEIRepository>();

    when(repository.get(anything())).thenCall(({ programIds }: getTEIsFilters) =>
        programIds.includes(eventProgram.id) ? Future.error("An error has occurred rerieving TEIs") : Future.success([])
    );

    return repository;
}

/* An xMART that accepts every load. */
function mockXMartRepository(): XMartRepository {
    const repository = imock<XMartRepository>();
    when(repository.loadData(anything(), anything(), anything())).thenReturn(Future.success(1));
    return repository;
}

function fakeConnectionsRepository(): ConnectionsRepository {
    const repository = imock<ConnectionsRepository>();
    when(repository.getById(dataMart.id)).thenReturn(Future.success(dataMart));
    return instance(repository);
}
