import _ from "lodash";
import moment, { Moment } from "moment";
import { availablePeriods, DataSyncPeriod } from "./entities/metadata/DataSyncPeriod";
import { IdentifiableObject } from "./entities/metadata/Metadata";

export function cleanOrgUnitPaths(orgUnitPaths: string[]): string[] {
    return orgUnitPaths.map(cleanOrgUnitPath);
}

export function cleanOrgUnitPath(orgUnitPath?: string): string {
    return _(orgUnitPath).split("/").last() ?? "";
}

export function buildPeriodFromParams(params: {
    period: DataSyncPeriod;
    startDate?: Date | string;
    endDate?: Date | string;
}): {
    startDate: Moment;
    endDate: Moment;
} {
    const { period, startDate, endDate } = params;

    if (!period || period === "ALL" || period === "FIXED") {
        return {
            startDate: moment(startDate ?? "1970-01-01"),
            endDate: moment(endDate ?? moment().add(1, "years").endOf("year").format("YYYY-MM-DD")),
        };
    } else if (period === "SINCE_LAST_EXECUTED_DATE") {
        return {
            startDate: moment(startDate ?? "1970-01-01"),
            endDate: moment(),
        };
    }

    const { start, end = start } = availablePeriods[period];
    if (start === undefined || end === undefined) throw new Error("Unsupported period provided");

    const [startAmount, startType] = start;
    const [endAmount, endType] = end;

    return {
        startDate: moment().subtract(startAmount, startType).startOf(startType),
        endDate: moment().subtract(endAmount, endType).endOf(endType),
    };
}

export function generateXMartFieldId(object: IdentifiableObject) {
    return applyXMartCodeRules(object.id);
}

export function generateXMartFieldName(object: IdentifiableObject) {
    return object.formName ?? object.shortName ?? object.name;
}

export function applyXMartCodeRules(value: string) {
    return value.replace(/ |-/g, "_").replace(/\W/g, "");
}
