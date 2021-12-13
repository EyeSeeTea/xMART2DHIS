import { UseCase } from "../../../compositionRoot";
import i18n from "../../../locales";
import { getUid } from "../../../utils/uid";
import { SyncAction } from "../../entities/actions/SyncAction";
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

    public execute(action: SyncAction): FutureData<void> {
        return this.validateModelMappings(action)
            .flatMap(action =>
                Future.joinObj({
                    saveResult: this.actionRepository.save(action),
                    dataMart: this.connectionsRepository.getById(action.connectionId),
                })
            )
            .flatMap(({ dataMart }) => this.loadModelsInXMart(dataMart, action))
            .flatMap(() => Future.success(undefined))
            .flatMapError(error => {
                return Future.error(
                    i18n.t(`An error has occurred saving the action.\n{{error}}`, { error: String(error) })
                );
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

    validateModelMappings(action: SyncAction): FutureData<SyncAction> {
        return this.metadataRepository
            .getMetadataByIds(action.metadataIds, "id,programType, displayName")
            .flatMap(metadata => {
                const trackerPrograms = metadata.programs?.filter(
                    program => (program as Program).programType === "WITH_REGISTRATION"
                );

                const dataValuesErrors = !metadata.dataSets
                    ? []
                    : metadata.dataSets
                          ?.map(dataSet => {
                              return !action.modelMappings.some(
                                  mapping =>
                                      mapping.dhis2Model === "dataValues" &&
                                      (mapping.metadataId === dataSet.id || !mapping.metadataId)
                              )
                                  ? i18n.t(`The dataSet ${dataSet.displayName} has not associated a dataValues mapping`)
                                  : null;
                          })
                          .flat();

                const eventsErrors = !metadata.programs
                    ? []
                    : metadata.programs
                          ?.map(program => {
                              return !action.modelMappings.some(
                                  mapping =>
                                      mapping.dhis2Model === "events" &&
                                      (mapping.metadataId === program.id || !mapping.metadataId)
                              )
                                  ? i18n.t(`The program ${program.displayName} has not associated a events mapping`)
                                  : null;
                          })
                          .flat();

                const eventValuesErrors = !metadata.programs
                    ? []
                    : metadata.programs
                          ?.map(program => {
                              return !action.modelMappings.some(
                                  mapping =>
                                      mapping.dhis2Model === "eventValues" &&
                                      (mapping.metadataId === program.id || !mapping.metadataId)
                              )
                                  ? i18n.t(
                                        `The program ${program.displayName} has not associated a eventValues mapping`
                                    )
                                  : null;
                          })
                          .flat();

                const teisErrors = !trackerPrograms
                    ? []
                    : trackerPrograms
                          ?.map(program => {
                              return !action.modelMappings.some(
                                  mapping =>
                                      mapping.dhis2Model === "teis" &&
                                      (mapping.metadataId === program.id || !mapping.metadataId)
                              )
                                  ? i18n.t(`The program ${program.displayName} has not associated a TEIs mapping`)
                                  : null;
                          })
                          .flat();

                const teiAttributesErrors = !trackerPrograms
                    ? []
                    : trackerPrograms
                          ?.map(program => {
                              return !action.modelMappings.some(
                                  mapping =>
                                      mapping.dhis2Model === "teiAttributes" &&
                                      (mapping.metadataId === program.id || !mapping.metadataId)
                              )
                                  ? i18n.t(
                                        `The program ${program.displayName} has not associated a TEI Attributes mapping`
                                    )
                                  : null;
                          })
                          .flat();

                const enrollmentErrors = !trackerPrograms
                    ? []
                    : trackerPrograms
                          ?.map(program => {
                              return !action.modelMappings.some(
                                  mapping =>
                                      mapping.dhis2Model === "enrollments" &&
                                      (mapping.metadataId === program.id || !mapping.metadataId)
                              )
                                  ? i18n.t(
                                        `The program ${program.displayName} has not associated a enrollments mapping`
                                    )
                                  : null;
                          })
                          .flat();

                const validationErrors = [
                    ...dataValuesErrors,
                    ...eventsErrors,
                    ...eventValuesErrors,
                    ...teisErrors,
                    ...teiAttributesErrors,
                    ...enrollmentErrors,
                ].filter(error => error !== null);

                if (validationErrors.length > 0) {
                    return Future.error(validationErrors.join("\n"));
                }

                return Future.success(action);
            });
    }
}
