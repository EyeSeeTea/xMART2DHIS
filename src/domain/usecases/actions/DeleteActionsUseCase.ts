import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { ActionRepository } from "../../repositories/ActionRepository";

export class DeleteActionsUseCase implements UseCase {
    constructor(private actionRepository: ActionRepository) {}

    public execute(ids: string[]): FutureData<void> {
        return this.actionRepository.delete(ids);
    }
}
