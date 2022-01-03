import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { SyncAction } from "../../entities/actions/SyncAction";
import { ActionRepository } from "../../repositories/ActionRepository";

export class GetMultipleActionsByIdUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository) {}

    public execute(ids: string[]): FutureData<SyncAction[]> {
        return this.actionRepository.getMultipleById(ids);
    }
}
