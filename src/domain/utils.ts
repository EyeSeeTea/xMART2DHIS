import _ from "lodash";

export function cleanOrgUnitPaths(orgUnitPaths: string[]): string[] {
    return orgUnitPaths.map(cleanOrgUnitPath);
}

export function cleanOrgUnitPath(orgUnitPath?: string): string {
    return _(orgUnitPath).split("/").last() ?? "";
}
