import { DataMart } from "../entities/xmart/DataMart";
import { FutureData } from "../entities/Future";

export interface ConnectionsRepository {
    listAll({ search }: ConnectionsFilter): FutureData<DataMart[]>;
    save(connection: DataMart): FutureData<void>;
    delete(connectionIds: string[]): FutureData<void>;
    getById(id: string): FutureData<DataMart>;
}

export interface ConnectionsFilter {
    search?: string;
}
