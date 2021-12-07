import { UseCase } from "../../../compositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { SyncAction } from "../../entities/actions/SyncAction";
import { ActionRepository } from "../../repositories/ActionRepository";
import { DataMart } from "../../entities/xmart/XMart";
import { dataMarts } from "../xmart/ListDataMartsUseCase";
import { FileRepository } from "../../repositories/FileRepository";
import { getUid } from "../../../utils/uid";
import { XMartRepository } from "../../repositories/XMartRepository";
import { xMartSyncTables } from "../../entities/xmart/xMartSyncTables";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { Program } from "../../entities/metadata/Program";
import i18n from "../../../locales";
//TODO: Remove this when the repository return data marts
const listDataMarts = () => Future.success(dataMarts).flatMapError(error => Future.error(String(error)));

export class SaveActionUseCase implements UseCase {
    constructor(
        private actionRepository: ActionRepository,
        private metadataRepository: MetadataRepository,
        private fileRepository: FileRepository,
        private xMartRepository: XMartRepository
    ) {}

    public execute(action: SyncAction): FutureData<void> {
        return this.validateAction(action)
            .flatMap(action =>
                Future.joinObj({
                    saveResult: this.actionRepository.save(action),
                    dataMart: this.getDataMartByAction(action),
                })
            )
            .flatMap(({ dataMart }) => this.loadModelsInXMart(dataMart))
            .flatMap(() => Future.success(undefined))
            .flatMapError(error => {
                debugger;
                return Future.error(
                    i18n.t(`An error has occurred saving the action:\n{{error}}`, { error: String(error) })
                );
            });
    }

    validateAction(action: SyncAction): FutureData<SyncAction> {
        return this.metadataRepository.getMetadataByIds(action.metadataIds, "id,programType").flatMap(metadata => {
            const existsNormalPrograms = metadata.programs?.some(
                program => (program as Program).programType === "WITHOUT_REGISTRATION"
            );
            const existsTrackerPrograms = metadata.programs?.some(
                program => (program as Program).programType === "WITH_REGISTRATION"
            );
            const existsDataSets = metadata.dataSets && metadata.dataSets?.length > 0;

            const validationErrors = Object.values({
                dataValues:
                    existsDataSets && !action.mappings.events
                        ? i18n.t("You need to select one dataValues mapping")
                        : null,
                events:
                    (existsNormalPrograms || existsTrackerPrograms) && !action.mappings.events
                        ? i18n.t("You need to select one events mapping")
                        : null,
                eventValues:
                    (existsNormalPrograms || existsTrackerPrograms) && !action.mappings.eventValues
                        ? i18n.t("You need to select one eventValues mapping")
                        : null,
                teis:
                    existsTrackerPrograms && !action.mappings.teis
                        ? i18n.t("You need to select one tracked entity instances mapping")
                        : null,
                teiAttributes:
                    existsTrackerPrograms && !action.mappings.teiAttributes
                        ? i18n.t("You need to select one tracked entity instance attributes mapping")
                        : null,
                enrollments:
                    existsTrackerPrograms && !action.mappings.events
                        ? i18n.t("You need to select one enrollent mapping")
                        : null,
            })
                .flat()
                .filter(error => error !== null);

            console.log({ validationErrors });

            if (validationErrors.length > 0) {
                return Future.error(validationErrors.join("\n"));
            }

            return Future.success(action);
        });
    }

    private getDataMartByAction(action: SyncAction): FutureData<DataMart> {
        return listDataMarts().flatMap(dataMarts => {
            const dataMart = dataMarts.find(dataMart => dataMart.id === action.connectionId);

            const dataMartResult: FutureData<DataMart> = dataMart
                ? Future.success(dataMart)
                : Future.error("Data mart not found");

            return dataMartResult;
        });
    }

    private loadModelsInXMart(dataMart: DataMart): FutureData<void> {
        const models = {
            tables: [
                xMartSyncTables.dataValues.table,
                xMartSyncTables.events.table,
                xMartSyncTables.eventValues.table,
                xMartSyncTables.teis.table,
                xMartSyncTables.teiAttributes.table,
                xMartSyncTables.enrollments.table,
            ],
            fields: [
                ...xMartSyncTables.dataValues.fields,
                ...xMartSyncTables.events.fields,
                ...xMartSyncTables.eventValues.fields,
                ...xMartSyncTables.teis.fields,
                ...xMartSyncTables.teiAttributes.fields,
                ...xMartSyncTables.enrollments.fields,
            ],
        };
        const tableFileInfo = this.generateFileInfo(models, `Models`);

        return this.fileRepository
            .uploadFileAsExternal(tableFileInfo)
            .flatMap(url =>
                this.xMartRepository.runPipeline(dataMart, "LOAD_MODEL", {
                    url,
                })
            )
            .map(() => undefined);
    }

    private generateFileInfo(teis: unknown, key: string) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid(`xMART2DHIS_${key}`), name: `xMART2DHIS_${key} file`, data: blob };

        return fileInfo;
    }
}
