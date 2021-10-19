import _ from "lodash";
import { getUid } from "../../../../utils/uid";
import { Future, FutureData } from "../../../entities/Future";

import { ProgramEvent, ProgramEventDataValue } from "../../../entities/ProgramEvent";
import { SyncResult } from "../../../entities/SyncResult";
import { XMartContent } from "../../../entities/XMart";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { MetadataRepository } from "../../../repositories/MetadataRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

const PROGRAM_ENTO_IR_SYNERGIST_INSECTICIDE_BIOASSAY = "azxjVmQLicj";
const PROGRAM_STAGE_ENTO_IR_SYNERGIST_INSECTICIDE_BIOASSAY = "L6qpxsRQDWb";
const INSECTICIDE_CONCENTRATION_1x = "iwLpJ6hh3qI";

export default function action(
    martRepository: XMartRepository,
    instanceRepository: InstanceRepository,
    metadataRepository: MetadataRepository
): FutureData<SyncResult> {
    return Future.joinObj({
        metadata: metadataRepository.getOptionsFromOptionSet([INSECTICIDE_CONCENTRATION_1x]),
        options: martRepository.listAll("ENTO", "FACT_SYNERGIST_BIOASSAY_TEST"),
    }).flatMap(({ metadata, options }) => {
        const events: ProgramEvent[] = _.compact(
            options.map(item => {
                const event = item["TEST_ID"] ?? getUid(String(item["_RecordID"]));
                const orgUnit = item["SITE_FK__SITE"];
                const eventDate = item["Sys_FirstCommitDateUtc"];
                const categoryOption = item["INSTITUTION_TYPE__CODE"];
                const attributeOptionCombo = categoryOptionCombo[String(categoryOption)];

                const insecticide_value = mapField(item, "INSECTICIDE_FK__CODE")?.value ?? "";

                const optionSets = metadata.optionSets ?? [];
                const codes: String[] = optionSets.map(options => {
                    const codes = options["options"].map((item: any) => {
                        return String(item.code);
                    });
                    return codes;
                })[0];
                if (!codes.includes(String(insecticide_value))) {
                    return undefined;
                }

                if (!event || !orgUnit || !eventDate || !attributeOptionCombo) {
                    return undefined;
                }

                return {
                    event: String(event),
                    orgUnit: String(orgUnit),
                    program: PROGRAM_ENTO_IR_SYNERGIST_INSECTICIDE_BIOASSAY,
                    status: "COMPLETED",
                    eventDate: new Date(String(eventDate)).toISOString(),
                    attributeOptionCombo: String(attributeOptionCombo),
                    programStage: PROGRAM_STAGE_ENTO_IR_SYNERGIST_INSECTICIDE_BIOASSAY,
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

        return instanceRepository.postEvents(events, { orgUnitIdScheme: "CODE" });
    });
}

function mapField(item: XMartContent, field: keyof typeof dhisId): ProgramEventDataValue | undefined {
    const dataElement = dhisId[field];

    if (field === "MECH_INVOLVEMENT__CODE") {
        item[field] = mechInvolement[String(item[field])] ?? null;
    }

    if (field === "SPECIES_CONTROL_FK__CODE" || field === "SPECIES_FK__CODE") {
        if (item[field] === "STEPHENSI_SL") {
            item[field] = "STEPHENSI";
        } else if (item[field] === "NA" || item[field] === "NR" || item[field] === "ANOPHELES_SSP") {
            item[field] = "";
        }
    }

    const value_formatter = item[field];

    if (String(value_formatter) === "true" || String(value_formatter) === "false") {
        const value = String(value_formatter);
        return dataElement && value ? { dataElement, value } : undefined;
    }

    const value = item[field] ?? "";

    return dataElement ? { dataElement, value } : undefined;
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

const categoryOptionCombo: Record<string, string> = {
    adHe8ZqTLGQ: "VIsmG1pMMgI",
    MFYaHarMqU1: "PR1plsTJJER",
    U9ryfMWEJwI: "OVcRgB8Fe13",
};

const mechInvolement: Record<string, number> = {
    NOT_EVALUABLE: 0,
    NEGATIVE: 1,
    NO_INVOLVEMENT: 2,
    PARTIAL: 3,
    FULL: 4,
};
