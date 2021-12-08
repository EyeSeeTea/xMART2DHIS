import { FutureData } from "../entities/Future";
import { MappingTemplate } from "../entities/mapping-template/MappingTemplate";

export interface MappingTemplateRepository {
    list(): FutureData<MappingTemplate[]>;
    getByIds(mappingIds: string[]): FutureData<MappingTemplate[]>;
    getById(mappingId: string): FutureData<MappingTemplate>;
    save(mappings: MappingTemplate): FutureData<void>;
    saveList(mappings: MappingTemplate[]): FutureData<void>;
}
