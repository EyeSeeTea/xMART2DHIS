import _ from "lodash";
import { DataValue } from "../../../entities/DataValue";
import { FutureData } from "../../../entities/Future";
import { SyncResult } from "../../../entities/SyncResult";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

const DEFAULT_CATEGORY_OPTION_COMBO = "Xr12mI7VPn3";
const EXPECTATION_DATAELEMENT = "iGdxjAujns6";
export default function action(
    martRepository: XMartRepository,
    instanceRepository: InstanceRepository
): FutureData<SyncResult> {
    return martRepository.listAll("GHO", "LIFE_0000000035").flatMap(options => {
        const dataValues: DataValue[] = options.map(item => {
            const orgUnit = String(item["SpatialDim"]);
            const period = String(item["TimeDim"]);

            return {
                dataElement: EXPECTATION_DATAELEMENT,
                value: String(item["Value"]),
                orgUnit: String(orgUnit),
                period: String(period),
                attributeOptionCombo: DEFAULT_CATEGORY_OPTION_COMBO,
                categoryOptionCombo: age[item["Dim2"] + "-" + item["Dim1"]],
                comment: undefined,
            };
        });
        return instanceRepository.postDataValueSet(dataValues, { orgUnitIdScheme: "CODE" });
    });
}

const age: Record<string, string> = {
    "AGELT1-MLE": "SSttAumFGlh",
    "AGELT1-FMLE": "Awd3Yh9wuTC",
    "AGE1-4-MLE": "eqIy4IosdYX",
    "AGE1-4-FMLE": "cCqUNrqjQSj",
    "AGE5-9-MLE": "uhYj8znPdbs",
    "AGE5-9-FMLE": "tqB0eSHl0K8",
    "AGE10-14-MLE": "Ikt0bGwnzIV",
    "AGE10-14-FMLE": "I2jzuadXgYA",
    "YEARS15-19-MLE": "NkSqIMTIuls",
    "YEARS15-19-FMLE": "CdAJ8Cso0N8",
    "AGE20-24-MLE": "TYyRM6Rognx",
    "AGE20-24-FMLE": "ImUxVfmYXdJ",
    "AGE25-29-MLE": "nEcy1pNxZfw",
    "AGE25-29-FMLE": "tGLOcuXZrDl",
    "AGE30-34-MLE": "HzQnR8x6NZM",
    "AGE30-34-FMLE": "KddgpSIhqyd",
    "AGE40-44-MLE": "t9j1BZCfodV",
    "AGE40-44-FMLE": "b1AQ58FpBdb",
    "AGE45-49-MLE": "RtVImvsiiso",
    "AGE45-49-FMLE": "fUtivvBPtq5",
    "AGE50-54-MLE": "uS3rPZNSqG2",
    "AGE50-54-FMLE": "jU99cH6TC2H",
    "AGE65-69-MLE": "MDwAlXqOIaY",
    "AGE65-69-FMLE": "WRscQvX1k6g",
    "AGE60-64-MLE": "RO4TdcMI5GT",
    "AGE60-64-FMLE": "wyJx0coEXHO",
    "AGE35-39-MLE": "vctYQZjV577",
    "AGE35-39-FMLE": "gzF2qwDqjP8",
    "AGE55-59-MLE": "CvkRAg9TjQ6",
    "AGE55-59-FMLE": "fOXpyO03PvT",
    "AGE70-74-MLE": "Y4f1oK6YwiH",
    "AGE70-74-FMLE": "YbRqGKpX50g",
    "AGE75-79-MLE": "MQHj21HNPld",
    "AGE75-79-FMLE": "bddWwDoi9AH",
    "AGE80-84-MLE": "QtTpt8cslKS",
    "AGE80-84-FMLE": "cOiIgWw0CuG",
    "YEARS85PLUS-MLE": "vPPZ9IvzwcZ",
    "YEARS85PLUS-FMLE": "Bq2pVOheHJZ",
}