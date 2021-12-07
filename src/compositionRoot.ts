import { AzureMSALRepository } from "./data/repositories/AzureMSALRepository";
import { InstanceD2ApiRepository } from "./data/repositories/InstanceD2ApiRepository";
import { XMartDefaultRepository } from "./data/repositories/XMartDefaultRepository";
import { ConnectionsDataStoreRepository } from "./data/repositories/ConnectionsDataStoreRepository";
import { Instance } from "./domain/entities/Instance";
import { ExampleActionUseCase } from "./domain/usecases/actions/ExampleActionUseCase";
import { GetActionsUseCase } from "./domain/usecases/actions/GetActionsUseCase";
import { GetAzureInstanceUseCase } from "./domain/usecases/azure/GetAzureConfigUseCase";
import { GetCurrentUserUseCase } from "./domain/usecases/instance/GetCurrentUserUseCase";
import { GetInstanceVersionUseCase } from "./domain/usecases/instance/GetInstanceVersionUseCase";
import { ListAllMartContentsUseCase } from "./domain/usecases/xmart/ListAllMartContentsUseCase";
import { ListDataMartsUseCase } from "./domain/usecases/xmart/ListDataMartsUseCase";
import { ListMartContentsUseCase } from "./domain/usecases/xmart/ListMartContentsUseCase";
import { ListMartTablesUseCase } from "./domain/usecases/xmart/ListMartTablesUseCase";
import { ListAllConnectionsUseCase } from "./domain/usecases/connection/ListAllConnectionsUseCase";
import { SaveConnectionUseCase } from "./domain/usecases/connection/SaveConnectionUseCase";
import { DeleteConnectionsUseCase } from "./domain/usecases/connection/DeleteConnectionsUseCase";

export function getCompositionRoot(instance: Instance) {
    const instanceRepository = new InstanceD2ApiRepository(instance);
    const azureRepository = new AzureMSALRepository();
    const martRepository = new XMartDefaultRepository(azureRepository);
    const connectionRepository = new ConnectionsDataStoreRepository(instance);

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
            get: new GetActionsUseCase(martRepository, instanceRepository),
            exampleAction: new ExampleActionUseCase(martRepository, instanceRepository),
        }),
        azure: getExecute({
            getInstance: new GetAzureInstanceUseCase(azureRepository),
        }),
        connection: getExecute({
            listAll: new ListAllConnectionsUseCase(connectionRepository),
            save: new SaveConnectionUseCase(connectionRepository),
            delete: new DeleteConnectionsUseCase(connectionRepository),
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
