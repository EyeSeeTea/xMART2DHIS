import _ from "lodash";
import { DataValue } from "../../../entities/DataValueSet";
import { FutureData } from "../../../entities/Future";
import { SyncResult } from "../../../entities/SyncResult";
import { XMartContent } from "../../../entities/XMart";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

/* const DATASET_GHO_GENERAL_INFORMATION = "NKWbkXyfO5F"; */
const DEFAULT_CATEGORY_OPTION_COMBO = "Xr12mI7VPn3";

export default function action(
    martRepository: XMartRepository,
    instanceRepository: InstanceRepository
): FutureData<SyncResult> {
    return martRepository.listAll("GHO", "WHOSIS_000007").flatMap(options => {
        const dataValues: DataValue[] = options.map(item => {
            const orgUnit = String(item["SpatialDim"]);
            /*                 const completeDate = String(item["Date"]);
                                const attributeOptionCombo = DEFAULT_CATEGORY_OPTION_COMBO */
            const dataelement = mapField(item, "Dim1");
            const period = String(item["TimeDim"]);

            return {
                /*                     dataSet: DATASET_GHO_GENERAL_INFORMATION,
                                        period: period,
                                        completeDate: completeDate,
                                        orgUnit: String(orgUnit),
                                        attributeOptionCombo: String(attributeOptionCombo), 
                    dataValues: [{*/

                dataElement: String(dataelement),
                value: String(item["Value"]),
                orgUnit: String(orgUnit),
                period: String(period),
                attributeOptionCombo: DEFAULT_CATEGORY_OPTION_COMBO,
                categoryOptionCombo: DEFAULT_CATEGORY_OPTION_COMBO,
                comment: undefined,

                // }]
            };
        });
        return instanceRepository.postDataValueSet({ dataValues: dataValues }, { orgUnitIdScheme: "CODE" });
    });
}

function mapField(item: XMartContent, key: string): String | undefined {
    const dataElement = genderGHO[String(item[key])];
    return dataElement ?? undefined;
}

const genderGHO: Record<string, string> = {
    BTSX: "U3M5mRx4wxw",
    MLE: "eljkqHz1w9e",
    FMLE: "O7wC9myD7NF",
};
