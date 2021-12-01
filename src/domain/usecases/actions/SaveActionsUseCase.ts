import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { SyncAction } from "../../entities/SyncAction";
import { ActionRepository } from "../../repositories/ActionRepository";

export class SaveActionsUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository) {}

    public execute(action: SyncAction): FutureData<void> {
        return this.actionRepository.save(action);
    }
}
