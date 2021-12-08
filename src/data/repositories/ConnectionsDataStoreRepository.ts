import _ from "lodash";
import { Instance } from "../../domain/entities/Instance";
import { ConnectionsRepository, ConnectionsFilter } from "../../domain/repositories/ConnectionsRepository";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { ConnectionData } from "../../domain/entities/XMart";
import { Namespaces } from "../utils/Namespaces";
import { StorageRepository } from "../../domain/repositories/StorageRepository";
import { StorageDataStoreRepository } from "./StorageDataStoreRepository";

export class ConnectionsDataStoreRepository implements ConnectionsRepository {
    private api: D2Api;
    public dataStore: StorageRepository;

    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(instance);
        this.dataStore = new StorageDataStoreRepository("global", instance);
    }

    public async listAll({ search }: ConnectionsFilter): Promise<ConnectionData[]> {
        try {
            const objects = await this.dataStore.listObjectsInCollection<ConnectionData>(Namespaces.CONNECTIONS);
            const filteredDataBySearch = search
                ? _.filter(objects, o =>
                      _(o)
                          .values()
                          .some(value =>
                              typeof value === "string" ? value.toLowerCase().includes(search.toLowerCase()) : false
                          )
                  )
                : objects;

            return filteredDataBySearch;
        } catch (error: any) {
            console.error(error);
            return [];
        }
    }

    public async getById(id: string): Promise<ConnectionData | undefined> {
        const connectionData = await this.dataStore.getObjectInCollection<ConnectionData>(Namespaces.CONNECTIONS, id);
        if (!connectionData) return undefined;
        return connectionData;
    }

    public async save(connection: ConnectionData): Promise<void> {
        await this.dataStore.saveObjectInCollection(Namespaces.CONNECTIONS, connection);
    }

    public async delete(connectionIds: string[]): Promise<void> {
        await this.dataStore.removeObjectsInCollection(Namespaces.CONNECTIONS, connectionIds);
    }
}
