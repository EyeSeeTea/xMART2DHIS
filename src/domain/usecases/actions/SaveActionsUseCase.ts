import _ from "lodash";
import { UseCase } from "../../../compositionRoot";
import i18n from "../../../locales";
import { cache } from "../../../utils/cache";
import { getUid } from "../../../utils/uid";
import { SyncAction } from "../../entities/actions/SyncAction";
import { Future, FutureData } from "../../entities/Future";
import { ModelMapping } from "../../entities/mapping-template/MappingTemplate";
import { DataSet } from "../../entities/metadata/DataSet";
import { MetadataPackage } from "../../entities/metadata/Metadata";
import { Program, ProgramStage } from "../../entities/metadata/Program";
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
import { generateXMartFieldCode } from "../../utils";

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
        const metadataIds = _.compact(action.modelMappings.filter(m => m.valuesAsColumns).map(m => m.metadataId));

        return this.extractMetadata(metadataIds)
            .flatMap(metadata => {
                return Future.joinObj({
                    dataSets: this.extractMetadata(
                        metadata.dataSets?.map(ds => ds.id) || [],
                        "id,name,code,displayName,dataSetElements[dataElement[id,name,code,displayName,categoryCombo[categoryOptionCombos[id,name,code,displayName]]]"
                    ).map(m => m.dataSets || []),
                    programs: this.extractMetadata(
                        metadata.programs?.map(p => p.id) || [],
                        "id,name,code,displayName,programTrackedEntityAttributes[trackedEntityAttribute[id,name,code,displayName]]"
                    ).map(m => m.programs || []),
                    programStages: this.extractMetadata(
                        metadata.programStages?.map(ps => ps.id) || [],
                        "id,name,code,displayName,programStageDataElements[dataElement[id,name,code,displayName]]"
                    ).map(m => m.programStages || []),
                });
            })
            .flatMap(({ dataSets, programs, programStages }) => {
                const initialXMARTModels: XMartLoadModelData = { tables: [], fields: [] };

                const xMARTModels: XMartLoadModelData = action.modelMappings.reduce((acc, modelMapping) => {
                    const newTableDefinition: XMartTableDefinition = {
                        ...xMartSyncTableTemplates[modelMapping.dhis2Model].table,
                        CODE: modelMapping.xMARTTable,
                        TITLE: modelMapping.xMARTTable,
                    };

                    const newfieldsDefinition: XMartFieldDefinition[] = this.getFields(
                        dataSets as DataSet[],
                        programs as Program[],
                        programStages as ProgramStage[],
                        modelMapping
                    );
                    return {
                        tables: [...acc.tables, newTableDefinition],
                        fields: [...acc.fields, ...newfieldsDefinition],
                    };
                }, initialXMARTModels);

                const tableFileInfo = this.generateFileInfo(xMARTModels, `Models`);
                console.log({ tableFileInfo, xMARTModels });

                return this.fileRepository
                    .uploadFileAsExternal(tableFileInfo)
                    .flatMap(({ url }) => this.xMartRepository.runPipeline(dataMart, "LOAD_MODEL", { url }))
                    .map(() => undefined);
            });
    }

    private getFields(
        dataSets: DataSet[],
        programs: Program[],
        programStages: ProgramStage[],
        modelMapping: ModelMapping
    ): XMartFieldDefinition[] {
        const tableDefinition = xMartSyncTableTemplates[modelMapping.dhis2Model];
        const defaultFields = tableDefinition.fields.map(field => ({
            ...field,
            TABLE_CODE: modelMapping.xMARTTable,
        }));

        if (modelMapping.valuesAsColumns && modelMapping.metadataId) {
            const fixedFields = defaultFields.filter(f => !tableDefinition.optionalFields?.includes(f.CODE));

            const valuesAsColumnsFields =
                modelMapping.dhis2Model === "dataValues"
                    ? this.createDataValuesFieldsByDataSet(
                          modelMapping.xMARTTable,
                          dataSets.find(ds => ds.id === modelMapping.metadataId)
                      )
                    : modelMapping.dhis2Model === "eventValues"
                    ? this.createEventValuesFieldsByProgramStage(
                          modelMapping.xMARTTable,
                          programStages.find(p => p.id === modelMapping.metadataId)
                      )
                    : this.createTEIAttributesFieldsByProgram(
                          modelMapping.xMARTTable,
                          programs.find(p => p.id === modelMapping.metadataId)
                      );

            return [...fixedFields, ...valuesAsColumnsFields];
        } else {
            return defaultFields;
        }
    }

    private createDataValuesFieldsByDataSet(tableCode: string, dataSet?: DataSet): XMartFieldDefinition[] {
        if (!dataSet) return [];

        const fields = dataSet.dataSetElements
            .map(dataElementSet =>
                dataElementSet.dataElement.categoryCombo.categoryOptionCombos.map(coc => {
                    const dataElementCode = generateXMartFieldCode(dataElementSet.dataElement);
                    const cocCode = generateXMartFieldCode(coc);
                    const field = `${dataElementCode}_${cocCode}`;
                    return {
                        TABLE_CODE: tableCode,
                        CODE: field,
                        TITLE: field,
                        FIELD_TYPE_CODE: "TEXT_MAX",
                        IS_REQUIRED: 0,
                        IS_PRIMARY_KEY: 0,
                        IS_ROW_TITLE: 0,
                    } as XMartFieldDefinition;
                })
            )
            .flat();

        return fields;
    }

    private createEventValuesFieldsByProgramStage(
        tableCode: string,
        programStage?: ProgramStage
    ): XMartFieldDefinition[] {
        if (!programStage) return [];

        const fields = programStage.programStageDataElements.map(stageDataElement => {
            const field = generateXMartFieldCode(stageDataElement.dataElement);

            return {
                TABLE_CODE: tableCode,
                CODE: field,
                TITLE: field,
                FIELD_TYPE_CODE: "TEXT_MAX",
                IS_REQUIRED: 0,
                IS_PRIMARY_KEY: 0,
                IS_ROW_TITLE: 0,
            } as XMartFieldDefinition;
        });

        return fields;
    }

    private createTEIAttributesFieldsByProgram(tableCode: string, program?: Program): XMartFieldDefinition[] {
        if (!program) return [];

        const fields = program.programTrackedEntityAttributes
            .map(programAttribute => {
                const field = generateXMartFieldCode(programAttribute.trackedEntityAttribute);

                return {
                    TABLE_CODE: tableCode,
                    CODE: field,
                    TITLE: field,
                    FIELD_TYPE_CODE: "TEXT_MAX",
                    IS_REQUIRED: 0,
                    IS_PRIMARY_KEY: 0,
                    IS_ROW_TITLE: 0,
                } as XMartFieldDefinition;
            })
            .flat();

        return fields;
    }

    @cache()
    private extractMetadata(ids: string[], fields = "id"): FutureData<MetadataPackage> {
        if (ids.length === 0) Future.success({});

        return this.metadataRepository.getMetadataByIds(ids, fields, true);
    }

    private generateFileInfo(teis: unknown, key: string) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid(`xMART2DHIS_${key}`), name: `xMART2DHIS_${key} file`, data: blob };

        return fileInfo;
    }

    validateModelMappings(action: SyncAction): FutureData<SyncAction> {
        return this.metadataRepository
            .getMetadataByIds(action.metadataIds, "id,programType,displayName,programStages[id,displayName]")
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
                                  ? i18n.t(`The program ${program.displayName} has not associated an events mapping`)
                                  : null;
                          })
                          .flat();

                const eventValuesErrors = !metadata.programs
                    ? []
                    : metadata.programs
                          ?.map(p => {
                              const program = p as Program;

                              return program.programStages
                                  .map(programStage => {
                                      return !action.modelMappings.some(
                                          mapping =>
                                              mapping.dhis2Model === "eventValues" &&
                                              (mapping.metadataId === programStage.id || !mapping.metadataId)
                                      )
                                          ? i18n.t(
                                                `The program stage ${programStage.displayName} in the program ${program.displayName} has not associated an eventValues mapping`
                                            )
                                          : null;
                                  })
                                  .flat();
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
