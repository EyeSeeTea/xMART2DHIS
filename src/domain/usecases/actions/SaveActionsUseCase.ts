import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { SyncAction } from "../../entities/actions/SyncAction";
import { ActionRepository } from "../../repositories/ActionRepository";
import { DataMart } from "../../entities/xmart/XMart";
import { dataMarts } from "../xmart/ListDataMartsUseCase";
import { FileRepository } from "../../repositories/FileRepository";
import { getUid } from "../../../utils/uid";
import { XMartRepository } from "../../repositories/XMartRepository";
import { xMartSyncTables, xMartTable } from "../../entities/xmart/xMartSyncTables";

//TODO: Remove this when the repositoryreturn data marts
const listDataMarts = () => Future.success<DataMart[]>(dataMarts);

export class SaveActionUseCase implements UseCase {
    constructor(
        private actionRepository: ActionRepository,
        private fileRepository: FileRepository,
        private xMartRepository: XMartRepository
    ) {}

    public execute(action: SyncAction): FutureData<void> {
        return Future.joinObj({
            saveResult: this.actionRepository.save(action),
            dataMart: this.getDataMartByAction(action),
        })
            .flatMap(({ dataMart }) => this.loadModelsInXMart(dataMart))
            .flatMap(() => Future.success(undefined))
            .flatMapError(error => Future.error(`An error has ocurred saving the action:\n${String(error)}`));
    }

    private getDataMartByAction(action: SyncAction): Future<unknown, DataMart> {
        return listDataMarts().flatMap(dataMarts => {
            const dataMart = dataMarts.find(dataMart => dataMart.id === action.connectionId);

            const dataMartResult: FutureData<DataMart> = dataMart
                ? Future.success(dataMart)
                : Future.error("Data mart not found");

            return dataMartResult;
        });
    }

    private loadModelsInXMart(dataMart: DataMart): FutureData<void> {
        return this.loadModelInXMart(dataMart, xMartSyncTables.dataValues, "dataValues");
        // .flatMap(() => this.loadModelInXMart(dataMart, xMartSyncTables.events, "events"))
        // .flatMap(() => this.loadModelInXMart(dataMart, xMartSyncTables.eventValues, "eventValues"))
        // .flatMap(() => this.loadModelInXMart(dataMart, xMartSyncTables.teis, "teis"))
        // .flatMap(() => this.loadModelInXMart(dataMart, xMartSyncTables.teiAttributes, "teiAttributes"))
        // .flatMap(() => this.loadModelInXMart(dataMart, xMartSyncTables.enrollments, "enrollments"));
    }

    private loadModelInXMart(dataMart: DataMart, xmartTable: xMartTable, key: string): FutureData<void> {
        const tableFileInfo = this.generateFileInfo(xmartTable.table, `${key}_table`);

        return this.fileRepository
            .uploadFileAsExternal(tableFileInfo)
            .flatMap(url =>
                this.xMartRepository.runPipeline(dataMart, "LOAD_MODEL", {
                    url,
                    table: "TABLES",
                })
            )
            .flatMap(() => {
                const fileInfo = this.generateFileInfo(xmartTable.fields, `${key}_fields`);

                return this.fileRepository.uploadFileAsExternal(fileInfo).flatMap(url =>
                    this.xMartRepository.runPipeline(dataMart, "LOAD_MODEL", {
                        url,
                        table: "TABLE_FIELD",
                    })
                );
            });
    }

    private generateFileInfo(teis: unknown, key: string) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid(`xMART2DHIS_${key}`), name: `xMART2DHIS_${key} file`, data: blob };

        return fileInfo;
    }
}
