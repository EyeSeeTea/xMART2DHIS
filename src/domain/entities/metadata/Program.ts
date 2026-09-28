import { IdentifiableObject, MetadataEntity } from "./Metadata";
import { Id } from "./Ref";

export interface DataElementRef extends IdentifiableObject {}

export type ProgramStageDataElement = {
    dataElement: DataElementRef;
};

export interface ProgramStage extends IdentifiableObject {
    programStageDataElements: ProgramStageDataElement[];
    program: { id: Id; name: string };
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

export function isTrackerProgram(entity: MetadataEntity): entity is Program {
    return "programType" in entity && entity.programType === "WITH_REGISTRATION";
}
