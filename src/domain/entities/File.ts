import { Id } from "./Ref";

export interface FileInfo {
    id?: Id;
    name: string;
    data: Blob;
}
