import { Id } from "../../../types/d2-api";
import { FutureData } from "../../entities/Future";
import { MetadataPackage } from "../../entities/metadata/Metadata";
import { MetadataRepository } from "../../repositories/MetadataRepository";

export class GetMetadataByIdsUseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public execute(ids: Id[], fields?: object | string, includeDefaults?: boolean): FutureData<MetadataPackage> {
        return this.metadataRepository.getMetadataByIds(ids, fields, includeDefaults);
    }
}
