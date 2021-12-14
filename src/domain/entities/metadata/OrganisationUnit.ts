import { Id } from "./Ref";

export type OrganisationUnit = {
    id: Id;
    name: string;
    code: string;
    displayName: string;
    path: string;
};
