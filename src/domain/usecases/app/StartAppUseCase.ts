import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { Mapping } from "../../entities/mapping/Mapping";
import { xMARTdefaultTableCodes } from "../../entities/xmart/xMartSyncTables";
import { MappingRepository } from "../../repositories/MappingRepository";

export class StartAppUseCase implements UseCase {
    constructor(private mappingRepository: MappingRepository) {}

    public execute(): FutureData<void> {
        return this.mappingRepository.list().flatMap(list => {
            return list.length === 0 ? this.createInitialMappings() : Future.success(undefined);
        });
    }

    createInitialMappings(): FutureData<void> {
        return this.mappingRepository.saveList([
            Mapping.build({ modelKey: "dataValues", xMARTTable: xMARTdefaultTableCodes.dataValues }),
            Mapping.build({ modelKey: "events", xMARTTable: xMARTdefaultTableCodes.events }),
            Mapping.build({ modelKey: "eventValues", xMARTTable: xMARTdefaultTableCodes.eventValues }),
            Mapping.build({ modelKey: "teis", xMARTTable: xMARTdefaultTableCodes.teis }),
            Mapping.build({ modelKey: "teiAttributes", xMARTTable: xMARTdefaultTableCodes.teiAttributes }),
            Mapping.build({ modelKey: "enrollments", xMARTTable: xMARTdefaultTableCodes.enrollments }),
        ]);
    }
}
