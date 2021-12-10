import { UseCase } from "../../../../compositionRoot";
import { getD2APiFromInstance } from "../../../../utils/d2-api";
import { apiToFuture } from "../../../../utils/futures";
import { getUid } from "../../../../utils/uid";
import { Future, FutureData } from "../../../entities/Future";
import { InstanceRepository } from "../../../repositories/InstanceRepository";
import { XMartRepository } from "../../../repositories/XMartRepository";

// TODO: This is an example use case, should be more generic and use table metadata, validations and mapping
export class LoadDataExample implements UseCase {
    constructor(private martRepository: XMartRepository, private instanceRepository: InstanceRepository) {}

    public execute(): FutureData<number> {
        const instance = this.instanceRepository.getInstance();
        const api = getD2APiFromInstance(instance);

        // FIXME: Hardcoded GET Data Values (example)
        return apiToFuture(
            api.dataValues.getSet({
                dataSet: ["FnYgTt843G2"],
                orgUnit: ["H8RixfF8ugH"],
                startDate: "2021-01-01",
                endDate: "2022-01-01",
            })
        )
            .flatMap(({ dataValues }) => {
                const value = JSON.stringify(dataValues);
                const data = new Blob([value], { type: "application/json" });

                return apiToFuture(api.files.upload({ id: getUid("EXAMPLE"), name: "Example file", data }));
            })
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
                return this.martRepository.runPipeline(TRAINING_MART, "LOAD_DATA", {
                    url,
                    table: "AGGREGATED",
                });
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
