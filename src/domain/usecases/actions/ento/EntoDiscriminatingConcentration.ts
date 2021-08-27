import _ from "lodash";
import { getUid } from "../../../../utils/uid";
import { FutureData } from "../../../entities/Future";
import { ProgramEvent, ProgramEventDataValue } from "../../../entities/ProgramEvent";
import { SyncResult } from "../../../entities/SyncResult";
import { XMartContent } from "../../../entities/XMart";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

const PROGRAM_ENTO_IR_DISCRIMINATING_CONCENTRATION = "G9hvxFI8AYC";
const PROGRAM_STAGE_ENTO_IR_DISCRIMINATING_CONCENTRATION = "P7VZnpYMjf6";

export default function action(
    martRepository: XMartRepository,
    instanceRepository: InstanceRepository
): FutureData<SyncResult> {
    return martRepository.listAll("ENTO", "FACT_DISCRIMINATING_TEST").flatMap(options => {
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
                    program: PROGRAM_ENTO_IR_DISCRIMINATING_CONCENTRATION,
                    status: "COMPLETED",
                    eventDate: new Date(String(eventDate)).toISOString(),
                    attributeOptionCombo: String(attributeOptionCombo),
                    programStage: PROGRAM_STAGE_ENTO_IR_DISCRIMINATING_CONCENTRATION,
                    dataValues: _.compact([
                        mapField(item, "ADJ_MORTALITY_PERCENT_1X"),
                        mapField(item, "CITATION"),
                        mapField(item, "INSECTICIDE_FK__CODE"),
                        mapField(item, "INSTITUTION_FK"),
                        mapField(item, "IR_STATUS_FK__CODE"),
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
                        mapField(item, "TEST_TYPE_FK__CODE"),
                    ]),
                };
            })
        );

        return instanceRepository.postEvents(events, { orgUnitIdScheme: "CODE" });
    });
}

function mapField(item: XMartContent, field: keyof typeof dhisId): ProgramEventDataValue | undefined {
    const dataElement = dhisId[field];
    const value = item[field];

    return dataElement && value ? { dataElement, value } : undefined;
}

const dhisId = {
    ADJ_MORTALITY_PERCENT_1X: "Gwa8bf0Xh6Z",
    CITATION: "SPA9WRC0s7V",
    INSECTICIDE_FK__CODE: "UGyOyJJ7z2h",
    INSTITUTION_FK: "l7iRc4fVcRO",
    IR_STATUS_FK__CODE: "FvbJ0tU5elQ",
    MONTH_END: "nJGsnuqueOI",
    MONTH_START: "aNTjTSnE4n3",
    MORTALITY_CONTROL: "i4KoaSwzufn",
    MORTALITY_NUMBER: "RosQioM91PZ",
    MORTALITY_PERCENT: "d2yWBe9n1wr",
    NUMBER_MOSQ_CONTROL: "L42iFDUW1h7",
    NUMBER_MOSQ_EXP: "FhshaqyCFQw",
    PUB_LINK: "WJYxfzHrmQj",
    PUBLISHED: "z5o0lM2Cbus",
    SPECIES_CONTROL_FK__CODE: "yGY1TUqZsNf",
    SPECIES_FK__CODE: "gXKPOItwUlb",
    STAGE_ORIGIN_FK__CODE: "gqhSHmY7Etl",
    TEST_TIME_FK__CODE: "v86CHHosXCi",
    TEST_TYPE_FK__CODE: "NGU9TjLZcBg",
    YEAR_END: "sxLgkqTWM1c",
    YEAR_START: "EvSWXtVdh6h",
};

const categoryOptionCombo: Record<string, string> = {
    adHe8ZqTLGQ: "VIsmG1pMMgI",
    MFYaHarMqU1: "PR1plsTJJER",
    U9ryfMWEJwI: "OVcRgB8Fe13",
};