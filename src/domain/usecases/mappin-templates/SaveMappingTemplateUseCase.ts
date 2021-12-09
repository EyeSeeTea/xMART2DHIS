import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { MappingTemplateRepository } from "../../repositories/MappingTemplateRepository";
import { MappingTemplate } from "../../entities/mapping-template/MappingTemplate";

export class SaveMappingTemplateUseCase implements UseCase {
    constructor(private mappingRepository: MappingTemplateRepository) {}

    public execute(mappingTemplate: MappingTemplate): FutureData<void> {
        return this.mappingRepository.save(mappingTemplate);
    }
}
