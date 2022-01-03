import { SchedulerExecution } from "../../domain/entities/scheduler/SchedulerExecution";
import { Codec, Schema } from "../../utils/codec";
import { RefModel } from "./RefModel";

export const SchedulerExecutionModel: Codec<SchedulerExecution> = Schema.object({
   // id: Schema.string,
    lastExecutionDuration: Schema.optional(Schema.number),
    lastExecution: Schema.optional(Schema.date),
    nextExecution: Schema.optional(Schema.date),
    results: Schema.optional(Schema.string),
});
