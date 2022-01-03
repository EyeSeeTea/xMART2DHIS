import _, { result } from "lodash";
import { getLogger } from "log4js";
import moment from "moment";
import schedule from "node-schedule";
import { CompositionRoot } from "../compositionRoot";
import { SchedulerInstance } from "./entities/SchedulerConfig";
import { availablePeriods } from "../domain/entities/metadata/DataSyncPeriod";

const DEFAULT_CODE = "__default__";

export default class Scheduler {
    constructor(private instance: SchedulerInstance, private compositionRoot: CompositionRoot) {}

    private synchronizationTask = async (): Promise<void> => {
        try {
            const startTime = new Date();
            //const settings = await this.compositionRoot.settings.get().toPromise();
            //if (!settings.scheduling.enabled) return;

            const syncActions = await this.compositionRoot.actions.list().toPromise();
            //const { period, delay } = settings.scheduling;
            const period = availablePeriods["THIS_MONTH"];
            const delay = 100;
            const frequency = "0 0 0 ? * *";

            const ids = syncActions.map(({ id }) => id);

            getLogger("execution").info(
                `Running actions for ${ids.length} items and delay ${delay}`
            );

            const results = await this.compositionRoot.actions.execute(ids, delay).toPromise();
            results.forEach(result => getLogger("execution").info(`Message: ${result}`));

            const endTime = new Date();
            const duration = moment.duration(endTime.getTime() - startTime.getTime()).asSeconds();
            getLogger("execution").info(`Executed ${ids.length} items in ${duration} seconds`);

            const nextExecution = schedule.scheduledJobs[frequency]?.nextInvocation() ?? startTime;
            await this.compositionRoot.scheduler
                .updateLastExecution({
                    lastExecution: endTime,
                    lastExecutionDuration: duration,
                    results,
                    nextExecution,
                })
                .toPromise();
        } catch (error) {
            getLogger("execution").error(`Failed to run predictions`);
        }
    };

    private fetchTask = async (): Promise<void> => {
        try {
            /*const settings = await this.compositionRoot.settings.get().toPromise();
            if (!settings.scheduling.enabled) {
                this.cancelExistingJobs();
                return;
            }*/

            //const { frequency } = settings.scheduling;
            const frequency = "0 0 0 ? * *";
            const existingJob = schedule.scheduledJobs[frequency];
            if (existingJob) return;

            this.cancelExistingJobs();
            const job = schedule.scheduleJob(frequency, frequency, this.synchronizationTask);
            const nextExecution = job.nextInvocation();
            const nextDate = moment(nextExecution.toISOString()).toISOString(true);
            getLogger("scheduler").info(`Scheduling job at ${nextDate} (${frequency})`);

            const lastExecution = await this.compositionRoot.scheduler.getLastExecution().toPromise();
            await this.compositionRoot.scheduler.updateLastExecution({ ...lastExecution, nextExecution }).toPromise();
        } catch (error) {
            getLogger("scheduler").error(error);
        }
    };

    private cancelExistingJobs(): void {
        const currentJobIds = _.keys(schedule.scheduledJobs);
        const idsToCancel = _.difference(currentJobIds, [DEFAULT_CODE]);
        idsToCancel.forEach((id: string) => {
            getLogger("scheduler").info(`Detected configuration changes. Cancelling old job (${id})`);
            schedule.scheduledJobs[id]?.cancel();
        });
    }

    public initialize(): void {
        // Execute fetch task immediately
        this.fetchTask();

        // Schedule periodic fetch task every minute
        schedule.scheduleJob(DEFAULT_CODE, "0 * * * * *", this.fetchTask);

        getLogger("main").info(
            `Loading configuration for ${this.instance.name} (${this.instance.url}) with user ${this.instance.username}`
        );
    }
}
