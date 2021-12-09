import { Future } from "../domain/entities/Future";
import { readFile, writeFile } from "./utils/fs";

const outputFile = "./src/data/utils/action-types.ts";

async function main() {
    const files = [
        "./src/scripts/utils/future-definition.ts",
        "./src/domain/entities/DataValue.ts",
        "./src/domain/entities/User.ts",
        "./src/domain/entities/ImportResult.ts",
        "./src/domain/entities/Metadata.ts",
        "./src/domain/entities/Ref.ts",
        "./src/domain/entities/ProgramEvent.ts",
        "./src/domain/entities/XMart.ts",
        "./src/domain/entities/SyncResult.ts",
        "./src/domain/repositories/InstanceRepository.ts",
        "./src/domain/repositories/MetadataRepository.ts",
        "./src/domain/repositories/AggregatedRepository.ts",
        "./src/domain/repositories/EventsRepository.ts",
        "./src/domain/repositories/XMartRepository.ts",
        "./src/domain/repositories/StorageRepository.ts",
    ];

    const { error } = await Future.parallel(files.map(file => readFile(file, "")))
        .flatMap(results => {
            const types = results
                .join("\n")
                .split("\n")
                .filter(line => !line.startsWith("import"))
                .join("\n")
                .replace(/export/g, "declare");

            const content = `export const actionGlobals = \`${types}\`;`;

            return writeFile(outputFile, content);
        })
        .runAsync();

    if (error) {
        console.error(error);
    } else {
        console.log("Updated action type definition file");
    }
}

main();
