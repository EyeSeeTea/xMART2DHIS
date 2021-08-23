import _ from "lodash";
import { UseCase } from "../../../compositionRoot";
import { FutureData } from "../../entities/Future";
import { ProgramEvent, ProgramEventDataValue } from "../../entities/ProgramEvent";
import { XMartContent } from "../../entities/XMart";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

// TODO: Rename file and use case to a more appropriate name
export class Action3UseCase implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) {}

    public execute(): FutureData<void> {
        return this.martRepository
            .listAll("FACT_INTENSITY_TEST")
            .map(options => {
                const events: ProgramEvent[] = _.compact(
                    options.map(item => {
                        const event = item["PAIRING_CODE_INTENSITY"];
                        const orgUnit = item["SITE_FK__SITE"];
                        const eventDate = item["Sys_CommitDateUtc"];
                        const attributeOptionCombo = item["INSTITUTION_TYPE"];

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
                                mapField(item, "ADJ_MORTALITY_PERCENT_1X"),
                                mapField(item, "CITATION"),
                                mapField(item, "INSECTICIDE_FK"),
                                mapField(item, "INSTITUTION_FK"),
                                mapField(item, "MONTH_END"),
                                mapField(item, "MONTH_START"),
                                mapField(item, "MORTALITY_NUMBER"),
                                mapField(item, "MORTALITY_PERCENT"),
                                mapField(item, "NUMBER_MOSQ_CONTROL"),
                                mapField(item, "MONTH_NUMBER_MOSQ_EXPEND"),
                                mapField(item, "PUB_LINK"),
                                mapField(item, "PUBLISHED"),
                                mapField(item, "SPECIES_CONTROL_FK"),
                                mapField(item, "SPECIES_FK"),
                                mapField(item, "STAGE_ORIGIN_FK"),
                                mapField(item, "TEST_TIME_FK"),
                                mapField(item, "TEST_TYPE_FK"),
                                mapField(item, "YEAR_END"),
                                mapField(item, "YEAR_START"),
                            ]),
                        };
                    })
                );
                return events;
            })
            .map(events => this.instanceRepository.postEvents(events))
            .map(() => undefined);
    }
}

function mapField(item: XMartContent, field: keyof typeof dhisId): ProgramEventDataValue | undefined {
    const dataElement = dhisId[field];
    const value = item[field];

    return dataElement && value ? { dataElement, value } : undefined;
}

const dhisId = {
    ADJ_MORTALITY_PERCENT_1X: "mcRgVtgwevL",
    CITATION: "SPA9WRC0s7V",
    INSECTICIDE_FK: "xiFX4d6U2WG",
    INSTITUTION_FK: "l7iRc4fVcRO",
    MONTH_END: "nJGsnuqueOI",
    MONTH_START: "aNTjTSnE4n3",
    MORTALITY_NUMBER: "Dz489B9dDqQ",
    MORTALITY_PERCENT: "yo1z2WcralS",
    NUMBER_MOSQ_CONTROL: "LFxCOJqeFxz",
    MONTH_NUMBER_MOSQ_EXPEND: "NkFOQ7gLyqW",
    PUB_LINK: "WJYxfzHrmQj",
    PUBLISHED: "z5o0lM2Cbus",
    SPECIES_CONTROL_FK: "yGY1TUqZsNf",
    SPECIES_FK: "gXKPOItwUlb",
    STAGE_ORIGIN_FK: "gqhSHmY7Etl",
    TEST_TIME_FK: "v86CHHosXCi",
    TEST_TYPE_FK: "NGU9TjLZcBg",
    YEAR_END: "sxLgkqTWM1c",
    YEAR_START: "EvSWXtVdh6h",
};
