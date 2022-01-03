import { command, option, run, string } from "cmd-ts";
import "dotenv/config";
import fs from "fs";
import { configure, getLogger } from "log4js";
import path from "path";
import { CompositionRoot, getCompositionRoot } from "../compositionRoot";
import { Future, FutureData } from "../domain/entities/Future";
import { ConfigModel } from "./entities/SchedulerConfig";
import Scheduler from "./scheduler";
import { Instance } from "../domain/entities/instance/Instance";

const development = process.env.NODE_ENV === "development";

configure({
    appenders: {
        out: { type: "stdout" },
        file: { type: "file", filename: "debug.log" },
    },
    categories: { default: { appenders: ["file", "out"], level: development ? "all" : "debug" } },
});

/*const checkMigrations = (compositionRoot: CompositionRoot): FutureData<boolean> => {
    return Future.fromPromise(compositionRoot.migrations.hasPending())
        .mapError(() => {
            return "Unable to connect with remote instance";
        })
        .flatMap(pendingMigrations => {
            if (pendingMigrations) {
                return Future.error<string, boolean>("There are pending migrations, unable to continue");
            }

            return Future.success(pendingMigrations);
        });
};*/

async function main() {
    const cmd = command({
        name: path.basename(__filename),
        description: "Scheduler to execute actions on multiple XMART instances",
        args: {
            config: option({
                type: string,
                long: "config",
                short: "c",
                description: "Configuration file",
            }),
        },
        handler: async args => {
            try {
                const text = fs.readFileSync(args.config, "utf8");
                const contents = JSON.parse(text);
                const config = ConfigModel.unsafeDecode(contents);
                //const compositionRoot = getCompositionRoot(config.instance);
                const compositionRoot = getCompositionRoot(
                    new Instance({
                        ...config.instance,
                    })
                );
                //await checkMigrations(compositionRoot).toPromise();

                new Scheduler(config.instance, compositionRoot).initialize();
            } catch (err) {
                getLogger("main").fatal(err);
                process.exit(1);
            }
        },
    });

    run(cmd, process.argv.slice(2));
}

main();
