import { InstanceDefaultRepository } from "./data/repositories/InstanceDefaultRepository";
import { XMartDefaultRepository } from "./data/repositories/XMartDefaultRepository";
import { Instance } from "./domain/entities/Instance";
import { EntoIRMechanismsUseCase } from "./domain/usecases/actions/EntoIRMechanismsUseCase";
import { EntoIRSynergistInsecticideUseCase } from "./domain/usecases/actions/EntoIRSynergistInsecticideUseCase";
import { EntoIRIntensityConcentrationUseCase } from "./domain/usecases/actions/EntoIRIntensityConcentrationUseCase";
import { EntoDiscriminatingConcentrationUseCase } from "./domain/usecases/actions/EntoDiscriminatingConcentrationUseCase";
import { GetCurrentUserUseCase } from "./domain/usecases/instance/GetCurrentUserUseCase";
import { GetInstanceVersionUseCase } from "./domain/usecases/instance/GetInstanceVersionUseCase";
import { ListAllMartContentsUseCase } from "./domain/usecases/xmart/ListAllMartContentsUseCase";
import { ListMartContentsUseCase } from "./domain/usecases/xmart/ListMartContentsUseCase";
import { ListMartTablesUseCase } from "./domain/usecases/xmart/ListMartTablesUseCase";

export function getCompositionRoot(instance: Instance) {
    const instanceRepository = new InstanceDefaultRepository(instance);
    const martRepository = new XMartDefaultRepository();

    return {
        xmart: getExecute({
            listTables: new ListMartTablesUseCase(martRepository),
            list: new ListMartContentsUseCase(martRepository),
            listAll: new ListAllMartContentsUseCase(martRepository),
        }),
        instance: getExecute({
            getCurrentUser: new GetCurrentUserUseCase(instanceRepository),
            getVersion: new GetInstanceVersionUseCase(instanceRepository),
        }),
        actions: getExecute({
            action1: new EntoIRMechanismsUseCase(martRepository, instanceRepository),
            action2: new EntoIRSynergistInsecticideUseCase(martRepository, instanceRepository),
            action3: new EntoIRIntensityConcentrationUseCase(martRepository, instanceRepository),
            action4: new EntoDiscriminatingConcentrationUseCase(martRepository, instanceRepository),
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
