import _ from "lodash";
import { NamedRef } from "../../domain/entities/Ref";

export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    userGroups: NamedRef[];
    userRoles: UserRole[];
    organisationUnits: NamedRef[];
    dataViewOrganisationUnits: NamedRef[];
    isGlobalAdmin: boolean;
    isAppConfigurator: boolean;
    isAppExecutor: boolean;
}

export interface UserRole extends NamedRef {
    authorities: string[];
}
