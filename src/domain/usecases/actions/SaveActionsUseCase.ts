import { UseCase } from "../../../compositionRoot";
import i18n from "../../../locales";
import { getUid } from "../../../utils/uid";
import { SyncAction } from "../../entities/actions/SyncAction";
import { SyncCustomAction } from "../../entities/actions/SyncCustomAction";
import _ from "lodash";
import { Future, FutureData } from "../../entities/Future";
import { Program } from "../../entities/metadata/Program";
import { DataMart } from "../../entities/xmart/DataMart";
import {
    XMartFieldDefinition,
    XMartLoadModelData,
    xMartSyncTableTemplates,
    XMartTableDefinition,
} from "../../entities/xmart/xMartSyncTableTemplates";
import { ActionRepository } from "../../repositories/ActionRepository";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";
import { FileRepository } from "../../repositories/FileRepository";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

export class SaveActionUseCase implements UseCase {
    constructor(
        private actionRepository: ActionRepository,
        private metadataRepository: MetadataRepository,
        private fileRepository: FileRepository,
        private xMartRepository: XMartRepository,
        private connectionsRepository: ConnectionsRepository
    ) {}

    public execute(action: SyncAction | SyncCustomAction): FutureData<void> {
        const isCustomAction = _.has(action, 'customCode');

        if(isCustomAction) {
            return this.actionRepository.save(action);
        }
        else {
            return this.validateModelMappings(action as SyncAction)
            .flatMap(action =>
                Future.joinObj({
                    saveResult: this.actionRepository.save(action),
                    dataMart: this.connectionsRepository.getById(action.connectionId),
                })
            )
            .flatMap(({ dataMart }) => this.loadModelsInXMart(dataMart, action as SyncAction))
            .flatMap(() => Future.success(undefined))
            .flatMapError(error => {
                return Future.error(
                    i18n.t(`An error has occurred saving the action:\n{{error}}`, { error, nsSeparator: false })
                );
            });
        }
        
    }

    validateModelMappings(action: SyncAction): FutureData<SyncAction> {
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
                    existsDataSets && !action.modelMappings.some(mapping => mapping.dhis2Model === "dataValues")
                        ? i18n.t("You need to select one dataValues mapping")
                        : null,
                events:
                    (existsNormalPrograms || existsTrackerPrograms) &&
                    !action.modelMappings.some(mapping => mapping.dhis2Model === "events")
                        ? i18n.t("You need to select one events mapping")
                        : null,
                eventValues:
                    (existsNormalPrograms || existsTrackerPrograms) &&
                    !action.modelMappings.some(mapping => mapping.dhis2Model === "eventValues")
                        ? i18n.t("You need to select one eventValues mapping")
                        : null,
                teis:
                    existsTrackerPrograms && !action.modelMappings.some(mapping => mapping.dhis2Model === "teis")
                        ? i18n.t("You need to select one tracked entity instances mapping")
                        : null,
                teiAttributes:
                    existsTrackerPrograms &&
                    !action.modelMappings.some(mapping => mapping.dhis2Model === "teiAttributes")
                        ? i18n.t("You need to select one tracked entity instance attributes mapping")
                        : null,
                enrollments:
                    existsTrackerPrograms && !action.modelMappings.some(mapping => mapping.dhis2Model === "enrollments")
                        ? i18n.t("You need to select one enrollent mapping")
                        : null,
            })
                .flat()
                .filter(error => error !== null);

            if (validationErrors.length > 0) {
                return Future.error(validationErrors.join("\n"));
            }

            return Future.success(action);
        });
    }

    private loadModelsInXMart(dataMart: DataMart, action: SyncAction): FutureData<void> {
        const initialXMARTModels: XMartLoadModelData = { tables: [], fields: [] };

        const xMARTModels: XMartLoadModelData = action.modelMappings.reduce((acc, modelMapping) => {
            const newTableDefinition: XMartTableDefinition = {
                ...xMartSyncTableTemplates[modelMapping.dhis2Model].table,
                CODE: modelMapping.xMARTTable,
                TITLE: modelMapping.xMARTTable,
            };
            const newfieldsDefinition: XMartFieldDefinition[] = xMartSyncTableTemplates[
                modelMapping.dhis2Model
            ].fields.map(field => ({
                ...field,
                TABLE_CODE: newTableDefinition.CODE,
            }));
            return { tables: [...acc.tables, newTableDefinition], fields: [...acc.fields, ...newfieldsDefinition] };
        }, initialXMARTModels);

        const tableFileInfo = this.generateFileInfo(xMARTModels, `Models`);

        return this.fileRepository
            .uploadFileAsExternal(tableFileInfo)
            .flatMap(({ url }) => this.xMartRepository.runPipeline(dataMart, "LOAD_MODEL", { url }))
            .map(() => undefined);
    }

    private generateFileInfo(teis: unknown, key: string) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid(`xMART2DHIS_${key}`), name: `xMART2DHIS_${key} file`, data: blob };

        return fileInfo;
    }
}
