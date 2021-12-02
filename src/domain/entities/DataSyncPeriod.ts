import i18n from "../../locales";
import { unitOfTime } from "moment";
import { buildObject } from "../../types/utils";

export type DataSyncPeriod =
    | "ALL"
    | "FIXED"
    | "SINCE_LAST_EXECUTED_DATE"
    | "TODAY"
    | "YESTERDAY"
    | "LAST_7_DAYS"
    | "LAST_14_DAYS"
    | "THIS_WEEK"
    | "LAST_WEEK"
    | "THIS_MONTH"
    | "LAST_MONTH"
    | "THIS_QUARTER"
    | "LAST_QUARTER"
    | "THIS_YEAR"
    | "LAST_YEAR";

export const availablePeriods = buildObject<{
    name: string;
    start?: [number, unitOfTime.DurationConstructor];
    end?: [number, unitOfTime.DurationConstructor];
}>()({
    ALL: { name: i18n.t("All time") },
    FIXED: { name: i18n.t("Fixed period") },
    SINCE_LAST_EXECUTED_DATE: { name: i18n.t("Since last execution") },
    TODAY: { name: i18n.t("Today"), start: [0, "day"] },
    YESTERDAY: { name: i18n.t("Yesterday"), start: [1, "day"] },
    LAST_7_DAYS: { name: i18n.t("Last 7 days"), start: [7, "day"], end: [0, "day"] },
    LAST_14_DAYS: { name: i18n.t("Last 14 days"), start: [14, "day"], end: [0, "day"] },
    LAST_30_DAYS: { name: i18n.t("Last 30 days"), start: [30, "day"], end: [0, "day"] },
    LAST_90_DAYS: { name: i18n.t("Last 90 days"), start: [90, "day"], end: [0, "day"] },
    THIS_WEEK: { name: i18n.t("This week"), start: [0, "week"] },
    LAST_WEEK: { name: i18n.t("Last week"), start: [1, "week"] },
    THIS_MONTH: { name: i18n.t("This month"), start: [0, "month"] },
    LAST_MONTH: { name: i18n.t("Last month"), start: [1, "month"] },
    THIS_QUARTER: { name: i18n.t("This quarter"), start: [0, "quarter"] },
    LAST_QUARTER: { name: i18n.t("Last quarter"), start: [1, "quarter"] },
    THIS_YEAR: { name: i18n.t("This year"), start: [0, "year"] },
    LAST_YEAR: { name: i18n.t("Last year"), start: [1, "year"] },
    LAST_FIVE_YEARS: { name: i18n.t("Last 5 years"), start: [5, "year"], end: [1, "year"] },
});

export type PeriodType = keyof typeof availablePeriods;
