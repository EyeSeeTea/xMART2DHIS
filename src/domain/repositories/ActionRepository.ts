import { FutureData } from "../entities/Future";
import { SyncAction } from "../entities/actions/SyncAction";

export interface ActionRepository {
    getById(id: string): FutureData<SyncAction>;
    getMultipleById(id: string[]): FutureData<SyncAction[]>;
    list(): FutureData<SyncAction[]>;
    save(rules: SyncAction): FutureData<void>;
    delete(ids: string[]): FutureData<void>;
}
