import _, { } from "lodash";
import { UseCase } from "../../../compositionRoot";
import { getUid } from "../../../utils/uid";
import { Future } from "../../entities/Future";
import { ProgramEvent, ProgramEventDataValue } from "../../entities/ProgramEvent";
import { SynchronizationResult } from "../../entities/SynchronizationResult";
import { XMartContent } from "../../entities/XMart";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

export class EntoIRIntensityConcentrationUseCase implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) { }

    public execute(): Future<string, SynchronizationResult> {
        const PROGRAM_ENTO_IR_INTENSITY_CONCENTRATION = "FUzFm6UEmRn";
        const PROGRAM_STAGE_ENTO_IR_INTENSITY_CONCENTRATION = "VkFvRbbpVng";
        const intensity5x = "_x5"
        const intensity10x = "_x10"

        return this.martRepository
            .listAll("FACT_INTENSITY_TEST")
            .map(options => {

                const events: ProgramEvent[] =
                    _(options).groupBy(item => item["PAIRING_CODE_INTENSITY"] ?? getUid(String(item["_RecordID"]))).values().map(
                        items => {
                            const get = (prop: string) => _.find(items, item => !!item[prop])?.[prop];

                            const event = get("PAIRING_CODE_INTENSITY") ?? getUid(String(get("_RecordID")));
                            const orgUnit = get("SITE_FK__SITE");
                            const eventDate = get("Sys_FirstCommitDateUtc");
                            const categoryOption = get("INSTITUTION_TYPE__CODE");
                            const attributeOptionCombo = categoryOptionCombo[String(categoryOption)];

                            if (!event || !orgUnit || !eventDate || !attributeOptionCombo) {
                                return undefined;
                            }

                            const getByIntensity = (intensity: string) => items.find((item: XMartContent) =>
                                (String(item["TEST_ID"]).endsWith(intensity)) ? item : undefined
                            );

                            const item_5 = getByIntensity(intensity5x)
                            const item_10 = getByIntensity(intensity10x)
                            return {
                                event: String(event),
                                orgUnit: String(orgUnit),
                                program: PROGRAM_ENTO_IR_INTENSITY_CONCENTRATION,
                                status: "COMPLETED",
                                eventDate: new Date(String(eventDate)).toISOString(),
                                attributeOptionCombo: String(attributeOptionCombo),
                                programStage: PROGRAM_STAGE_ENTO_IR_INTENSITY_CONCENTRATION,
                                dataValues: _.compact([
                                    mapField(item_5, "CITATION"),
                                    mapField(item_5, "INSTITUTION_FK"),
                                    mapField(item_5, "MONTH_END"),
                                    mapField(item_5, "MONTH_START"),
                                    mapField(item_5, "PUB_LINK"),
                                    mapField(item_5, "PUBLISHED"),
                                    mapField(item_5, "SPECIES_CONTROL_FK__CODE"),
                                    mapField(item_5, "SPECIES_FK__CODE"),
                                    mapField(item_5, "STAGE_ORIGIN_FK__CODE"),
                                    mapField(item_5, "YEAR_END"),
                                    mapField(item_5, "YEAR_START"),
                                    mapField(item_5, "TEST_TIME_FK__CODE"),
                                    mapField(item_5, "TEST_TYPE_FK__CODE"),
                                    mapField(item_5, "INSECTICIDE_FK__CODE"),
                                    mapField(item_5, "NUMBER_MOSQ_CONTROL", intensity5x),
                                    mapField(item_5, "MORTALITY_NUMBER", intensity5x),
                                    mapField(item_5, "NUMBER_MOSQ_EXP", intensity5x),
                                    mapField(item_5, "ADJ_MORTALITY_PERCENT_1X", intensity5x),
                                    mapField(item_10, "NUMBER_MOSQ_CONTROL", intensity10x),
                                    mapField(item_10, "MORTALITY_NUMBER", intensity10x),
                                    mapField(item_10, "NUMBER_MOSQ_EXP", intensity10x),
                                    mapField(item_10, "ADJ_MORTALITY_PERCENT_1X", intensity10x),
                                ]),
                            };
                        }

                    ).compact().value()
                return events;
            })
            .flatMap(events => {
                return this.instanceRepository.postEvents(events, { orgUnitIdScheme: "CODE" });
            });
    }
}

function mapField(item: XMartContent | undefined, field: keyof typeof dhisId, type = "_x5"): ProgramEventDataValue | undefined {
    if (!item) return undefined;

    const opossit = typeOpposit[type]
    const getKeyByIntensity = (prop: string) => (String(item["TEST_ID"]).endsWith(type) ? `${prop}${type}` : `${prop}${opossit}`);

    const keyByIntensity = String(getKeyByIntensity(field));
    const dataElement = dhisId[keyByIntensity] ?? dhisId[field]

    const value = item[field];

    return dataElement && value ? { dataElement, value } : undefined;
}

const typeOpposit: Record<string, string> = {
    _5X: "_10X",
    _10X: "_5X",
}

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
    ADJ_MORTALITY_PERCENT_1X_x5: "hjdSAokENFs",
    INSECTICIDE_FK__CODE_x5: "mspNBRCNrPh",
    NUMBER_MOSQ_CONTROL_x5: "RtoQzWkv24k",
    MORTALITY_NUMBER_x5: "WoM25CEOaad",
    NUMBER_MOSQ_EXP_x5: "TqBMpf6rqzO",
    ADJ_MORTALITY_PERCENT_1X_x10: "mcRgVtgwevL",
    INSECTICIDE_FK__CODE_x10: "xiFX4d6U2WG",
    NUMBER_MOSQ_CONTROL_x10: "LFxCOJqeFxz",
    MORTALITY_NUMBER_x10: "Dz489B9dDqQ",
    NUMBER_MOSQ_EXP_x10: "NkFOQ7gLyqW",
};

const categoryOptionCombo: Record<string, string> = {
    adHe8ZqTLGQ: "VIsmG1pMMgI",
    MFYaHarMqU1: "PR1plsTJJER",
    U9ryfMWEJwI: "OVcRgB8Fe13"
}
