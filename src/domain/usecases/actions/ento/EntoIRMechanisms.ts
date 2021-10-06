import _ from "lodash";
import { getUid } from "../../../../utils/uid";
import { FutureData } from "../../../entities/Future";
import { ProgramEvent, ProgramEventDataValue } from "../../../entities/ProgramEvent";
import { SyncResult } from "../../../entities/SyncResult";
import { XMartContent } from "../../../entities/XMart";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

const PROGRAM_ENTO_IR_MECHANISMS = "Rw3oD4ExD8U";
const PROGRAM_STAGE_ENTO_IR_MECHANISMS = "GeOxsjpEjSY";

export default function action(
    martRepository: XMartRepository,
    instanceRepository: InstanceRepository
): FutureData<SyncResult> {
    return martRepository.listAll("ENTO", "FACT_MOLECULAR_TEST").flatMap(options => {
        const events: ProgramEvent[] = _.compact(
            options.map(item => {
                const event = item["TEST_ID"] ?? getUid(String(item["_RecordID"]));
                const orgUnit = item["SITE_FK__SITE"];
                const eventDate = item["Sys_FirstCommitDateUtc"];
                const categoryOption = item["INSTITUTION_TYPE__CODE"];
                const attributeOptionCombo = categoryOptionCombo[String(categoryOption)];

                if (!event || !orgUnit || !eventDate || !attributeOptionCombo) {
                    return undefined;
                }

                return {
                    event: String(event),
                    orgUnit: String(orgUnit),
                    program: PROGRAM_ENTO_IR_MECHANISMS,
                    status: "COMPLETED",
                    eventDate: new Date(String(eventDate)).toISOString(),
                    attributeOptionCombo: String(attributeOptionCombo),
                    programStage: PROGRAM_STAGE_ENTO_IR_MECHANISMS,
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

        return instanceRepository.postEvents(events, { orgUnitIdScheme: "CODE" });
    });
}

function mapField(item: XMartContent, field: keyof typeof dhisId): ProgramEventDataValue | undefined {
    const dataElement = dhisId[field];
    if (field === "SPECIES_CONTROL_FK__CODE" || field === "SPECIES_FK__CODE") {
        if (item[field] === "STEPHENSI_SL") {
            item[field] = "STEPHENSI";
        } else if (item[field] === "NA" || item[field] === "NR" || item[field] === "ANOPHELES_SSP") {
            item[field] = "";
        }
    }
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

const categoryOptionCombo: Record<string, string> = {
    adHe8ZqTLGQ: "VIsmG1pMMgI",
    MFYaHarMqU1: "PR1plsTJJER",
    U9ryfMWEJwI: "OVcRgB8Fe13",
};
