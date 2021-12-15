import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { ListMetadataOptions, ListMetadataResponse, MetadataRepository } from "../../repositories/MetadataRepository";

export class ListMetadataUseCase implements UseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public execute(params: ListMetadataOptions): FutureData<ListMetadataResponse> {
        return this.metadataRepository.list(params);
    }
}
