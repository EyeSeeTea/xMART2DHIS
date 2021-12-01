import _ from "lodash";
import { Instance } from "../../domain/entities/Instance";
import { ConnectionsRepository, ConnectionsFilter } from "../../domain/repositories/ConnectionsRepository";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { DataMart } from "../../domain/entities/XMart";
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

    public async listAll({ search }: ConnectionsFilter): Promise<DataMart[]> {
        try {
            const objects = await this.dataStore.listObjectsInCollection<DataMart>(Namespaces.CONNECTIONS);
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
}

