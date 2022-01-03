import { FutureData } from "../entities/Future";
import { SchedulerExecution } from "../entities/scheduler/SchedulerExecution";

export interface SchedulerRepository {
    updateLastExecution(execution: SchedulerExecution): FutureData<void>;
    getLastExecution(): FutureData<SchedulerExecution>;
}
