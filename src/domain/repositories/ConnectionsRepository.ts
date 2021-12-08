import { ConnectionData } from "../entities/XMart";

export interface ConnectionsRepository {
    listAll({ search }: ConnectionsFilter): Promise<ConnectionData[]>;
    save(connection: ConnectionData): Promise<void>;
    delete(connectionIds: string[]): Promise<void>;
    getById(id: string): Promise<ConnectionData | undefined>;

}

export interface ConnectionsFilter {
    search?: string;
}
