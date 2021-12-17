import { IdentifiableObject } from "./Metadata";

export interface DataElementRef extends IdentifiableObject {}

export type ProgramStageDataElement = {
    dataElement: DataElementRef;
};

export interface ProgramStage extends IdentifiableObject {
    programStageDataElements: ProgramStageDataElement[];
}

export interface TrackedEntityAttribute extends IdentifiableObject {}

export type ProgramTrackedEntityAttribute = {
    trackedEntityAttribute: TrackedEntityAttribute;
};

export interface Program extends IdentifiableObject {
    programType: "WITH_REGISTRATION" | "WITHOUT_REGISTRATION";
    programStages: ProgramStage[];
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
}
