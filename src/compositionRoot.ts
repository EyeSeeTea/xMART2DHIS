import { ActionDataStoreRepository } from "./data/repositories/ActionDataStoreRepository";
import { AggregatedD2ApiRepository } from "./data/repositories/AggregatedD2ApiRepository";
import { AzureMSALRepository } from "./data/repositories/AzureMSALRepository";
import { EventsD2ApiRepository } from "./data/repositories/EventsD2ApiRepository";
import { FileD2ApiRepository } from "./data/repositories/FileD2ApiRepository";
import { InstanceD2ApiRepository } from "./data/repositories/InstanceD2ApiRepository";
import { MappingTemplateDataStoreRepository } from "./data/repositories/MappingDataStoreRepository";
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
import { GetCurrentUserUseCase } from "./domain/usecases/instance/GetCurrentUserUseCase";
import { GetInstanceVersionUseCase } from "./domain/usecases/instance/GetInstanceVersionUseCase";
import { GetMappingTemplatesUseCase } from "./domain/usecases/mappin-templates/GetMappingTemplatesUseCase";
import { GetMetadataByIdsUseCase } from "./domain/usecases/metadata/GetMetadataByIdsUseCase";
import { GetRootOrgUnitUseCase } from "./domain/usecases/metadata/GetRootOrgUnitUseCase";
import { ListMetadataUseCase } from "./domain/usecases/metadata/ListMetadataUseCase";
import { ListAllMartContentsUseCase } from "./domain/usecases/xmart/ListAllMartContentsUseCase";
import { ListDataMartsUseCase } from "./domain/usecases/xmart/ListDataMartsUseCase";
import { ListMartContentsUseCase } from "./domain/usecases/xmart/ListMartContentsUseCase";
import { ListMartTablesUseCase } from "./domain/usecases/xmart/ListMartTablesUseCase";
import { getD2APiFromInstance } from "./utils/d2-api";

export function getCompositionRoot(instance: Instance) {
    const instanceRepository = new InstanceD2ApiRepository(instance);
    const azureRepository = new AzureMSALRepository();
    const martRepository = new XMartDefaultRepository(azureRepository);
    const dataStoreClient = new StorageDataStoreRepository("global", instance);
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
        mappings: getExecute({
            list: new GetMappingTemplatesUseCase(mappingRepository),
        }),
        azure: getExecute({
            getInstance: new GetAzureInstanceUseCase(azureRepository),
        }),
        d2Api: getD2APiFromInstance(instance),
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
