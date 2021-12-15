import { FileInfo } from "../../domain/entities/data/File";
import { Future, FutureData } from "../../domain/entities/Future";
import { Instance } from "../../domain/entities/instance/Instance";
import { FileRepository, UploadedFile } from "../../domain/repositories/FileRepository";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";

export class FileD2ApiRepository implements FileRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public uploadFileAsExternal(fileInfo: FileInfo): FutureData<UploadedFile> {
        return apiToFuture(this.api.files.upload(fileInfo))
            .flatMap(({ id }) => {
                return Future.joinObj({
                    id: Future.success(id),
                    sharing: apiToFuture(
                        this.api.sharing.post(
                            { id, type: "document" },
                            { publicAccess: "--------", externalAccess: true }
                        )
                    ),
                });
            })
            .map(({ id }) => {
                const isDev = process.env.NODE_ENV === "development";
                const baseUrl = isDev ? process.env.REACT_APP_DHIS2_BASE_URL : this.api.baseUrl;
                return { id, url: `${baseUrl}/api/documents/${id}/data` };
            });
    }

    public removeFile(id: string): FutureData<void> {
        return apiToFuture(this.api.models.documents.delete({ id })).map(() => undefined);
    }
}
