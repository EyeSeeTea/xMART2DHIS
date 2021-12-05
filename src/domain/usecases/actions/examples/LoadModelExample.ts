import { UseCase } from "../../../../compositionRoot";
import { getD2APiFromInstance } from "../../../../utils/d2-api";
import { apiToFuture } from "../../../../utils/futures";
import { getUid } from "../../../../utils/uid";
import { Future, FutureData } from "../../../entities/Future";
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
    code: "TRAINING_ARC",
    type: "UAT",
    apiUrl: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/TRAINING_ARC",
} as const;

const example = {
    tables: [{ CODE: "ENROLLMENTS", TITLE: "Enrollments" }],
    fields: [
        {
            TABLE_CODE: "ENROLLMENTS",
            CODE: "enrollment",
            TITLE: "Enrollment",
            FIELD_TYPE_CODE: "TEXT_50",
            IS_REQUIRED: 1,
            IS_PRIMARY_KEY: 1,
            IS_ROW_TITLE: 0,
        },
        {
            TABLE_CODE: "ENROLLMENTS",
            CODE: "trackedEntityInstance",
            TITLE: "Tracked Entity Instance",
            FIELD_TYPE_CODE: "TEXT_50",
            IS_REQUIRED: 1,
            IS_PRIMARY_KEY: 0,
            IS_ROW_TITLE: 0,
        },
        {
            TABLE_CODE: "ENROLLMENTS",
            CODE: "created",
            TITLE: "Created Date",
            FIELD_TYPE_CODE: "TEXT_50",
            IS_REQUIRED: 1,
            IS_PRIMARY_KEY: 0,
            IS_ROW_TITLE: 0,
        },
        {
            TABLE_CODE: "ENROLLMENTS",
            CODE: "enrollmentDate",
            TITLE: "Enrollment Date",
            FIELD_TYPE_CODE: "TEXT_50",
            IS_REQUIRED: 1,
            IS_PRIMARY_KEY: 0,
            IS_ROW_TITLE: 0,
        },
    ],
};
