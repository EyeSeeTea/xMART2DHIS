import { Codec, Schema } from "../../utils/codec";
import { InstanceData } from "../../domain/entities/instance/Instance";

export const ConfigModel: Codec<SchedulerConfig> = Schema.object({
    instance: Schema.object({
        name: Schema.string,
        url: Schema.string,
        username: Schema.string,
        password: Schema.string,
    }),
});

export interface SchedulerInstance {
    name: string;
    url: string;
    username: string;
    password: string;
}

export interface SchedulerConfig {
    instance: SchedulerInstance;
}
