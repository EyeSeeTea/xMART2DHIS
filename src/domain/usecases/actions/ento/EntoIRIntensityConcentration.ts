import _ from "lodash";
import { getUid } from "../../../../utils/uid";
import { Future, FutureData } from "../../../entities/Future";
import { ProgramEvent, ProgramEventDataValue } from "../../../entities/ProgramEvent";
import { SyncResult } from "../../../entities/SyncResult";
import { XMartContent } from "../../../entities/XMart";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { MetadataRepository } from "../../../repositories/MetadataRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

const PROGRAM_ENTO_IR_INTENSITY_CONCENTRATION = "FUzFm6UEmRn";
const PROGRAM_STAGE_ENTO_IR_INTENSITY_CONCENTRATION = "VkFvRbbpVng";
const INSECTICIDE_CONCENTRATION_5x = "wSwxTH7gZrU";
const INSECTICIDE_CONCENTRATION_10x = "Qr1vkpr9cVA";
const intensity5x = "_5x";
const intensity10x = "_10x";

export default function action(
    martRepository: XMartRepository,
    instanceRepository: InstanceRepository,
    metadataRepository: MetadataRepository
): FutureData<SyncResult> {
    return Future.joinObj({
        metadata5x: metadataRepository.getOptionsFromOptionSet([INSECTICIDE_CONCENTRATION_5x]),
        metadata10x: metadataRepository.getOptionsFromOptionSet([INSECTICIDE_CONCENTRATION_10x]),
        options: martRepository.listAll("ENTO", "FACT_INTENSITY_TEST"),
    }).flatMap(({ metadata5x, metadata10x, options }) => {
        const events: ProgramEvent[] = _(options)
            .groupBy(
                item =>
                    String(item["TEST_ID"])?.replace("_10x", "").replace("_5x", "") ?? getUid(String(item["_RecordID"]))
            )
            .values()
            .map(items => {
                const get = (prop: string) => _.find(items, item => !!item[prop])?.[prop];

                const event =
                    String(get("TEST_ID"))?.replace("_10x", "").replace("_5x", "") ?? getUid(String(get("_RecordID")));
                const orgUnit = get("SITE_FK__SITE");
                const eventDate = get("Sys_FirstCommitDateUtc");
                const categoryOption = get("INSTITUTION_TYPE__CODE");
                const attributeOptionCombo = categoryOptionCombo[String(categoryOption)];

                const insecticide_value = String(get("INSECTICIDE_FK__CODE")) ?? "undefined";
                if (event === "C7KKHfq5XA8") {
                    debugger;
                }
                if (String(get("TEST_ID"))?.includes("_5x")) {
                    const optionSets5x = metadata5x.optionSets ?? [];
                    const codes5x: String[] = optionSets5x.map(options => {
                        const codes = options["options"].map((item: any) => {
                            return String(item.code);
                        });
                        return codes;
                    })[0];

                    if (!codes5x.includes(String(insecticide_value))) {
                        return undefined;
                    }
                } else if (String(get("TEST_ID"))?.includes("_10x")) {
                    const optionSets10x = metadata10x.optionSets ?? [];
                    const codes10x: String[] = optionSets10x.map(options => {
                        const codes = options["options"].map((item: any) => {
                            return String(item.code);
                        });
                        return codes;
                    })[0];

                    if (!codes10x.includes(String(insecticide_value))) {
                        return undefined;
                    }
                }

                if (!event || !orgUnit || !eventDate || !attributeOptionCombo) {
                    return undefined;
                }

                const getByIntensity = (intensity: string) =>
                    items.find((item: XMartContent) => String(item["TEST_ID"]).endsWith(intensity) ?? undefined);

                const item_5 = getByIntensity(intensity5x);
                const item_10 = getByIntensity(intensity10x);
                const item = item_5 ?? item_10;
                return {
                    event: String(event),
                    orgUnit: String(orgUnit),
                    program: PROGRAM_ENTO_IR_INTENSITY_CONCENTRATION,
                    status: "COMPLETED",
                    eventDate: new Date(String(eventDate)).toISOString(),
                    attributeOptionCombo: String(attributeOptionCombo),
                    programStage: PROGRAM_STAGE_ENTO_IR_INTENSITY_CONCENTRATION,
                    dataValues: _.compact([
                        mapField(item, "CITATION"),
                        mapField(item, "INSTITUTION_FK"),
                        mapField(item, "MONTH_END"),
                        mapField(item, "MONTH_START"),
                        mapField(item, "PUB_LINK"),
                        mapField(item, "PUBLISHED"),
                        mapField(item, "SPECIES_CONTROL_FK__CODE"),
                        mapField(item, "SPECIES_FK__CODE"),
                        mapField(item, "STAGE_ORIGIN_FK__CODE"),
                        mapField(item, "YEAR_END"),
                        mapField(item, "YEAR_START"),
                        mapField(item, "TEST_TIME_FK__CODE"),
                        mapField(item, "TEST_TYPE_FK__CODE"),
                        mapField(item_5, "INSECTICIDE_FK__CODE", intensity5x),
                        mapField(item_5, "NUMBER_MOSQ_CONTROL", intensity5x),
                        mapField(item_5, "MORTALITY_NUMBER", intensity5x),
                        mapField(item_5, "NUMBER_MOSQ_EXP", intensity5x),
                        mapField(item_5, "ADJ_MORTALITY_PERCENT_1X", intensity5x),
                        mapField(item_5, "INSECTICIDE_FK__CODE", intensity5x),
                        mapField(item_5, "NUMBER_MOSQ_CONTROL", intensity5x),
                        mapField(item_5, "MORTALITY_NUMBER", intensity5x),
                        mapField(item_5, "NUMBER_MOSQ_EXP", intensity5x),
                        mapField(item_5, "NUMBER_MOSQ_CONTROL_DEAD", intensity5x),
                        mapField(item, "MORTALITY_PERCENT", intensity5x),
                        mapField(item_5, "MORTALITY_CONTROL", intensity5x),
                        mapField(item_10, "INSECTICIDE_FK__CODE", intensity10x),
                        mapField(item_10, "NUMBER_MOSQ_CONTROL", intensity10x),
                        mapField(item_10, "MORTALITY_NUMBER", intensity10x),
                        mapField(item_10, "NUMBER_MOSQ_EXP", intensity10x),
                        mapField(item_10, "ADJ_MORTALITY_PERCENT_1X", intensity10x),
                        mapField(item_10, "NUMBER_MOSQ_CONTROL", intensity10x),
                        mapField(item_10, "MORTALITY_NUMBER", intensity10x),
                        mapField(item_10, "NUMBER_MOSQ_EXP", intensity10x),
                        mapField(item_10, "NUMBER_MOSQ_CONTROL_DEAD", intensity10x),
                        mapField(item_10, "MORTALITY_PERCENT", intensity10x),
                        mapField(item_10, "MORTALITY_CONTROL", intensity10x),
                    ]),
                };
            })
            .compact()
            .value();

        return instanceRepository.postEvents(events, { orgUnitIdScheme: "CODE" });
    });
}

