import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { SyncAction } from "../../entities/actions/SyncAction";
import { ActionRepository } from "../../repositories/ActionRepository";

export class GetActionsUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository) {}

    public execute(): FutureData<SyncAction[]> {
        return this.actionRepository.list();
    }
}
