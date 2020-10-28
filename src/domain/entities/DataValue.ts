import { Id, NamedRef } from "./Base";

export interface DataValue {
    id: Id;
    period: string;
    orgUnit: NamedRef;
    dataSet: NamedRef;
    dataElement: NamedRef;
    categoryOptionCombo: NamedRef;
    value: string;
    comment: string | undefined;
    lastUpdated: Date;
    storedBy: NamedRef;
}
