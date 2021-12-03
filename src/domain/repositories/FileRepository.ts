import { FileInfo } from "../entities/File";
import { FutureData } from "../entities/Future";

export interface FileRepository {
    uploadFileAsExternal(fileInfo: FileInfo): FutureData<string>;
}
