import { SharedRef } from "../metadata/Ref";

export type ConnectionType = "xmart" | "dhis2" | "local-dhis2";

export interface Connection extends SharedRef {
    type: ConnectionType;
}
