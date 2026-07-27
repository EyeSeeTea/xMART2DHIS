import { ProgramEvent, ProgramEventDataValue, ProgramEventStatus } from "../../domain/entities/data/ProgramEvent";
import { D2TrackerEvent, D2TrackerEventToPost, PartialBy } from "../../types/d2-api";
import { generateUid } from "../../utils/uid";

/**
 * The tracker API renamed the event properties that the rest of the app (and the xMART tables)
 * still refer to by their legacy names, so every read and write is translated here.
 */
type TrackerEventStatus = D2TrackerEvent["status"];

const statusByTrackerStatus: Readonly<Record<TrackerEventStatus, ProgramEventStatus>> = {
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    VISITED: "VISITED",
    SCHEDULE: "SCHEDULED",
    OVERDUE: "OVERDUE",
    SKIPPED: "SKIPPED",
};

const trackerStatusByStatus: Readonly<Record<ProgramEventStatus, TrackerEventStatus>> = {
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    VISITED: "VISITED",
    SCHEDULED: "SCHEDULE",
    OVERDUE: "OVERDUE",
    SKIPPED: "SKIPPED",
};

/**
 * d2-api declares every event property as always present, but a 2.42 instance omits these ones:
 * `orgUnitName` is never returned, and events of programs without registration carry no
 * `scheduledAt`, `storedBy` or `enrollment`.
 */
export type TrackerEventResponse = PartialBy<D2TrackerEvent, "scheduledAt" | "orgUnitName" | "storedBy" | "enrollment">;

export function toProgramEvent(event: TrackerEventResponse): ProgramEvent {
    const { geometry } = event;

    return {
        id: event.event,
        event: event.event,
        orgUnit: event.orgUnit,
        orgUnitName: event.orgUnitName,
        program: event.program,
        programStage: event.programStage,
        enrollment: event.enrollment,
        status: statusByTrackerStatus[event.status],
        eventDate: event.occurredAt,
        /* Events of programs without registration carry no schedule, but `dueDate` is a required
           column of the xMART events table, so it falls back to the occurred date as DHIS2 did. */
        dueDate: event.scheduledAt ?? event.occurredAt,
        created: event.createdAt,
        lastUpdated: event.updatedAt,
        storedBy: event.storedBy,
        coordinate:
            geometry?.type === "Point"
                ? { longitude: geometry.coordinates[0], latitude: geometry.coordinates[1] }
                : undefined,
        attributeOptionCombo: event.attributeOptionCombo,
        attributeCategoryOptions: event.attributeCategoryOptions,
        trackedEntityInstance: event.trackedEntity,
        dataValues: event.dataValues.map(
            ({ dataElement, value, createdAt, updatedAt, storedBy, providedElsewhere }): ProgramEventDataValue => ({
                dataElement,
                value,
                created: createdAt,
                lastUpdated: updatedAt,
                storedBy,
                providedElsewhere,
            })
        ),
    };
}

export function toTrackerEvent(event: ProgramEvent): D2TrackerEventToPost {
    const { coordinate } = event;

    return {
        event: event.event ?? generateUid(),
        orgUnit: event.orgUnit,
        program: event.program,
        programStage: event.programStage ?? "",
        enrollment: event.enrollment,
        status: trackerStatusByStatus[event.status],
        occurredAt: event.eventDate,
        scheduledAt: event.dueDate,
        geometry: coordinate ? { type: "Point", coordinates: [coordinate.longitude, coordinate.latitude] } : undefined,
        attributeOptionCombo: event.attributeOptionCombo,
        attributeCategoryOptions: event.attributeCategoryOptions,
        trackedEntity: event.trackedEntityInstance,
        dataValues: event.dataValues.map(({ dataElement, value, providedElsewhere }) => ({
            dataElement,
            value: String(value),
            providedElsewhere,
        })),
    };
}
