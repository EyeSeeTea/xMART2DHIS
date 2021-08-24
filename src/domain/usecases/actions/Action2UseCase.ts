import _ from "lodash";
import { UseCase } from "../../../compositionRoot";
import { getUid } from "../../../utils/uid";
import { FutureData } from "../../entities/Future";
import { ProgramEvent, ProgramEventDataValue } from "../../entities/ProgramEvent";
import { XMartContent } from "../../entities/XMart";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

// TODO: Rename file and use case to a more appropriate name
export class Action2UseCase implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) {}

    public execute(): FutureData<void> {
        return this.martRepository
            .listAll("FACT_SYNERGIST_BIOASSAY_TEST")
            .map(options => {
                const events: ProgramEvent[] = _.compact(
                    options.map(item => {
                        const event = item["TEST_ID"] ? item["TEST_ID"]: getUid(String(item["_RecordID"]));
                        const orgUnit = item["SITE_FK__SITE"];
                        const eventDate = item["Sys_FirstCommitDateUtc"];
                        const categoryOption = item["INSTITUTION_TYPE__CODE"];
                        const attributeOptionCombo = this.instanceRepository.mapCategoryOptionCombo(
                            String(categoryOption)
                        );

                        if (!event || !orgUnit || !eventDate || !attributeOptionCombo) {
                            return undefined;
                        }

                        return {
                            event: String(event),
                            orgUnit: String(orgUnit),
                            program: "azxjVmQLicj",
                            status: "COMPLETED",
                            eventDate: new Date(String(eventDate)).toISOString(),
                            attributeOptionCombo: String(attributeOptionCombo),
                            programStage: "L6qpxsRQDWb",
                            dataValues: _.compact([
                                mapField(item, "ADJ_MORTALITY_PERCENT_1X"),
                                mapField(item, "CITATION"),
                                mapField(item, "INSECTICIDE_FK__CODE"),
                                mapField(item, "MECH_INVOLVEMENT__CODE"),
                                mapField(item, "INSTITUTION_FK"),
                                mapField(item, "MONTH_END"),
                                mapField(item, "MONTH_START"),
                                mapField(item, "MORTALITY_CONTROL"),
                                mapField(item, "MORTALITY_NUMBER"),
                                mapField(item, "MORTALITY_PERCENT"),
                                mapField(item, "NUMBER_MOSQ_CONTROL"),
                                mapField(item, "NUMBER_MOSQ_EXP"),
                                mapField(item, "PUB_LINK"),
                                mapField(item, "PUBLISHED"),
                                mapField(item, "YEAR_END"),
                                mapField(item, "YEAR_START"),
                                mapField(item, "SPECIES_CONTROL_FK__CODE"),
                                mapField(item, "SPECIES_FK__CODE"),
                                mapField(item, "STAGE_ORIGIN_FK__CODE"),
                                mapField(item, "TEST_TIME_FK__CODE"),
                                mapField(item, "SYNERGIST_TYPE_FK__CODE"),
                                mapField(item, "TEST_TYPE_FK__CODE"),
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
    ADJ_MORTALITY_PERCENT_1X: "eA4Cdz9qnOo",
    CITATION: "SPA9WRC0s7V",
    INSECTICIDE_FK__CODE: "UGyOyJJ7z2h",
    MECH_INVOLVEMENT__CODE: "D2hqaI0WpsX",
    INSTITUTION_FK: "l7iRc4fVcRO",
    MONTH_END: "nJGsnuqueOI",
    MONTH_START: "aNTjTSnE4n3",
    MORTALITY_CONTROL: "i4KoaSwzufn",
    MORTALITY_NUMBER: "Txsi0wNRkOj",
    MORTALITY_PERCENT: "qLyXw2YMCbs",
    NUMBER_MOSQ_CONTROL: "L42iFDUW1h7",
    NUMBER_MOSQ_EXP: "VrJfwqUUwYg",
    PUB_LINK: "WJYxfzHrmQj",
    PUBLISHED: "z5o0lM2Cbus",
    SPECIES_CONTROL_FK__CODE: "yGY1TUqZsNf",
    SPECIES_FK__CODE: "gXKPOItwUlb",
    STAGE_ORIGIN_FK__CODE: "gqhSHmY7Etl",
    TEST_TIME_FK__CODE: "v86CHHosXCi",
    YEAR_END: "sxLgkqTWM1c",
    YEAR_START: "EvSWXtVdh6h",
    SYNERGIST_TYPE_FK__CODE: "bDNYfwJ2osx",
    TEST_TYPE_FK__CODE: "Iy43l68wVGQ",
};
