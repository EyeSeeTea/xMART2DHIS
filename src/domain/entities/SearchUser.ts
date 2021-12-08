import { NamedRef } from "../../domain/entities/Ref";

export interface UserSearch {
    users: NamedRef[];
    userGroups: NamedRef[];
}