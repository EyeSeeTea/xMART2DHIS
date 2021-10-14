import { FutureData } from "./Future";
import { SyncResult } from "./SyncResult";

export interface SyncAction {
    id: string;
    name: string;
    description?: string;
    execute: () => FutureData<SyncResult | undefined>;
}
