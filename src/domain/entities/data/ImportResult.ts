export type ImportStatus = "PENDING" | "SUCCESS" | "WARNING" | "ERROR" | "NETWORK ERROR";

export interface ImportStats {
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

export interface ImportResult {
    title: string;
    date: Date;
    status: ImportStatus;
    message?: string;
    stats?: ImportStats[];
    errors?: ErrorMessage[];
    rawResponse: object;
}
