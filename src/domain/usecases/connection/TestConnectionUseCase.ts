import { UseCase } from "../../../compositionRoot";
import { LoadData } from "../../../data/utils/pipelines/LoadData";
import { LoadModel } from "../../../data/utils/pipelines/LoadModel";
import { LoadPipeline } from "../../../data/utils/pipelines/LoadPipeline";
import { Future, FutureData } from "../../entities/Future";
import { DataMart } from "../../entities/xmart/DataMart";
import { XMartPipelineDefinition } from "../../entities/xmart/xMartSyncTableTemplates";
import { FileRepository } from "../../repositories/FileRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

export class TestConnectionUseCase implements UseCase {
    constructor(private xMartRepository: XMartRepository, private fileRepository: FileRepository) {}

    public execute(connection: DataMart): FutureData<number> {
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

        return this.fileRepository
            .uploadFileAsExternal({ name: "xMART2DHIS Test Connection", data })
            .flatMap(({ url, id }) =>
                Future.joinObj({
                    result: this.xMartRepository.runPipeline(connection, "LOAD_PIPELINE", { url }),
                    id: Future.success(id),
                })
            )
            .flatMap(({ result, id }) => {
                return this.fileRepository.removeFile(id).map(() => result);
            });
    }
}
