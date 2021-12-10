import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { MappingTemplateRepository } from "../../repositories/MappingTemplateRepository";
import { MappingTemplate } from "../../entities/mapping-template/MappingTemplate";

export class GetMappingTemplateByIdUseCase implements UseCase {
    constructor(private mappingRepository: MappingTemplateRepository) {}

    public execute(id: string): FutureData<MappingTemplate> {
        return this.mappingRepository.getById(id);
    }
}
