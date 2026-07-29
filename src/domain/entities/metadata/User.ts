import { NamedRef } from "./Ref";
import _ from "lodash";

export interface User {
    id: string;
    name: string;
    username: string;
    userRoles: UserRole[];
    userGroups: NamedRef[];
}

export interface UserRole extends NamedRef {
    authorities: string[];
}

export const isSuperAdmin = (user: User): boolean => {
    return _.some(user.userRoles, ({ authorities }) => authorities.includes("ALL"));
};
