import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { SyncAction } from "../../entities/actions/SyncAction";
import { ActionRepository } from "../../repositories/ActionRepository";

export class GetActionByIdUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository) {}

    public execute(id: string): FutureData<SyncAction | undefined> {
        return this.actionRepository.getById(id);
    }
}
