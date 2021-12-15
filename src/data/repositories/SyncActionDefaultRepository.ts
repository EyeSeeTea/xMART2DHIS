import * as ts from "typescript";
import { Future, FutureData } from "../../domain/entities/Future";
import { SyncAction } from "../../domain/entities/actions/SyncAction";
import { InstanceRepository } from "../../domain/repositories/InstanceRepository";
import { SyncActionRepository } from "../../domain/repositories/SyncActionRepository";
import { XMartRepository } from "../../domain/repositories/XMartRepository";

export class SyncActionDefaultRepository implements SyncActionRepository {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) {}

    public execute(_action: SyncAction): FutureData<void> {
        return Future.fromPromise(this.runPromise(""));
    }

    private async runPromise(code: string) {
        const jsCode = ts.transpile([`"use strict";`, code, "({ execute })"].join("\n"));
        const runtime = eval(jsCode);
        const result = await runtime.execute(this.martRepository, this.instanceRepository);
        return result;
    }
}
