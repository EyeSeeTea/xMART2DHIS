export interface ProgramEvent {
    event?: string;
    orgUnit: string;
    program: string;
    status: string;
    eventDate: string;
    coordinate?: {
        latitude: string;
        longitude: string;
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
