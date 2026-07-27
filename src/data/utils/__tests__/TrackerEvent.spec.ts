import { ProgramEvent } from "../../../domain/entities/data/ProgramEvent";
import { D2TrackerEvent } from "../../../types/d2-api";
import { toProgramEvent, toTrackerEvent, TrackerEventResponse } from "../TrackerEvent";

const eventId = "OrGKZQFhLnE";
const userInfo = { uid: "M5zQapPyTZI", username: "android", firstName: "John", surname: "Traore" };

function givenTrackerEvent(partialEvent: Partial<D2TrackerEvent> = {}): TrackerEventResponse {
    return {
        event: eventId,
        status: "COMPLETED",
        program: "eBAyeGv0exc",
        programStage: "Zj7UnCAulEk",
        enrollment: "HuwtGDVMLNv",
        enrollmentStatus: "ACTIVE",
        orgUnit: "DiszpKrYNg8",
        orgUnitName: "Ngelehun CHC",
        occurredAt: "2026-07-20T00:00:00.000",
        scheduledAt: "2026-07-25T00:00:00.000",
        storedBy: "android",
        followup: false,
        deleted: false,
        createdAt: "2026-07-21T09:00:00.000",
        updatedAt: "2026-07-22T09:00:00.000",
        createdBy: userInfo,
        updatedBy: userInfo,
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
        notes: [],
        ...partialEvent,
    };
}

function givenProgramEvent(partialEvent: Partial<ProgramEvent> = {}): ProgramEvent {
    return {
        event: eventId,
        orgUnit: "DiszpKrYNg8",
        program: "eBAyeGv0exc",
        programStage: "Zj7UnCAulEk",
        status: "ACTIVE",
        eventDate: "2026-07-20T00:00:00.000",
        dataValues: [{ dataElement: "qrur9Dvnyt5", value: 42 }],
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

describe("toTrackerEvent", () => {
    it("renames the legacy properties to the tracker names", () => {
        const event = givenProgramEvent({
            dueDate: "2026-07-25T00:00:00.000",
            enrollment: "HuwtGDVMLNv",
            attributeOptionCombo: "HllvX50cXC0",
            attributeCategoryOptions: "xYerKDKCefk",
            trackedEntityInstance: "uhubxsfLanZ",
        });

        expect(toTrackerEvent(event)).toEqual({
            event: eventId,
            orgUnit: "DiszpKrYNg8",
            program: "eBAyeGv0exc",
            programStage: "Zj7UnCAulEk",
            enrollment: "HuwtGDVMLNv",
            status: "ACTIVE",
            occurredAt: "2026-07-20T00:00:00.000",
            scheduledAt: "2026-07-25T00:00:00.000",
            geometry: undefined,
            attributeOptionCombo: "HllvX50cXC0",
            attributeCategoryOptions: "xYerKDKCefk",
            trackedEntity: "uhubxsfLanZ",
            dataValues: [{ dataElement: "qrur9Dvnyt5", value: "42", providedElsewhere: undefined }],
        });
    });

    it("translates the legacy SCHEDULED status to the tracker SCHEDULE value", () => {
        expect(toTrackerEvent(givenProgramEvent({ status: "SCHEDULED" })).status).toBe("SCHEDULE");
    });

    it("serialises non-string data values, which the tracker importer rejects", () => {
        const event = givenProgramEvent({
            dataValues: [
                { dataElement: "qrur9Dvnyt5", value: 42 },
                { dataElement: "oZg33kd9taw", value: true },
            ],
        });

        expect(toTrackerEvent(event).dataValues.map(({ value }) => value)).toEqual(["42", "true"]);
    });

    it("converts latitude and longitude into a point geometry", () => {
        const event = givenProgramEvent({ coordinate: { latitude: 8.4657, longitude: -13.2317 } });

        expect(toTrackerEvent(event).geometry).toEqual({ type: "Point", coordinates: [-13.2317, 8.4657] });
    });

    it("generates an identifier for new events, which the tracker importer requires", () => {
        const { event: _event, ...newEvent } = givenProgramEvent();

        expect(toTrackerEvent(newEvent).event).toMatch(/^[a-zA-Z][a-zA-Z0-9]{10}$/);
    });
});
