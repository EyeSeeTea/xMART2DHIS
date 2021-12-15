import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { OrganisationUnit } from "../../entities/metadata/OrganisationUnit";
import { MetadataRepository } from "../../repositories/MetadataRepository";

export class GetRootOrgUnitUseCase implements UseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public execute(): FutureData<OrganisationUnit[]> {
        return this.metadataRepository.getOrgUnitRoots();
    }
}
