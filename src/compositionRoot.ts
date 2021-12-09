import { Constants } from "./data/Constants";
import { ActionDataStoreRepository } from "./data/repositories/ActionDataStoreRepository";
import { AggregatedD2ApiRepository } from "./data/repositories/AggregatedD2ApiRepository";
import { AzureMSALRepository } from "./data/repositories/AzureMSALRepository";
import { ConnectionsDataStoreRepository } from "./data/repositories/ConnectionsDataStoreRepository";
import { EventsD2ApiRepository } from "./data/repositories/EventsD2ApiRepository";
import { FileD2ApiRepository } from "./data/repositories/FileD2ApiRepository";
import { InstanceD2ApiRepository } from "./data/repositories/InstanceD2ApiRepository";
import { MappingTemplateDataStoreRepository } from "./data/repositories/MappingTemplateDataStoreRepository";
import { MetadataD2ApiRepository } from "./data/repositories/MetadataD2ApiRepository";
import { StorageDataStoreRepository } from "./data/repositories/StorageDataStoreRepository";
import { TEID2ApiRepository } from "./data/repositories/TEID2ApiRepository";
import { XMartDefaultRepository } from "./data/repositories/XMartDefaultRepository";
import { Instance } from "./domain/entities/instance/Instance";
import { DeleteActionsUseCase } from "./domain/usecases/actions/DeleteActionsUseCase";
import { ExecuteActionUseCase } from "./domain/usecases/actions/ExecuteActionUseCase";
import { GetActionByIdUseCase } from "./domain/usecases/actions/GetActionByIdUseCase";
import { GetActionsUseCase } from "./domain/usecases/actions/GetActionsUseCase";
import { SaveActionUseCase } from "./domain/usecases/actions/SaveActionsUseCase";
import { GetAzureInstanceUseCase } from "./domain/usecases/azure/GetAzureConfigUseCase";
import { DeleteConnectionsUseCase } from "./domain/usecases/connection/DeleteConnectionsUseCase";
import { GetConnectionByIdUseCase } from "./domain/usecases/connection/GetConnectionByIdUseCase";
import { ListAllConnectionsUseCase } from "./domain/usecases/connection/ListAllConnectionsUseCase";
import { SaveConnectionUseCase } from "./domain/usecases/connection/SaveConnectionUseCase";
import { TestConnectionUseCase } from "./domain/usecases/connection/TestConnectionUseCase";
import { GetCurrentUserUseCase } from "./domain/usecases/instance/GetCurrentUserUseCase";
import { GetInstanceVersionUseCase } from "./domain/usecases/instance/GetInstanceVersionUseCase";
import { SearchUsersUseCase } from "./domain/usecases/instance/SearchUsersUseCase";
import { GetMappingTemplateByIdUseCase } from "./domain/usecases/mappin-templates/GetMappingTemplateByIdUseCase";
import { GetMappingTemplatesUseCase } from "./domain/usecases/mappin-templates/GetMappingTemplatesUseCase";
import { SaveMappingTemplateUseCase } from "./domain/usecases/mappin-templates/SaveMappingTemplateUseCase";
import { GetMetadataByIdsUseCase } from "./domain/usecases/metadata/GetMetadataByIdsUseCase";
import { GetRootOrgUnitUseCase } from "./domain/usecases/metadata/GetRootOrgUnitUseCase";
import { ListMetadataUseCase } from "./domain/usecases/metadata/ListMetadataUseCase";
import { ListAllMartContentsUseCase } from "./domain/usecases/xmart/ListAllMartContentsUseCase";
import { ListDataMartsUseCase } from "./domain/usecases/xmart/ListDataMartsUseCase";
import { ListMartContentsUseCase } from "./domain/usecases/xmart/ListMartContentsUseCase";
import { ListMartTablesUseCase } from "./domain/usecases/xmart/ListMartTablesUseCase";

export function getCompositionRoot(instance: Instance) {
    const instanceRepository = new InstanceD2ApiRepository(instance);
    const azureRepository = new AzureMSALRepository(Constants.TENANT_ID, Constants.CLIENT_ID);
    const martRepository = new XMartDefaultRepository(azureRepository);
    const dataStoreClient = new StorageDataStoreRepository("global", instance);
    const connectionRepository = new ConnectionsDataStoreRepository(dataStoreClient);
    const actionRepository = new ActionDataStoreRepository(dataStoreClient);
    const metadataRepository = new MetadataD2ApiRepository(instance);
    const eventsRepository = new EventsD2ApiRepository(instance);
    const teiRepository = new TEID2ApiRepository(instance);
    const aggregatedRespository = new AggregatedD2ApiRepository(instance);
    const fileRepository = new FileD2ApiRepository(instance);
    const mappingRepository = new MappingTemplateDataStoreRepository(dataStoreClient);

    return {
        xmart: getExecute({
            listTables: new ListMartTablesUseCase(martRepository),
            listTableContent: new ListMartContentsUseCase(martRepository),
            listAllTableContent: new ListAllMartContentsUseCase(martRepository),
            listDataMarts: new ListDataMartsUseCase(martRepository),
        }),
        instance: getExecute({
            getCurrentUser: new GetCurrentUserUseCase(instanceRepository),
            getVersion: new GetInstanceVersionUseCase(instanceRepository),
            searchUsers: new SearchUsersUseCase(instanceRepository),
        }),
        metadata: getExecute({
            getOrgUnitRoots: new GetRootOrgUnitUseCase(metadataRepository),
            getByIds: new GetMetadataByIdsUseCase(metadataRepository),
            list: new ListMetadataUseCase(metadataRepository),
        }),
        actions: getExecute({
            list: new GetActionsUseCase(actionRepository),
            get: new GetActionByIdUseCase(actionRepository),
            delete: new DeleteActionsUseCase(actionRepository),
            save: new SaveActionUseCase(actionRepository, metadataRepository, fileRepository, martRepository),
            execute: new ExecuteActionUseCase(
                actionRepository,
                metadataRepository,
                eventsRepository,
                teiRepository,
                aggregatedRespository,
                fileRepository,
                martRepository
            ),
        }),
        mappingTemplates: getExecute({
            list: new GetMappingTemplatesUseCase(mappingRepository),
            get: new GetMappingTemplateByIdUseCase(mappingRepository),
            save: new SaveMappingTemplateUseCase(mappingRepository),
        }),
        azure: getExecute({
            getInstance: new GetAzureInstanceUseCase(azureRepository),
        }),
        connection: getExecute({
            listAll: new ListAllConnectionsUseCase(connectionRepository),
            save: new SaveConnectionUseCase(connectionRepository),
            delete: new DeleteConnectionsUseCase(connectionRepository),
            getById: new GetConnectionByIdUseCase(connectionRepository),
            testConnection: new TestConnectionUseCase(martRepository, instanceRepository),
        }),
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

function getExecute<UseCases extends Record<Key, UseCase>, Key extends keyof UseCases>(
    useCases: UseCases
): { [K in Key]: UseCases[K]["execute"] } {
    const keys = Object.keys(useCases) as Key[];
    const initialOutput = {} as { [K in Key]: UseCases[K]["execute"] };

    return keys.reduce((output, key) => {
        const useCase = useCases[key];
        const execute = useCase.execute.bind(useCase) as UseCases[typeof key]["execute"];
        output[key] = execute;
        return output;
    }, initialOutput);
}

export interface UseCase {
    execute: Function;
}
