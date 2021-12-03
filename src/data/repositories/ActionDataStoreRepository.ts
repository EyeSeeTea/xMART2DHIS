import { Future, FutureData } from "../../domain/entities/Future";
import { SyncAction, SyncActionData } from "../../domain/entities/SyncAction";
import { ActionRepository } from "../../domain/repositories/ActionRepository";
import { Namespaces } from "../utils/Namespaces";
import { StorageDefaultRepository } from "./StorageDefaultRepository";

export class ActionDataStoreRepository implements ActionRepository {
    constructor(private dataStoreClient: StorageDefaultRepository) {}

    //TODO: dataStoreClient should be refactor to futures to avoid Future.fromPromise here.

    getById(id: string): FutureData<SyncAction> {
        return Future.fromPromise(this.dataStoreClient.getObjectInCollection<SyncActionData>(Namespaces.ACTIONS, id))
            .flatMapError(error => Future.error(String(error)))
            .flatMap(actionData =>
                actionData
                    ? Future.success(SyncAction.build(actionData))
                    : Future.error(`The action ${id} doesnot exist`)
            );
    }

    list(): FutureData<SyncAction[]> {
        return Future.fromPromise(this.dataStoreClient.listObjectsInCollection<SyncActionData>(Namespaces.ACTIONS))
            .flatMapError(error => Future.error(String(error)))
            .map(actions => actions.map(actionData => SyncAction.build(actionData)));
    }
    save(action: SyncAction): FutureData<void> {
        return Future.fromPromise(
            this.dataStoreClient.saveObjectInCollection<SyncActionData>(Namespaces.ACTIONS, action.toData())
        ).flatMapError(error => Future.error(String(error)));
    }

    delete(ids: string[]): FutureData<void> {
        return Future.fromPromise(this.dataStoreClient.removeObjectsInCollection(Namespaces.ACTIONS, ids)).flatMapError(
            error => Future.error(String(error))
        );
    }
}
