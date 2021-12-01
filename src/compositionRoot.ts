import { ActionDataStoreRepository } from "./data/repositories/ActionDataStoreRepository";
import { AzureMSALRepository } from "./data/repositories/AzureMSALRepository";
import { InstanceD2ApiRepository } from "./data/repositories/InstanceD2ApiRepository";
import { StorageDataStoreRepository } from "./data/repositories/StorageDataStoreRepository";
import { XMartDefaultRepository } from "./data/repositories/XMartDefaultRepository";
import { Instance } from "./domain/entities/Instance";
import { DeleteActionsUseCase } from "./domain/usecases/actions/DeleteActionsUseCase";
import { GetActionsUseCase } from "./domain/usecases/actions/GetActionsUseCase";
import { GetAzureInstanceUseCase } from "./domain/usecases/azure/GetAzureConfigUseCase";
import { GetCurrentUserUseCase } from "./domain/usecases/instance/GetCurrentUserUseCase";
import { GetInstanceVersionUseCase } from "./domain/usecases/instance/GetInstanceVersionUseCase";
import { ListAllMartContentsUseCase } from "./domain/usecases/xmart/ListAllMartContentsUseCase";
import { ListDataMartsUseCase } from "./domain/usecases/xmart/ListDataMartsUseCase";
import { ListMartContentsUseCase } from "./domain/usecases/xmart/ListMartContentsUseCase";
import { ListMartTablesUseCase } from "./domain/usecases/xmart/ListMartTablesUseCase";

export function getCompositionRoot(instance: Instance) {
    const instanceRepository = new InstanceD2ApiRepository(instance);
    const azureRepository = new AzureMSALRepository();
    const martRepository = new XMartDefaultRepository(azureRepository);
    const dataStoreClient = new StorageDataStoreRepository("global", instance);
    const actionRepository = new ActionDataStoreRepository(dataStoreClient);

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
        actions: getExecute({
            list: new GetActionsUseCase(actionRepository),
            delete: new DeleteActionsUseCase(actionRepository),
        }),
        azure: getExecute({
            getInstance: new GetAzureInstanceUseCase(azureRepository),
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
