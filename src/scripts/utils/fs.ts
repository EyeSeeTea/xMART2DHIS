import fs from "fs";
import path from "path";
import { Future, FutureData } from "../../domain/entities/Future";

export function writeFile(file: string, contents: string): FutureData<void> {
    return Future.fromComputation((resolve, reject) => {
        try {
            fs.writeFileSync(file, contents);
            resolve();
        } catch (e) {
            reject(`Couldn't write file ${file}: ${e}`);
        }

        return () => {};
    });
}

export function readFile(file: string, defaultContent: string): FutureData<string> {
    return Future.fromComputation((resolve, reject) => {
        try {
            const contents = fs.readFileSync(file).toString();
            resolve(contents);
        } catch (e: any) {
            if (e.message.indexOf("ENOENT") !== -1) {
                resolve(defaultContent);
            } else {
                reject(`Couldn't read file ${file}: ${e}`);
            }
        }

        return () => {};
    });
}

export function readFolder(path: string): FutureData<string[]> {
    return Future.fromComputation((resolve, reject) => {
        try {
            const files = fs.readdirSync(path);
            resolve(files);
        } catch (e: any) {
            reject(`Couldn't read path ${path}: ${e}`);
        }

        return () => {};
    });
}

export function joinPath(...paths: string[]): string {
    return path.join(...paths);
}
