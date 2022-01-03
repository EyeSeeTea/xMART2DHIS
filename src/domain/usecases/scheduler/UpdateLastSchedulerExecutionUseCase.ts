import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { SchedulerExecution } from "../../entities/scheduler/SchedulerExecution";
import { SchedulerRepository } from "../../repositories/SchedulerRepository";

export class UpdateLastSchedulerExecutionUseCase implements UseCase {
    constructor(private schedulerRepository: SchedulerRepository) {}

    public execute(execution: SchedulerExecution): FutureData<void> {
        return this.schedulerRepository.updateLastExecution(execution);
    }
}
