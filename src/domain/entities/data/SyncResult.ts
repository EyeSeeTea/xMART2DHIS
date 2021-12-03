export type SyncStatus = "PENDING" | "SUCCESS" | "WARNING" | "ERROR" | "NETWORK ERROR";

export interface SyncStats {
    type?: string;
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
    total?: number;
}

export interface ErrorMessage {
    id: string;
    message: string;
}

export interface SyncResult {
    title: string;
    status: SyncStatus;
    message?: string;
    stats?: SyncStats[];
    errors?: ErrorMessage[];
    rawResponse: object;
}
