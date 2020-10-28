import { DataValue } from "../domain/entities/DataValue";
import { DataValueRepository } from "../domain/repositories/DataValueRepository";
import { D2Api } from "../types/d2-api";

export class Dhis2DataValueRepository implements DataValueRepository {
    constructor(private api: D2Api) {
        console.log("TOUSE", api)
    }

    async get(): Promise<DataValue[]> {
        return [
            {
                id: "1234",
                period: "2018",
                orgUnit: { id: "1", name: "Algeria" },
                dataSet: { id: "2", name: "Annual data" },
                dataElement: { id: "3", name: "Total population" },
                categoryOptionCombo: { id: "4", name: "default" },
                value: "1234",
                comment: "It looks good",
                lastUpdated: new Date(2020, 10, 20, 23, 10, 53),
                storedBy: { id: "u1", name: "Ignacio Foche" },
            },
        ];
    }
}
