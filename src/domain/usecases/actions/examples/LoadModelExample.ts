import { UseCase } from "../../../../compositionRoot";
import { getD2APiFromInstance } from "../../../../utils/d2-api";
import { apiToFuture } from "../../../../utils/futures";
import { getUid } from "../../../../utils/uid";
import { Future, FutureData } from "../../../entities/Future";
import { DataMart } from "../../../entities/xmart/DataMart";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

// TODO: This is an example use case, should be more generic and use table metadata, validations and mapping
export class LoadModelExample implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) {}

    public execute(): FutureData<number> {
        const instance = this.instanceRepository.getInstance();
        const api = getD2APiFromInstance(instance);

        const value = JSON.stringify(example);
        const data = new Blob([value], { type: "application/json" });

        // FIXME: Hardcoded GET Data Values (example)
        return apiToFuture(api.files.upload({ id: getUid("EXAMPLE"), name: "Example file", data }))
            .flatMap(({ id }) => {
                const baseUrl =
                    process.env.NODE_ENV === "development"
                        ? process.env.REACT_APP_DHIS2_BASE_URL
                        : this.instanceRepository.getBaseUrl();

                const url = `${baseUrl}/api/documents/${id}/data`;
                return Future.joinObj({
                    url: Future.success(url),
                    sharing: apiToFuture(
                        api.sharing.post({ id, type: "document" }, { publicAccess: "--------", externalAccess: true })
                    ),
                });
            })
            .flatMap(({ url }) => {
                return this.martRepository.runPipeline(TRAINING_MART, "LOAD_MODEL", { url });
            });
    }
}

const TRAINING_MART = {
    id: "TRAINING",
    name: "TRAINING",
    martCode: "TRAINING_ARC",
    environment: "UAT",
    dataEndpoint: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/TRAINING_ARC",
} as DataMart;

const example = {
    tables: [{ CODE: "TEST_2", TITLE: "Test 2" }],
    fields: [
        {
            TABLE_CODE: "TEST_2",
            CODE: "COL_1",
            TITLE: "Column 1",
            FIELD_TYPE_CODE: "TEXT_50",
            IS_REQUIRED: 1,
            IS_PRIMARY_KEY: 1,
            IS_ROW_TITLE: 0,
        },
        {
            TABLE_CODE: "TEST_2",
            CODE: "COL_2",
            TITLE: "Column 2",
            FIELD_TYPE_CODE: "TEXT_50",
            IS_REQUIRED: 1,
            IS_PRIMARY_KEY: 0,
            IS_ROW_TITLE: 0,
        },
        {
            TABLE_CODE: "TEST_2",
            CODE: "COL_3",
            TITLE: "Column 3",
            FIELD_TYPE_CODE: "TEXT_50",
            IS_REQUIRED: 1,
            IS_PRIMARY_KEY: 0,
            IS_ROW_TITLE: 0,
        },
        {
            TABLE_CODE: "TEST_2",
            CODE: "COL_4",
            TITLE: "Column 4",
            FIELD_TYPE_CODE: "TEXT_50",
            IS_REQUIRED: 1,
            IS_PRIMARY_KEY: 0,
            IS_ROW_TITLE: 0,
        },
    ],
};
