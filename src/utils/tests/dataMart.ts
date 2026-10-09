import { DataMart } from "../../domain/entities/xmart/DataMart";

/* The UAT mart of the proof of concept, shared by the tests that need a connection. */
export const dataMart: Readonly<DataMart> = {
    id: "dataMartId1",
    name: "Training",
    owner: { id: "userId00001", name: "Admin" },
    created: new Date(2026, 0, 1),
    lastUpdated: new Date(2026, 0, 1),
    lastUpdatedBy: { id: "userId00001", name: "Admin" },
    publicAccess: "--------",
    userAccesses: [],
    userGroupAccesses: [],
    environment: "UAT",
    martCode: "TRAINING_EYESEETEA",
    dataEndpoint: "https://portal-uat.who.int/xmart-api/odata/TRAINING_EYESEETEA",
    connectionWorks: true,
};
