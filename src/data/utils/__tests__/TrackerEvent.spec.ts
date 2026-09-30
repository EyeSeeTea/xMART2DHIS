import { describe, expect, it } from "vitest";
import { toProgramEvent, TrackerEventResponse } from "../TrackerEvent";

const eventId = "OrGKZQFhLnE";

function givenTrackerEvent(partialEvent: Partial<TrackerEventResponse> = {}): TrackerEventResponse {
    return {
        event: eventId,
        status: "COMPLETED",
        program: "eBAyeGv0exc",
        programStage: "Zj7UnCAulEk",
        enrollment: "HuwtGDVMLNv",
        orgUnit: "DiszpKrYNg8",
        orgUnitName: "Ngelehun CHC",
        occurredAt: "2026-07-20T00:00:00.000",
        scheduledAt: "2026-07-25T00:00:00.000",
        storedBy: "android",
        createdAt: "2026-07-21T09:00:00.000",
        updatedAt: "2026-07-22T09:00:00.000",
        attributeOptionCombo: "HllvX50cXC0",
        attributeCategoryOptions: "xYerKDKCefk",
        dataValues: [
            {
                dataElement: "qrur9Dvnyt5",
                value: "42",
                createdAt: "2026-07-21T09:00:00.000",
                updatedAt: "2026-07-22T09:00:00.000",
                storedBy: "android",
                providedElsewhere: false,
            },
        ],
        ...partialEvent,
    };
}

describe("toProgramEvent", () => {
    it("renames the tracker properties to the legacy names used by the xMART tables", () => {
        expect(toProgramEvent(givenTrackerEvent())).toEqual({
            id: eventId,
            event: eventId,
            orgUnit: "DiszpKrYNg8",
            orgUnitName: "Ngelehun CHC",
            program: "eBAyeGv0exc",
            programStage: "Zj7UnCAulEk",
            enrollment: "HuwtGDVMLNv",
            status: "COMPLETED",
            eventDate: "2026-07-20T00:00:00.000",
            dueDate: "2026-07-25T00:00:00.000",
            created: "2026-07-21T09:00:00.000",
            lastUpdated: "2026-07-22T09:00:00.000",
            storedBy: "android",
            coordinate: undefined,
            attributeOptionCombo: "HllvX50cXC0",
            attributeCategoryOptions: "xYerKDKCefk",
            trackedEntityInstance: undefined,
            dataValues: [
                {
                    dataElement: "qrur9Dvnyt5",
                    value: "42",
                    created: "2026-07-21T09:00:00.000",
                    lastUpdated: "2026-07-22T09:00:00.000",
                    storedBy: "android",
                    providedElsewhere: false,
                },
            ],
        });
    });

    it("translates the SCHEDULE status back to the legacy SCHEDULED value", () => {
        expect(toProgramEvent(givenTrackerEvent({ status: "SCHEDULE" })).status).toBe("SCHEDULED");
    });

    it("converts a point geometry into latitude and longitude", () => {
        const event = givenTrackerEvent({ geometry: { type: "Point", coordinates: [-13.2317, 8.4657] } });

        expect(toProgramEvent(event).coordinate).toEqual({ longitude: -13.2317, latitude: 8.4657 });
    });

    it("ignores non-point geometries, which have no legacy representation", () => {
        const event = givenTrackerEvent({
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [-13.2317, 8.4657],
                        [-13.23, 8.46],
                        [-13.2317, 8.4657],
                    ],
                ],
            },
        });

        expect(toProgramEvent(event).coordinate).toBeUndefined();
    });

    it("falls back to the occurred date when a program without registration has no schedule", () => {
        const { scheduledAt: _scheduledAt, ...unscheduled } = givenTrackerEvent();

        expect(toProgramEvent(unscheduled).dueDate).toBe("2026-07-20T00:00:00.000");
    });

    it("maps the tracked entity to the legacy trackedEntityInstance", () => {
        expect(toProgramEvent(givenTrackerEvent({ trackedEntity: "uhubxsfLanZ" })).trackedEntityInstance).toBe(
            "uhubxsfLanZ"
        );
    });
});
