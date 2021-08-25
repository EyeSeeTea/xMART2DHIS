import _ from "lodash";
import { UseCase } from "../../../compositionRoot";
import { getUid } from "../../../utils/uid";
import { FutureData } from "../../entities/Future";
import { ProgramEvent, ProgramEventDataValue } from "../../entities/ProgramEvent";
import { XMartContent } from "../../entities/XMart";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

// TODO: Rename file and use case to a more appropriate name
export class Action3UseCase implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) { }

    public execute(): FutureData<void> {
        return this.martRepository
            .listAll("FACT_INTENSITY_TEST")
            .map(options => {
                const events: ProgramEvent[] = _.compact(
                    options.map(item => {
                        const event = item["PAIRING_CODE_INTENSITY"]
                            ? item["PAIRING_CODE_INTENSITY"]
                            : getUid(String(item["_RecordID"]));
                        const orgUnit = item["SITE_FK__SITE"];
                        const eventDate = item["Sys_FirstCommitDateUtc"];
                        const categoryOption = item["INSTITUTION_TYPE__CODE"];
                        const attributeOptionCombo = mapCategoryOptionCombo(String(categoryOption));

                        if (!event || !orgUnit || !eventDate || !attributeOptionCombo) {
                            return undefined;
                        }

                        return {
                            event: String(event),
                            orgUnit: String(orgUnit),
                            program: "FUzFm6UEmRn",
                            status: "COMPLETED",
                            eventDate: new Date(String(eventDate)).toISOString(),
                            attributeOptionCombo: String(attributeOptionCombo),
                            programStage: "VkFvRbbpVng",
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
                                mapField(item, "ADJ_MORTALITY_PERCENT_1X_5X"),
                                mapField(item, "ADJ_MORTALITY_PERCENT_1X_10X"),
                                mapField(item, "INSECTICIDE_FK__CODE_5X"),
                                mapField(item, "INSECTICIDE_FK__CODE_10X"),
                                mapField(item, "NUMBER_MOSQ_CONTROL_5X"),
                                mapField(item, "NUMBER_MOSQ_CONTROL_10X"),
                                mapField(item, "MORTALITY_NUMBER_5X"),
                                mapField(item, "MORTALITY_NUMBER_10X"),
                                mapField(item, "NUMBER_MOSQ_EXP_5X"),
                                mapField(item, "NUMBER_MOSQ_EXP_10X"),
                            ]),
                        };
                    })
                );
                return events;
            })
            .map(events => this.instanceRepository.postEvents(events, { orgUnitIdScheme: "CODE" }))
            .map(() => undefined);
    }
}

function mapField(item: XMartContent, field: keyof typeof dhisId): ProgramEventDataValue | undefined {
    const dataElement = dhisId[field];
    const value = item[field.replace("_5X", "").replace("_10X", "")];

    return dataElement && value ? { dataElement, value } : undefined;
}

const dhisId = {
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
    ADJ_MORTALITY_PERCENT_1X_5X: "hjdSAokENFs",
    INSECTICIDE_FK__CODE_5X: "mspNBRCNrPh",
    NUMBER_MOSQ_CONTROL_5X: "RtoQzWkv24k",
    MORTALITY_NUMBER_5X: "WoM25CEOaad",
    NUMBER_MOSQ_EXP_5X: "TqBMpf6rqzO",
    ADJ_MORTALITY_PERCENT_1X_10X: "mcRgVtgwevL",
    INSECTICIDE_FK__CODE_10X: "xiFX4d6U2WG",
    NUMBER_MOSQ_CONTROL_10X: "LFxCOJqeFxz",
    MORTALITY_NUMBER_10X: "Dz489B9dDqQ",
    NUMBER_MOSQ_EXP_10X: "NkFOQ7gLyqW",
};

function mapCategoryOptionCombo(key: string | undefined): string | undefined {
    let id = undefined;
    if (key === "adHe8ZqTLGQ") {
        id = "VIsmG1pMMgI";
    } else if (key === "MFYaHarMqU1") {
        id = "PR1plsTJJER";
    } else if (key === "U9ryfMWEJwI") {
        id = "OVcRgB8Fe13";
    }

    return id;
}
