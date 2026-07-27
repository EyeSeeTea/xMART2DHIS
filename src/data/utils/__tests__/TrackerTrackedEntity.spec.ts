import { D2TrackerTrackedEntity, toTrackedEntityInstance } from "../TrackerTrackedEntity";

const teiId = "PQfMcpmXeFE";
const programId = "IpHINAT79UW";
const orgUnitId = "DiszpKrYNg8";

function givenTrackedEntity(partial: Partial<D2TrackerTrackedEntity> = {}): D2TrackerTrackedEntity {
    return {
        trackedEntity: teiId,
        trackedEntityType: "nEenWmSyUEp",
        orgUnit: orgUnitId,
        createdAt: "2014-03-06T05:49:28.256",
        createdAtClient: "2014-03-06T05:49:28.256",
        updatedAt: "2016-08-03T23:49:43.309",
        inactive: false,
        deleted: false,
        programOwners: [{ orgUnit: orgUnitId, program: programId, trackedEntity: teiId }],
        attributes: [
            {
                attribute: "VqEFza8wbwA",
                code: "MMD_PER_ADR1",
                displayName: "Address",
                value: "Main street 2",
                valueType: "TEXT",
                createdAt: "2016-08-03T23:49:43.307",
                updatedAt: "2016-08-03T23:49:43.307",
            },
        ],
        enrollments: [
            {
                enrollment: "HuwtGDVMLNv",
                program: programId,
                orgUnit: orgUnitId,
                trackedEntity: teiId,
                enrolledAt: "2026-01-10T00:00:00.000",
                occurredAt: "2026-01-08T00:00:00.000",
                createdAt: "2014-03-06T05:49:28.256",
                createdAtClient: "2014-03-06T05:49:28.256",
                updatedAt: "2016-08-03T23:49:43.309",
                status: "ACTIVE",
                followUp: false,
                deleted: false,
            },
        ],
        ...partial,
    };
}

describe("toTrackedEntityInstance", () => {
    it("renames the tracker properties to the legacy names used by the xMART tables", () => {
        expect(toTrackedEntityInstance(givenTrackedEntity())).toEqual({
            trackedEntityInstance: teiId,
            trackedEntityType: "nEenWmSyUEp",
            orgUnit: orgUnitId,
            created: "2014-03-06T05:49:28.256",
            createdAtClient: "2014-03-06T05:49:28.256",
            lastUpdated: "2016-08-03T23:49:43.309",
            inactive: false,
            deleted: false,
            programOwners: [{ ownerOrgUnit: orgUnitId, program: programId, trackedEntityInstance: teiId }],
            attributes: [
                {
                    attribute: "VqEFza8wbwA",
                    code: "MMD_PER_ADR1",
                    displayName: "Address",
                    value: "Main street 2",
                    valueType: "TEXT",
                    created: "2016-08-03T23:49:43.307",
                    lastUpdated: "2016-08-03T23:49:43.307",
                },
            ],
            enrollments: [
                {
                    enrollment: "HuwtGDVMLNv",
                    program: programId,
                    orgUnit: orgUnitId,
                    trackedEntityInstance: teiId,
                    enrollmentDate: "2026-01-10T00:00:00.000",
                    incidentDate: "2026-01-08T00:00:00.000",
                    created: "2014-03-06T05:49:28.256",
                    createdAtClient: "2014-03-06T05:49:28.256",
                    lastUpdated: "2016-08-03T23:49:43.309",
                    status: "ACTIVE",
                    followUp: false,
                    deleted: false,
                },
            ],
        });
    });

    it("maps the program owner org unit, which the use case reads to pick the table mapping", () => {
        const owners = toTrackedEntityInstance(givenTrackedEntity()).programOwners;

        expect(owners).toEqual([{ ownerOrgUnit: orgUnitId, program: programId, trackedEntityInstance: teiId }]);
    });

    it("defaults the collections a tracked entity without enrollments or attributes omits", () => {
        const { enrollments: _enrollments, attributes: _attributes, ...bare } = givenTrackedEntity();

        expect(toTrackedEntityInstance(bare)).toMatchObject({ enrollments: [], attributes: [] });
    });
});
