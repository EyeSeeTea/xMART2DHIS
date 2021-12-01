import { Future, FutureData } from "../../domain/entities/Future";
import { SyncAction } from "../../domain/entities/SyncAction";
import { ActionRepository } from "../../domain/repositories/ActionRepository";
import { Namespaces } from "../utils/Namespaces";
import { StorageDefaultRepository } from "./StorageDefaultRepository";

export class ActionDataStoreRepository implements ActionRepository {
    constructor(private dataStoreClient: StorageDefaultRepository) {}

    //TODO: dataStoreClient should be refactor to futures to avoid Future.fromPromise here.

    getById(id: string): FutureData<SyncAction | undefined> {
        return Future.fromPromise(
            this.dataStoreClient.getObjectInCollection<SyncAction>(Namespaces.ACTIONS, id)
        ).flatMapError(error => Future.error(String(error)));
    }

    list(): FutureData<SyncAction[]> {
        return Future.fromPromise(
            this.dataStoreClient.listObjectsInCollection<SyncAction>(Namespaces.ACTIONS)
        ).flatMapError(error => Future.error(String(error)));
    }
    save(action: SyncAction): FutureData<void> {
        return Future.fromPromise(
            this.dataStoreClient.saveObjectInCollection<SyncAction>(Namespaces.ACTIONS, action)
        ).flatMapError(error => Future.error(String(error)));
    }

    delete(ids: string[]): FutureData<void> {
        return Future.fromPromise(this.dataStoreClient.removeObjectsInCollection(Namespaces.ACTIONS, ids)).flatMapError(
            error => Future.error(String(error))
        );
    }
}
