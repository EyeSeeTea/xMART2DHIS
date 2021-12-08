import { Future, FutureData } from "../../domain/entities/Future";
import { Namespaces } from "../utils/Namespaces";
import { StorageDefaultRepository } from "./StorageDefaultRepository";
import { MappingTemplate, MappingTemplateData } from "../../domain/entities/mapping-template/MappingTemplate";
import { MappingTemplateRepository } from "../../domain/repositories/MappingTemplateRepository";

export class MappingTemplateDataStoreRepository implements MappingTemplateRepository {
    constructor(private dataStoreClient: StorageDefaultRepository) {}

    //TODO: dataStoreClient should be refactor to futures to avoid Future.fromPromise here.

    getById(id: string): FutureData<MappingTemplate> {
        return Future.fromPromise(
            this.dataStoreClient.getObjectInCollection<MappingTemplateData>(Namespaces.MAPPINGS, id)
        )
            .flatMapError(error => Future.error(String(error)))
            .flatMap(data =>
                data ? Future.success(MappingTemplate.build(data)) : Future.error(`The action ${id} doesnot exist`)
            );
    }

    getByIds(ids: string[]): FutureData<MappingTemplate[]> {
        return Future.fromPromise(
            this.dataStoreClient.listObjectsInCollection<MappingTemplateData>(Namespaces.MAPPINGS)
        )
            .flatMapError(error => Future.error(String(error)))
            .map(dataList => dataList.filter(data => ids.includes(data.id)).map(data => MappingTemplate.build(data)));
    }

    list(): FutureData<MappingTemplate[]> {
        return Future.fromPromise(
            this.dataStoreClient.listObjectsInCollection<MappingTemplateData>(Namespaces.MAPPINGS)
        )
            .flatMapError(error => Future.error(String(error)))
            .map(dataList => dataList.map(data => MappingTemplate.build(data)));
    }

    save(mapping: MappingTemplate): FutureData<void> {
        return Future.fromPromise(
            this.dataStoreClient.saveObjectInCollection<MappingTemplateData>(Namespaces.MAPPINGS, mapping.toData())
        ).flatMapError(error => Future.error(String(error)));
    }

    saveList(mappings: MappingTemplate[]): FutureData<void> {
        return Future.fromPromise(
            this.dataStoreClient.saveObjectsInCollection<MappingTemplateData>(
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
