import { FileInfo } from "../entities/data/File";
import { FutureData } from "../entities/Future";

export interface FileRepository {
    uploadFileAsExternal(fileInfo: FileInfo): FutureData<string>;
}
