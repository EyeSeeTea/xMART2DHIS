import { FutureData } from "../entities/Future";
import { SyncAction } from "../entities/SyncAction";

export interface ActionRepository {
    getById(id: string): FutureData<SyncAction | undefined>;
    list(): FutureData<SyncAction[]>;
    save(rules: SyncAction): FutureData<void>;
    delete(ids: string[]): FutureData<void>;
}
