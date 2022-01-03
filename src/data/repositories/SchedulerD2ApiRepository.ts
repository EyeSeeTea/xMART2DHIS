import { Future, FutureData } from "../../domain/entities/Future";
import { SchedulerExecution } from "../../domain/entities/scheduler/SchedulerExecution";
import { SchedulerRepository } from "../../domain/repositories/SchedulerRepository";
import { Namespaces } from "../utils/Namespaces";
import { SchedulerExecutionModel } from "../models/SchedulerExecutionModel";
import { StorageDefaultRepository } from "./StorageDefaultRepository";

export class SchedulerD2ApiRepository implements SchedulerRepository {
    constructor(private dataStoreClient: StorageDefaultRepository) {}

    public updateLastExecution(execution: SchedulerExecution): FutureData<void> {
        const data = SchedulerExecutionModel.encode<SchedulerExecution>(execution);
        return Future.fromPromise(this.dataStoreClient.saveObject<SchedulerExecution>(Namespaces.SCHEDULER_EXECUTIONS, data))
        .flatMapError(error => Future.error(String(error)));
    }

    public getLastExecution(): FutureData<SchedulerExecution> {
        return Future.fromPromise(
            this.dataStoreClient.getOrCreateObject<SchedulerExecution>(Namespaces.SCHEDULER_EXECUTIONS, {}))
            .flatMapError(error => Future.error(String(error)))
            .flatMap(data => Future.fromPurifyEither(SchedulerExecutionModel.decode(data)));
        /*return Future.fromPromise(
            this.dataStoreClient.listObjectsInCollection<SchedulerExecution>(Namespaces.SCHEDULER_EXECUTIONS))
            .flatMapError(error => Future.error(String(error)))
            .flatMap(data => Future.fromPurifyEither(SchedulerExecutionModel.decode(data)));*/

    }
}
