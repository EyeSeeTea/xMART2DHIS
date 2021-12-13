import { NamedRef } from "../../domain/entities/metadata/Ref";

export interface UserSearch {
    users: NamedRef[];
    userGroups: NamedRef[];
}
