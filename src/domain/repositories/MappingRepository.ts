import { FutureData } from "../entities/Future";
import { Mapping } from "../entities/mapping/Mapping";

export interface MappingRepository {
    list(): FutureData<Mapping[]>;
    save(mappings: Mapping): FutureData<void>;
    saveList(mappings: Mapping[]): FutureData<void>;
}
