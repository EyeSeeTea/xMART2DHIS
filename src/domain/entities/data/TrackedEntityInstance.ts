import { Enrollment } from "./Enrollment";
import { TrakedEntityAttribute } from "../metadata/TrackedEntityAttribute";

export interface ProgramOwner {
    ownerOrgUnit: string;
    program: string;
    trackedEntityInstance: string;
}

/**
 * Legacy (pre-tracker) tracked entity shape. As with ProgramEvent, the property names are kept
 * because they are the column codes of the xMART teis, teiAttributes and enrollments tables, so
 * the translation to and from the tracker API naming lives in the data layer.
 */
export interface TrackedEntityInstance {
    trackedEntityInstance: string;
    trackedEntityType: string;
    orgUnit: string;
    created: string;
    createdAtClient: string;
    lastUpdated: string;
    inactive: boolean;
    deleted: boolean;
    programOwners: ProgramOwner[];
    enrollments: Enrollment[];
    attributes: TrakedEntityAttribute[];
}