function mapField(
    item: XMartContent | undefined,
    field: keyof typeof dhisId,
    type = "_5x"
): ProgramEventDataValue | undefined {
    if (!item) return undefined;

    const opossit = typeOpposit[type];
    const getKeyByIntensity = (prop: string) =>
        String(item["TEST_ID"]).endsWith(type) ? `${prop}${type}` : `${prop}${opossit}`;

    const keyByIntensity = String(getKeyByIntensity(field));
    const dataElement = dhisId[keyByIntensity] ?? dhisId[field];

    if (field === "SPECIES_CONTROL_FK__CODE" || field === "SPECIES_FK__CODE") {
        if (item[field] === "STEPHENSI_SL") {
            item[field] = "STEPHENSI";
        } else if (item[field] === "NA" || item[field] === "NR" || item[field] === "ANOPHELES_SSP") {
            item[field] = "";
        }
    }

    //todo comment, dhis can't import false boolean with boolean format
    const value_formatter = item[field];
    if (String(value_formatter) === "true" || String(value_formatter) === "false" || String(value_formatter) === "0") {
        const value = String(value_formatter);
        return dataElement && value ? { dataElement, value } : undefined;
    }
    const value = item[field];

    return dataElement && value && value !== "null" ? { dataElement, value } : undefined;
}

const typeOpposit: Record<string, string> = {
    _5X: "_10X",
    _10X: "_5X",
};

const dhisId: Record<string, string> = {
    CITATION: "SPA9WRC0s7V",
    INSTITUTION_FK: "l7iRc4fVcRO",
    MONTH_END: "nJGsnuqueOI",
    MONTH_START: "aNTjTSnE4n3",
    PUB_LINK: "WJYxfzHrmQj",
    PUBLISHED: "z5o0lM2Cbus",
    SPECIES_CONTROL_FK__CODE: "yGY1TUqZsNf",
    SPECIES_FK__CODE: "gXKPOItwUlb",
    STAGE_ORIGIN_FK__CODE: "gqhSHmY7Etl",
    YEAR_END: "sxLgkqTWM1c",
    YEAR_START: "EvSWXtVdh6h",
    TEST_TIME_FK__CODE: "v86CHHosXCi",
    TEST_TYPE_FK__CODE: "NGU9TjLZcBg",
    ADJ_MORTALITY_PERCENT_1X_5x: "hjdSAokENFs",
    INSECTICIDE_FK__CODE_5x: "mspNBRCNrPh",
    NUMBER_MOSQ_CONTROL_5x: "RtoQzWkv24k",
    MORTALITY_NUMBER_5x: "WoM25CEOaad",
    NUMBER_MOSQ_EXP_5x: "TqBMpf6rqzO",
    NUMBER_MOSQ_CONTROL_DEAD_5x: "t56tmxcUp9k",
    MORTALITY_PERCENT_5x: "PZkQYWAXzEp",
    MORTALITY_CONTROL_5x: "w3MUVmiJHkx",
    ADJ_MORTALITY_PERCENT_1X_10x: "mcRgVtgwevL",
    INSECTICIDE_FK__CODE_10x: "xiFX4d6U2WG",
    NUMBER_MOSQ_CONTROL_10x: "LFxCOJqeFxz",
    MORTALITY_NUMBER_10x: "Dz489B9dDqQ",
    NUMBER_MOSQ_EXP_10x: "NkFOQ7gLyqW",
    NUMBER_MOSQ_CONTROL_DEAD_10x: "yo1z2WcralS",
    MORTALITY_PERCENT_10x: "d1xD0dVVkvA",
    MORTALITY_CONTROL_10x: "AtCCOFce42U",
};

const categoryOptionCombo: Record<string, string> = {
    adHe8ZqTLGQ: "VIsmG1pMMgI",
    MFYaHarMqU1: "PR1plsTJJER",
    U9ryfMWEJwI: "OVcRgB8Fe13",
};
