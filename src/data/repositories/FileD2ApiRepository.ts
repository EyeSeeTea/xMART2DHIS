import { FileInfo } from "../../domain/entities/data/File";
import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/instance/Instance";
import { FileRepository } from "../../domain/repositories/FileRepository";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";

export class FileD2ApiRepository implements FileRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    uploadFileAsExternal(fileInfo: FileInfo): FutureData<string> {
        return apiToFuture(this.api.files.upload(fileInfo))
            .flatMap(({ id }) => {
                const baseUrl =
                    process.env.NODE_ENV === "development" ? process.env.REACT_APP_DHIS2_BASE_URL : this.api.baseUrl;

                const url = `${baseUrl}/api/documents/${id}/data`;

                return Future.joinObj({
                    url: Future.success(url),
                    sharing: apiToFuture(
                        this.api.sharing.post(
                            { id, type: "document" },
                            { publicAccess: "--------", externalAccess: true }
                        )
                    ),
                });
            })
            .map(({ url }) => {
                console.log({ url });
                return url;
            });
    }
}
