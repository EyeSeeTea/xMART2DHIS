import { Enrollment, EnrollmentStatus } from "../../domain/entities/data/Enrollment";
import { ProgramOwner, TrackedEntityInstance } from "../../domain/entities/data/TrackedEntityInstance";
import { TrakedEntityAttribute } from "../../domain/entities/metadata/TrackedEntityAttribute";

/**
 * The tracker API renamed the tracked entity properties that the rest of the app (and the xMART
 * tables) still refer to by their legacy names, so every read is translated here.
 *
 * These types describe what the endpoint actually returns for the requested fields: d2-api models
 * the tracked entity, but its query parameters are the pre-2.41 ones, so the repository queries the
 * endpoint directly and the response is typed here.
 */
export type D2TrackerProgramOwner = Readonly<{
    orgUnit: string;
    program: string;
    trackedEntity: string;
}>;

export type D2TrackerAttribute = Readonly<{
    attribute: string;
    code?: string;
    displayName: string;
    value: string;
    valueType: string;
    createdAt: string;
    updatedAt: string;
}>;

export type D2TrackerEnrollment = Readonly<{
    enrollment: string;
    program: string;
    orgUnit: string;
    trackedEntity: string;
    enrolledAt: string;
    occurredAt: string;
    createdAt: string;
    createdAtClient: string;
    updatedAt: string;
    status: EnrollmentStatus;
    followUp: boolean;
    deleted: boolean;
}>;

export type D2TrackerTrackedEntity = Readonly<{
    trackedEntity: string;
    trackedEntityType: string;
    orgUnit: string;
    createdAt: string;
    createdAtClient: string;
    updatedAt: string;
    inactive: boolean;
    deleted: boolean;
    programOwners: D2TrackerProgramOwner[];
    enrollments?: D2TrackerEnrollment[];
    attributes?: D2TrackerAttribute[];
}>;

function toProgramOwner(owner: D2TrackerProgramOwner): ProgramOwner {
    return {
        ownerOrgUnit: owner.orgUnit,
        program: owner.program,
        trackedEntityInstance: owner.trackedEntity,
    };
}

function toAttribute(attribute: D2TrackerAttribute): TrakedEntityAttribute {
    return {
        attribute: attribute.attribute,
        code: attribute.code,
        displayName: attribute.displayName,
        value: attribute.value,
        valueType: attribute.valueType,
        created: attribute.createdAt,
        lastUpdated: attribute.updatedAt,
    };
}

function toEnrollment(enrollment: D2TrackerEnrollment): Enrollment {
    return {
        enrollment: enrollment.enrollment,
        program: enrollment.program,
        orgUnit: enrollment.orgUnit,
        trackedEntityInstance: enrollment.trackedEntity,
        enrollmentDate: enrollment.enrolledAt,
        incidentDate: enrollment.occurredAt,
        created: enrollment.createdAt,
        createdAtClient: enrollment.createdAtClient,
        lastUpdated: enrollment.updatedAt,
        status: enrollment.status,
        followUp: enrollment.followUp,
        deleted: enrollment.deleted,
    };
}

export function toTrackedEntityInstance(trackedEntity: D2TrackerTrackedEntity): TrackedEntityInstance {
    return {
        trackedEntityInstance: trackedEntity.trackedEntity,
        trackedEntityType: trackedEntity.trackedEntityType,
        orgUnit: trackedEntity.orgUnit,
        created: trackedEntity.createdAt,
        createdAtClient: trackedEntity.createdAtClient,
        lastUpdated: trackedEntity.updatedAt,
        inactive: trackedEntity.inactive,
        deleted: trackedEntity.deleted,
        programOwners: trackedEntity.programOwners.map(toProgramOwner),
        enrollments: (trackedEntity.enrollments ?? []).map(toEnrollment),
        attributes: (trackedEntity.attributes ?? []).map(toAttribute),
    };
}
