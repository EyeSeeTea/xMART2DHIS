import { FileInfo } from "../../domain/entities/File";
import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/Instance";
import { FileRepository } from "../../domain/repositories/Filerepository";
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
                const baseUrl = this.api.baseUrl;

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
