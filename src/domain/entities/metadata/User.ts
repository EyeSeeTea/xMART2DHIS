import { NamedRef } from "./Ref";
import _ from "lodash";

export interface User {
    id: string;
    name: string;
    username: string;
    firstName: string;
    surname: string;
    email: string;
    lastUpdated: string;
    created: string;
    apiUrl: string;
    userRoles: UserRole[];
    userGroups: NamedRef[];
    organisationUnits: NamedRef[];
    dataViewOrganisationUnits: NamedRef[];
    lastLogin?: string;
    disabled: boolean;
    access: AccessPermissions;
    openId?: string;
}

export interface AccessPermissions {
    read?: boolean;
    update?: boolean;
    externalize?: boolean;
    delete?: boolean;
    write?: boolean;
    manage?: boolean;
}

export interface UserRole extends NamedRef {
    authorities: string[];
}

export const isSuperAdmin = (user: User): boolean => {
    return _.some(user.userRoles, ({ authorities }) => authorities.includes("ALL"));
};
