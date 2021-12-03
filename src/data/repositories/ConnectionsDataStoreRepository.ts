import _ from "lodash";
import { Instance } from "../../domain/entities/Instance";
import { ConnectionsRepository, ConnectionsFilter } from "../../domain/repositories/ConnectionsRepository";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { DataMart } from "../../domain/entities/XMart";
import { Namespaces } from "../utils/Namespaces";
import { StorageRepository } from "../../domain/repositories/StorageRepository";
import { StorageDataStoreRepository } from "./StorageDataStoreRepository";
import { generateUid } from "../../utils/uid";

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

    async save(connections: Omit<DataMart, "id">[]): Promise<void> {
        /*const connectionData = {
            ..._.omit(
                connection.toObject(),
                "publicAccess",
                "userAccesses",
                "externalAccess",
                "userGroupAccesses",
                "user",
                "created",
                "lastUpdated",
                "lastUpdatedBy"
            ),
            url: connection.type === "local" ? "" : connection.url,
            password: this.encryptPassword(connection.password),
        };*/
        const connectionsToSave: DataMart[] = connections.map(connection => ({ ...connection, id: generateUid() }));
        await this.dataStore.saveObjectsInCollection(Namespaces.CONNECTIONS, connectionsToSave);

        /*const objectSharing = {
            publicAccess: connection.publicAccess,
            externalAccess: false,
            user: connection.user,
            userAccesses: connection.userAccesses,
            userGroupAccesses: connection.userGroupAccesses,
        };*/

        //await this.dataStore.saveObjectSharing(`${Namespaces.INSTANCES}-${instanceData.id}`, objectSharing);
    }
}
