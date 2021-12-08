import { ConnectionData } from "../entities/xmart/XMart";
import { FutureData } from "../entities/Future";

export interface ConnectionsRepository {
    listAll({ search }: ConnectionsFilter): FutureData<ConnectionData[]>;
    save(connection: ConnectionData): FutureData<void>;
    delete(connectionIds: string[]): FutureData<void>;
    getById(id: string): FutureData<ConnectionData>;
}

export interface ConnectionsFilter {
    search?: string;
}
