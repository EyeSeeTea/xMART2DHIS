import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { MappingTemplateRepository } from "../../repositories/MappingTemplateRepository";
import { MappingTemplate } from "../../entities/mapping-template/MappingTemplate";

export class GetMappingTemplatesUseCase implements UseCase {
    constructor(private mappingRepository: MappingTemplateRepository) {}

    public execute(): FutureData<MappingTemplate[]> {
        return this.mappingRepository.list();
    }
}
