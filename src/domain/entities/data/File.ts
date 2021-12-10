import { Id } from "../metadata/Ref";

export interface FileInfo {
    id?: Id;
    name: string;
    data: Blob;
}
