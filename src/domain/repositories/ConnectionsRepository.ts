import { DataMart } from "../entities/XMart";

export interface ConnectionsRepository {
    listAll({ search }: ConnectionsFilter): Promise<DataMart[]>;
    save(connections: Omit<DataMart, "id">[]): Promise<void>;
    delete(connectionIds: string[]): Promise<void>;
}

export interface ConnectionsFilter {
    search?: string;
}
