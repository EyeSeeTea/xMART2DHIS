import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { SchedulerExecution } from "../../entities/scheduler/SchedulerExecution";
import { SchedulerRepository } from "../../repositories/SchedulerRepository";

export class GetLastSchedulerExecutionUseCase implements UseCase {
    constructor(private schedulerRepository: SchedulerRepository) {}

    public execute(): FutureData<SchedulerExecution> {
        return this.schedulerRepository.getLastExecution();
    }
}
