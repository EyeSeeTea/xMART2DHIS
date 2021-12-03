import { Id } from "./Ref";

export type OrganisationUnit = {
    id: Id;
    name: string;
    displayName: string;
    path: string;
};
