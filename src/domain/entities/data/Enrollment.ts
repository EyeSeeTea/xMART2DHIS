export const enrollmentStatuses = ["ACTIVE", "COMPLETED", "CANCELLED"] as const;

export type EnrollmentStatus = typeof enrollmentStatuses[number];

export interface Enrollment {
    enrollment: string;
    program: string;
    orgUnit: string;
    trackedEntityInstance: string;
    enrollmentDate: string;
    incidentDate: string;
    created: string;
    createdAtClient: string;
    lastUpdated: string;
    status: EnrollmentStatus;
    followUp: boolean;
    deleted: boolean;
}
