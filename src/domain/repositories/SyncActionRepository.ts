import { FutureData } from "../entities/Future";
import { SyncAction } from "../entities/actions/SyncAction";

export interface SyncActionRepository {
    execute(action: SyncAction): FutureData<void>;
}
