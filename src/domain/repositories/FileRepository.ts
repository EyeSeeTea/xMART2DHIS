import { FileInfo } from "../entities/data/File";
import { FutureData } from "../entities/Future";

export interface FileRepository {
    uploadFileAsExternal(fileInfo: FileInfo): FutureData<UploadedFile>;
    removeFile(id: string): FutureData<void>;
}

export interface UploadedFile {
    id: string;
    url: string;
}
