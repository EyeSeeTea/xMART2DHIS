import { Future, FutureData } from "../../domain/entities/Future";
import { Namespaces } from "../utils/Namespaces";
import { StorageDefaultRepository } from "./StorageDefaultRepository";
import { MappingRepository } from "../../domain/repositories/MappingRepository";
import { Mapping, MappingData } from "../../domain/entities/mapping/Mapping";

export class MappingDataStoreRepository implements MappingRepository {
    constructor(private dataStoreClient: StorageDefaultRepository) {}

    //TODO: dataStoreClient should be refactor to futures to avoid Future.fromPromise here.

    getById(id: string): FutureData<Mapping> {
        return Future.fromPromise(this.dataStoreClient.getObjectInCollection<MappingData>(Namespaces.MAPPINGS, id))
            .flatMapError(error => Future.error(String(error)))
            .flatMap(data =>
                data ? Future.success(Mapping.build(data)) : Future.error(`The action ${id} doesnot exist`)
            );
    }

    list(): FutureData<Mapping[]> {
        return Future.fromPromise(this.dataStoreClient.listObjectsInCollection<MappingData>(Namespaces.MAPPINGS))
            .flatMapError(error => Future.error(String(error)))
            .map(dataList => dataList.map(data => Mapping.build(data)));
    }

    save(mapping: Mapping): FutureData<void> {
        return Future.fromPromise(
            this.dataStoreClient.saveObjectInCollection<MappingData>(Namespaces.MAPPINGS, mapping.toData())
        ).flatMapError(error => Future.error(String(error)));
    }

    saveList(mappings: Mapping[]): FutureData<void> {
        return Future.fromPromise(
            this.dataStoreClient.saveObjectsInCollection<MappingData>(
                Namespaces.MAPPINGS,
                mappings.map(mapping => mapping.toData())
            )
        ).flatMapError(error => Future.error(String(error)));
    }

    delete(ids: string[]): FutureData<void> {
        return Future.fromPromise(
            this.dataStoreClient.removeObjectsInCollection(Namespaces.MAPPINGS, ids)
        ).flatMapError(error => Future.error(String(error)));
    }
}
