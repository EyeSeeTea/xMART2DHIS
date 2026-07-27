export const programEventStatuses = ["ACTIVE", "COMPLETED", "VISITED", "SCHEDULED", "OVERDUE", "SKIPPED"] as const;

export type ProgramEventStatus = typeof programEventStatuses[number];

/**
 * Legacy (pre-tracker) event shape. It is kept stable on purpose: these property names are the
 * column codes of the xMART events/eventValues tables and the contract exposed to user-written
 * sync actions. The data layer translates to and from the DHIS2 tracker API naming.
 */
export interface ProgramEvent {
    id?: string;
    event?: string;
    orgUnit: string;
    orgUnitName?: string;
    program: string;
    programStage?: string;
    enrollment?: string;
    status: ProgramEventStatus;
    eventDate: string;
    dueDate?: string;
    created?: string;
    lastUpdated?: string;
    storedBy?: string;
    coordinate?: {
        latitude: number;
        longitude: number;
    };
    attributeOptionCombo?: string;
    attributeCategoryOptions?: string;
    trackedEntityInstance?: string;
    dataValues: ProgramEventDataValue[];
}

export interface ProgramEventDataValue {
    dataElement: string;
    value: string | number | boolean;
    created?: string;
    lastUpdated?: string;
    storedBy?: string;
    providedElsewhere?: boolean;
}
