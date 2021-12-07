import { SharingSetting } from "./SharingSetting";

export type Id = string;

export interface Ref {
    id: Id;
}

export interface NamedRef extends Ref {
    name: string;
}

export interface DatedRef extends NamedRef {
    user: NamedRef;
    created: Date;
    lastUpdated: Date;
    lastUpdatedBy: NamedRef;
}

export interface IdentifiableRef extends NamedRef {
    shortName?: string;
    code?: string;
    path?: string;
    level?: number;
}

export interface SharedRef extends DatedRef {
    publicAccess: string;
    userAccesses: SharingSetting[];
    userGroupAccesses: SharingSetting[];
}
