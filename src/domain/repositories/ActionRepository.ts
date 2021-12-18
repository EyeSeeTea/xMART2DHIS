import { FutureData } from "../entities/Future";
import { SyncAction } from "../entities/actions/SyncAction";
import { SyncCustomAction } from "../entities/actions/SyncCustomAction";

export interface ActionRepository {
    getById(id: string): FutureData<SyncAction>;
    list(): FutureData<SyncAction[]>;
    save(rules: SyncAction | SyncCustomAction): FutureData<void>;
    delete(ids: string[]): FutureData<void>;
}
