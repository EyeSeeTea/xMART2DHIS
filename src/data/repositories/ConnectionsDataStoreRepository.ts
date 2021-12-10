import _ from "lodash";
import { ConnectionsRepository, ConnectionsFilter } from "../../domain/repositories/ConnectionsRepository";
import { DataMart } from "../../domain/entities/xmart/DataMart";
import { Namespaces } from "../utils/Namespaces";
import { StorageDefaultRepository } from "./StorageDefaultRepository";
import { Future, FutureData } from "../../domain/entities/Future";

export class ConnectionsDataStoreRepository implements ConnectionsRepository {
    constructor(private dataStoreClient: StorageDefaultRepository) {}

    listAll({ search }: ConnectionsFilter): FutureData<DataMart[]> {
        return Future.fromPromise(this.dataStoreClient.listObjectsInCollection<DataMart>(Namespaces.CONNECTIONS))
            .flatMapError(error => Future.error(String(error)))
            .map(data =>
                search
                    ? _.filter(data, o =>
                          _(o)
                              .values()
                              .some(value =>
                                  typeof value === "string" ? value.toLowerCase().includes(search.toLowerCase()) : false
                              )
                      )
                    : data
            );
    }

    getById(id: string): FutureData<DataMart> {
        return Future.fromPromise(this.dataStoreClient.getObjectInCollection<DataMart>(Namespaces.CONNECTIONS, id))
            .flatMapError(error => Future.error(String(error)))
            .flatMap(actionData =>
                actionData ? Future.success(actionData) : Future.error(`The action ${id} doesnot exist`)
            );
    }

    save(connection: DataMart): FutureData<void> {
        return Future.fromPromise(
            this.dataStoreClient.saveObjectInCollection<DataMart>(Namespaces.CONNECTIONS, connection)
        ).flatMapError(error => Future.error(String(error)));
    }

    delete(connectionIds: string[]): FutureData<void> {
        return Future.fromPromise(
            this.dataStoreClient.removeObjectsInCollection(Namespaces.CONNECTIONS, connectionIds)
        ).flatMapError(error => Future.error(String(error)));
    }
}
