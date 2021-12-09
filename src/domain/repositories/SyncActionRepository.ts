import { FutureData } from "../entities/Future";
import { SyncAction } from "../entities/SyncAction";

export interface SyncActionRepository {
    execute(action: SyncAction): FutureData<void>;
}
