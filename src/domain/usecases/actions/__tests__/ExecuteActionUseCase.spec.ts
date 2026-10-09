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
            const action = createAction([eventProgram]);
            const teiRepository = fakeTEIRepository();
            const xMartRepository = fakeXMartRepository();
            const useCase = createUseCase({
                action,
                teis: teiRepository.instance,
                xMart: xMartRepository.instance,
            });

            const result = await useCase.execute(action.id).toPromise();

            expect(result).toBe(`${metadataTable} 2 rows`);
            expect(requestedPrograms(teiRepository.mock)).toEqual([]);
            expect(capture(xMartRepository.mock.loadData).all()).toEqual([
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
            const action = createAction([eventProgram, trackerProgram]);
            const teiRepository = fakeTEIRepository();
            const useCase = createUseCase({ action, teis: teiRepository.instance });

            const result = await useCase.execute(action.id).toPromise();

            expect(result).toBe(`${metadataTable} 3 rows`);
            expect(requestedPrograms(teiRepository.mock)).toEqual([trackerProgram.id]);
        });
    });
});

function createAction(programs: ReadonlyArray<Program>): SyncAction {
    return new SyncAction({
        id: "actionId001",
        name: "Action",
        connectionId: dataMart.id,
        period: "ALL",
        orgUnitPaths: [orgUnit.path],
        metadataIds: programs.map(program => program.id),
        modelMappings: [{ dhis2Model: "metadata", xMARTTable: metadataTable }],
    });
}

function createUseCase(options: {
    action: SyncAction;
    teis: TEIRepository;
    xMart?: XMartRepository;
}): ExecuteActionUseCase {
    return new ExecuteActionUseCase(
        fakeActionRepository(options.action),
        fakeMetadataRepository(),
        fakeEventsRepository(),
        options.teis,
        instance(imock<AggregatedRepository>()),
        options.xMart ?? fakeXMartRepository().instance,
        fakeConnectionsRepository()
    );
}

function requestedPrograms(teiRepository: TEIRepository): ReadonlyArray<string> {
    return capture(teiRepository.get)
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
function fakeTEIRepository() {
    const repository = imock<TEIRepository>();

    when(repository.get(anything())).thenCall(({ programIds }: getTEIsFilters) =>
        programIds.includes(eventProgram.id) ? Future.error("An error has occurred rerieving TEIs") : Future.success([])
    );

    return { mock: repository, instance: instance(repository) };
}

function fakeXMartRepository() {
    const repository = imock<XMartRepository>();
    when(repository.loadData(anything(), anything(), anything())).thenReturn(Future.success(1));
    return { mock: repository, instance: instance(repository) };
}

function fakeConnectionsRepository(): ConnectionsRepository {
    const repository = imock<ConnectionsRepository>();
    when(repository.getById(dataMart.id)).thenReturn(Future.success(dataMart));
    return instance(repository);
}
