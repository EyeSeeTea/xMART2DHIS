export interface ProgramEvent {
    event?: string;
    orgUnit: string;
    program: string;
    status: "ACTIVE" | "COMPLETED" | "VISITED" | "SCHEDULED" | "OVERDUE" | "SKIPPED";
    eventDate: string;
    coordinate?: {
        latitude: number;
        longitude: number;
    };
    attributeOptionCombo?: string;
    attributeCategoryOptions?: string;
    trackedEntityInstance?: string;
    programStage?: string;
    dataValues: ProgramEventDataValue[];
}

export interface ProgramEventDataValue {
    dataElement: string;
    value: string | number | boolean;
}
