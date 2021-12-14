import { UseCase } from "../../../compositionRoot";
import { MetadataRepository } from "../../repositories/MetadataRepository";

export class GetModelNameUseCase implements UseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public execute(model: string): string {
        return this.metadataRepository.getModelName(model);
    }
}
