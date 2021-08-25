import _ from "lodash";
import { UseCase } from "../../../compositionRoot";
import { getUid } from "../../../utils/uid";
import { Future } from "../../entities/Future";
import { ProgramEvent, ProgramEventDataValue } from "../../entities/ProgramEvent";
import { SynchronizationResult } from "../../entities/SynchronizationResult";
import { XMartContent } from "../../entities/XMart";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

// TODO: Rename file and use case to a more appropriate name
export class Action1UseCase implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) { }

    public execute(): Future<string, SynchronizationResult> {
        return this.martRepository
            .listAll("FACT_MOLECULAR_TEST")
            .map(options => {
                const events: ProgramEvent[] = _.compact(
                    options.map(item => {
                        const event = item["TEST_ID"] ? item["TEST_ID"] : getUid(String(item["_RecordID"]));
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
                            program: "Rw3oD4ExD8U",
                            status: "COMPLETED",
                            eventDate: new Date(String(eventDate)).toISOString(),
                            attributeOptionCombo: String(attributeOptionCombo),
                            programStage: "GeOxsjpEjSY",
                            dataValues: _.compact([
                                mapField(item, "CITATION"),
                                mapField(item, "INSTITUTION_FK"),
                                mapField(item, "MONTH_END"),
                                mapField(item, "MONTH_START"),
                                mapField(item, "MECHANISM_FK__CODE"),
                                mapField(item, "MECH_STATUS__CODE"),
                                mapField(item, "NUMBER_MOSQ_EXP"),
                                mapField(item, "PUB_LINK"),
                                mapField(item, "PUBLISHED"),
                                mapField(item, "SPECIES_CONTROL_FK__CODE"),
                                mapField(item, "SPECIES_FK__CODE"),
                                mapField(item, "STAGE_ORIGIN_FK__CODE"),
                                mapField(item, "YEAR_END"),
                                mapField(item, "YEAR_START"),
                                mapField(item, "ALLELIC_FREQ"),
                            ]),
                        };
                    })
                );
                return events;
            })
            .flatMap(events => {return this.instanceRepository.postEvents(events, { orgUnitIdScheme: "CODE" })});
    }
}

function mapField(item: XMartContent, field: keyof typeof dhisId): ProgramEventDataValue | undefined {
    const dataElement = dhisId[field];
    const value = item[field];

    return dataElement && value ? { dataElement, value } : undefined;
}

const dhisId = {
    CITATION: "SPA9WRC0s7V",
    INSTITUTION_FK: "l7iRc4fVcRO",
    MECHANISM_FK__CODE: "wWjgsHax21F",
    MECH_STATUS__CODE: "NJATA2S3BFc",
    MONTH_END: "nJGsnuqueOI",
    MONTH_START: "aNTjTSnE4n3",
    NUMBER_MOSQ_EXP: "jO3nCtwAk9e",
    PUB_LINK: "WJYxfzHrmQj",
    PUBLISHED: "z5o0lM2Cbus",
    SPECIES_CONTROL_FK__CODE: "yGY1TUqZsNf",
    SPECIES_FK__CODE: "gXKPOItwUlb",
    STAGE_ORIGIN_FK__CODE: "gqhSHmY7Etl",
    YEAR_END: "sxLgkqTWM1c",
    YEAR_START: "EvSWXtVdh6h",
    ALLELIC_FREQ: "k4mBevJ2EfW",
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
