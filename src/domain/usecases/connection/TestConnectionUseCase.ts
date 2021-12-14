import { UseCase } from "../../../compositionRoot";
import { LoadData } from "../../../data/utils/pipelines/LoadData";
import { LoadModel } from "../../../data/utils/pipelines/LoadModel";
import { LoadPipeline } from "../../../data/utils/pipelines/LoadPipeline";
import { getD2APiFromInstance } from "../../../utils/d2-api";
import { apiToFuture } from "../../../utils/futures";
import { generateUid } from "../../../utils/uid";
import { Future, FutureData } from "../../entities/Future";
import { DataMart } from "../../entities/xmart/DataMart";
import { XMartPipelineDefinition } from "../../entities/xmart/xMartSyncTableTemplates";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

export class TestConnectionUseCase implements UseCase {
    constructor(private xMartRepository: XMartRepository, private instanceRepository: InstanceRepository) {}

    public execute(connection: DataMart): FutureData<number> {
        const instance = this.instanceRepository.getInstance();
        const api = getD2APiFromInstance(instance);
        const pipelines: XMartPipelineDefinition[] = [
            {
                CODE: "LOAD_PIPELINE",
                TITLE: "[xMART2DHIS] Load pipeline from URL",
                XML: LoadPipeline,
            },
            {
                CODE: "LOAD_DATA",
                TITLE: "[xMART2DHIS] Load data from URL",
                XML: LoadData,
            },
            {
                CODE: "LOAD_MODEL",
                TITLE: "[xMART2DHIS] Load model from URL",
                XML: LoadModel,
            },
        ];

        const value = JSON.stringify(pipelines);
        const data = new Blob([value], { type: "application/json" });

        return apiToFuture(api.files.upload({ id: generateUid(), name: "Example file", data }))
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
            .flatMap(({ url }) => this.xMartRepository.runPipeline(connection, "LOAD_PIPELINE", { url }));
    }
}
