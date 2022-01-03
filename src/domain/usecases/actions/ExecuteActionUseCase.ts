import _ from "lodash";
import i18n from "../../../locales";
import { cache } from "../../../utils/cache";
import { getUid } from "../../../utils/uid";
import { SyncAction } from "../../entities/actions/SyncAction";
import { DataValue, DataValueSet } from "../../entities/data/DataValue";
import { ProgramEvent, ProgramEventDataValue } from "../../entities/data/ProgramEvent";
import { TrackedEntityInstance } from "../../entities/data/TrackedEntityInstance";
import { Future, FutureData } from "../../entities/Future";
import { ModelMapping } from "../../entities/mapping-template/MappingTemplate";
import { TrakedEntityAttribute } from "../../entities/metadata/TrackedEntityAttribute";
import { IdentifiableObject, MetadataEntities, MetadataPackage } from "../../entities/metadata/Metadata";
import { DataMart } from "../../entities/xmart/DataMart";
import { ActionRepository } from "../../repositories/ActionRepository";
import { AggregatedRepository } from "../../repositories/AggregatedRepository";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";
import { EventsRepository } from "../../repositories/EventsRepository";
import { FileRepository } from "../../repositories/FileRepository";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { TEIRepository } from "../../repositories/TEIRepository";
import { XMartRepository } from "../../repositories/XMartRepository";
import { timeout } from "../../../utils/promises";
import { applyXMartCodeRules, cleanOrgUnitPaths, getIdentifiable } from "../../utils";

interface EventValue extends ProgramEventDataValue {
    event: string;
}

interface TEIAttribute extends TrakedEntityAttribute {
    trackedEntityInstance: string;
}

interface DataByTable {
    table: string;
    data: unknown[];
}

interface DataValueWithDataSet extends DataValue {
    dataSet: string;
}

export class ExecuteActionUseCase {
    constructor(
        private actionRepository: ActionRepository,
        private metadataRepository: MetadataRepository,
        private eventsRepository: EventsRepository,
        private teiRepository: TEIRepository,
        private aggregatedRespository: AggregatedRepository,
        private fileRepository: FileRepository,
        private xMartRepository: XMartRepository,
        private connectionsRepository: ConnectionsRepository
    ) {}

    public execute(actionId: string[], delay = 500): FutureData<string[]> {
        return this.actionRepository
            .getMultipleById(actionId)
            .flatMap(actions => {
                const orderedActions = _.sortBy(actions, ["scheduling.sequence", "scheduling.variable", "id"]);
                return Future.futureMap(orderedActions, (action) => {
                    return Future.joinObj({
                        action: Future.success(action),
                        metadataInAction: this.extractMetadata(
                            _.uniq([
                                ...action.metadataIds,
                                ...cleanOrgUnitPaths(action.orgUnitPaths),
                                ..._(action.modelMappings.map(m => m.metadataId).flat())
                                    .compact()
                                    .value(),
                            ])
                        ),
                        dataMart: this.connectionsRepository.getById(action.connectionId),
                    })
                    .flatMap(({ action, metadataInAction, dataMart }) => {
                        const { programs = [], dataSets = [] } = metadataInAction;
        
                        const programIds = programs.map(p => p.id);
                        const dataSetIds = dataSets.map(p => p.id);
        
                        const { orgUnitPaths, period, startDate, endDate } = action;
        
                        return Future.joinObj({
                            dataMart: Future.success(dataMart),
                            action: Future.success(action),
                            metadataInAction: Future.success(metadataInAction),
                            events: this.eventsRepository.get({ orgUnitPaths, programIds, period, startDate, endDate }),
                            teis: this.teiRepository.get({ orgUnitPaths, programIds, period, startDate, endDate }),
                            dataValuesSets: Future.sequential(
                                dataSetIds.map(dataSetId =>
                                    this.aggregatedRespository.get({
                                        orgUnitPaths,
                                        dataSetIds: [dataSetId],
                                        period,
                                        startDate,
                                        endDate,
                                    })
                                )
                            ),
                        });
                    })
                    .flatMap(({ dataMart, events, teis, dataValuesSets, action, metadataInAction }) => {
                        return Future.joinObj({
                            dataMart: Future.success(dataMart),
                            action: Future.success(action),
                            metadataInAction: Future.success(metadataInAction),
                            data: this.replaceIdsByCode(events, teis, dataValuesSets, metadataInAction),
                        });
                    })
                    .flatMap(result => Future.fromPromise<string, unknown>(timeout(delay)).map(() => result))
                    .flatMap(({ dataMart, data, action, metadataInAction }) => {
                        const { events, teis, dataValuesSets } = data;
                        return this.sendData(dataMart, events, teis, dataValuesSets, action, metadataInAction);                    });
                })
 
            })
    }
    private replaceIdsByCode(
        events: ProgramEvent[],
        teis: TrackedEntityInstance[],
        dataValuesSets: DataValueSet[],
        metadataInAction: MetadataPackage
    ): FutureData<{ events: ProgramEvent[]; teis: TrackedEntityInstance[]; dataValuesSets: DataValueSet[] }> {
        const idsInEvents = events.reduce<string[]>((acc, event) => {
            const dataElementIds = event.dataValues.map(dv => dv.dataElement);
            const ids: string[] = _.compact([
                ...dataElementIds,
                event.attributeOptionCombo ?? null,
                event.attributeCategoryOptions ?? null,
                event.programStage ?? null,
            ]);

            return [...acc, ...ids];
        }, []);

        const idsInDataValues = dataValuesSets.reduce<string[]>((acc, dataValueSet) => {
            const ids: string[] = _.compact([
                ...dataValueSet.dataValues.map(dv => dv.dataElement),
                ...dataValueSet.dataValues.map(dv => dv.categoryOptionCombo ?? null),
                ...dataValueSet.dataValues.map(dv => dv.attributeOptionCombo ?? null),
            ]);

            return [...acc, ...ids];
        }, []);

        const idsTEIs = teis.reduce<string[]>((acc, tei) => {
            const attributeIds = tei.attributes.map(att => att.attribute);
            return [...acc, ...attributeIds];
        }, []);

        const ids = _.uniq([...idsTEIs, ...idsInDataValues, ...idsInEvents]);

        return this.extractMetadata(ids).flatMap(metadataInData => {
            const eventWithCodes = events.map(event => {
                const orgUnit = this.getCode(metadataInAction, "organisationUnits", event.orgUnit);
                const program = this.getCode(metadataInAction, "programs", event.program);
                const programStage = this.getCode(metadataInData, "programStages", event.programStage);

                const attributeCategoryOptions = this.getCode(
                    metadataInData,
                    "categoryOptions",
                    event.attributeCategoryOptions
                );

                const attributeOptionCombo = this.getCode(
                    metadataInData,
                    "categoryOptionCombos",
                    event.attributeOptionCombo
                );

                return {
                    ...event,
                    orgUnit,
                    program,
                    programStage,
                    attributeCategoryOptions,
                    attributeOptionCombo,
                    dataValues: event.dataValues.map(v => {
                        const dataElement = this.getCode(metadataInData, "dataElements", v.dataElement);
                        return { ...v, dataElement };
                    }),
                };
            });

            const dataValuesSetsWithCodes = dataValuesSets.map(dvs => {
                const dataSet = this.getCode(metadataInAction, "dataSets", dvs.dataSet);

                return {
                    dataSet,
                    dataValues: dvs.dataValues.map(dv => {
                        const orgUnit = this.getCode(metadataInAction, "organisationUnits", dv.orgUnit);

                        const dataElement = this.getCode(metadataInData, "dataElements", dv.dataElement);

                        const categoryOptionCombo = this.getCode(
                            metadataInData,
                            "categoryOptionCombos",
                            dv.categoryOptionCombo
                        );

                        const attributeOptionCombo = this.getCode(
                            metadataInData,
                            "categoryOptionCombos",
                            dv.attributeOptionCombo
                        );

                        return {
                            ...dv,
                            orgUnit,
                            dataElement,
                            categoryOptionCombo,
                            attributeOptionCombo,
                        };
                    }),
                };
            });

            const teisWithCodes = teis.map(tei => {
                return {
                    ...tei,
                    attributes: tei.attributes.map(att => {
                        const attribute = this.getCode(metadataInData, "trackedEntityAttributes", att.attribute);
                        return { ...att, attribute };
                    }),
                    enrollments: tei.enrollments.map(enrollment => {
                        const orgUnit = this.getCode(metadataInAction, "organisationUnits", enrollment.orgUnit);
                        const program = this.getCode(metadataInAction, "programs", enrollment.program);

                        return { ...enrollment, orgUnit, program };
                    }),
                    programOwners: tei.programOwners.map(owner => {
                        const program = this.getCode(metadataInAction, "programs", owner.program);

                        return { ...owner, program };
                    }),
                };
            });

            return Future.success({
                events: eventWithCodes,
                teis: teisWithCodes,
                dataValuesSets: dataValuesSetsWithCodes,
            });
        });
    }

    private getCode(metadata: MetadataPackage, key: keyof MetadataEntities, id?: string): string {
        if (!id) return "";

        const object = metadata[key]?.find(m => m.id === id);
        return object ? getIdentifiable(object) : id;
    }

    @cache()
    private extractMetadata(ids: string[]): FutureData<MetadataPackage> {
        return this.metadataRepository.getMetadataByIds(ids, "id,name,type,code", true);
    }

    private sendData(
        dataMart: DataMart,
        events: ProgramEvent[],
        teis: TrackedEntityInstance[],
        dataValueSets: DataValueSet[],
        action: SyncAction,
        metadataInAction: MetadataPackage
    ): FutureData<string> {
        try {
            const programs = metadataInAction.programs || [];
            const programStages = metadataInAction.programStages || [];
            const dataSets = metadataInAction.dataSets || [];

            const dataValuesByTable = this.getDataValuesByXMARTTable(dataValueSets, action, dataSets);
            const eventsByTable = this.getEventsByXMARTTable(events, action, programs);
            const eventsValuesByTable = this.getEventValuesByXMARTTable(events, action, programStages);
            const teisByTable = this.getTeisByXMARTTable(teis, action, programs);
            const teiAttributesByTable = this.getTEIAttributesByXMARTTable(teis, action, programs);
            const enrollmentsByTable = this.getEnrollmentsByXMARTTable(teis, action, programs);

            const dataByTables = [
                ...dataValuesByTable,
                ...eventsByTable,
                ...eventsValuesByTable,
                ...teisByTable,
                ...teiAttributesByTable,
                ...enrollmentsByTable,
            ];

            return Future.sequential(
                dataByTables.map(dataByTable => {
                    return this.sendDataByTable(dataByTable.data, dataMart, dataByTable.table, dataByTable.table);
                })
            ).map((results: string[]) => results.join("\n"));
        } catch (error) {
            return Future.error(String(error));
        }
    }

    private getDataValuesByXMARTTable(
        dataValueSets: DataValueSet[],
        action: SyncAction,
        dataSets: IdentifiableObject[]
    ): DataByTable[] {
        return dataValueSets.reduce<DataByTable[]>((acc, dataValueSet) => {
            const dataSetId = this.getMetadataIdByCode(dataSets, dataValueSet.dataSet ?? "");
            const mapping = this.getModelMapping(action, "dataValues", dataSetId);

            const dataValuesWithDataSet: DataValueWithDataSet[] = dataValueSet.dataValues.map(dv => ({
                ...dv,
                dataSet: dataValueSet.dataSet ?? "",
            }));

            const convertDataAsColumns = () =>
                dataValuesWithDataSet.reduce((acc: any, dataValue: DataValueWithDataSet) => {
                    const existedDataValue = acc.find(
                        (existed: any) =>
                            existed.dataSet === dataValue.dataSet &&
                            existed.period === dataValue.period &&
                            existed.orgUnit === dataValue.orgUnit
                    );

                    const createColumn = (dataValue: DataValueWithDataSet) => ({
                        [applyXMartCodeRules(`${dataValue.dataElement}_${dataValue.categoryOptionCombo}`)]:
                            dataValue.value,
                    });

                    return existedDataValue
                        ? acc.map((dv: any) =>
                              dv.dataSet === existedDataValue.dataSet &&
                              dv.period === existedDataValue.period &&
                              dv.orgUnit === existedDataValue.orgUnit
                                  ? { ...dv, ...createColumn(dataValue) }
                                  : dv
                          )
                        : [
                              ...acc,
                              {
                                  dataSet: dataValue.dataSet,
                                  period: dataValue.period,
                                  orgUnit: dataValue.orgUnit,
                                  ...createColumn(dataValue),
                              },
                          ];
                }, []);

            const data = !mapping.valuesAsColumns ? dataValuesWithDataSet : convertDataAsColumns();

            return this.AddOrEditNewDataByTable(mapping, acc, data);
        }, []);
    }

    private getEventsByXMARTTable(
        events: ProgramEvent[],
        action: SyncAction,
        programs: IdentifiableObject[]
    ): DataByTable[] {
        return events.reduce<DataByTable[]>((acc, event) => {
            const programId = this.getMetadataIdByCode(programs, event.program);
            const mapping = this.getModelMapping(action, "events", programId);

            return this.AddOrEditNewDataByTable(mapping, acc, [event]);
        }, []);
    }

    private getEventValuesByXMARTTable(
        events: ProgramEvent[],
        action: SyncAction,
        programStages: IdentifiableObject[]
    ): DataByTable[] {
        return events.reduce<DataByTable[]>((acc, event) => {
            const programStageId = this.getMetadataIdByCode(programStages, event.programStage ?? "");
            const eventValues = event.dataValues.map(v => ({ ...v, event: event.event } as EventValue));
            const mapping = this.getModelMapping(action, "eventValues", programStageId);

            const convertDataAsColumns = () =>
                eventValues.reduce((acc: any, eventValue: EventValue) => {
                    const existedEventValue = acc.find((existed: any) => existed.event === eventValue.event);

                    const createColumn = (value: EventValue) => ({
                        [applyXMartCodeRules(value.dataElement)]: value.value,
                    });

                    return existedEventValue
                        ? acc.map((ev: any) =>
                              ev.event === existedEventValue.event ? { ...ev, ...createColumn(eventValue) } : ev
                          )
                        : [
                              ...acc,
                              {
                                  event: eventValue.event,
                                  ...createColumn(eventValue),
                              },
                          ];
                }, []);

            const data = !mapping.valuesAsColumns ? eventValues : convertDataAsColumns();

            return this.AddOrEditNewDataByTable(mapping, acc, data);
        }, []);
    }

    private getTeisByXMARTTable(
        teis: TrackedEntityInstance[],
        action: SyncAction,
        programs: IdentifiableObject[]
    ): DataByTable[] {
        return teis.reduce<DataByTable[]>((acc, tei) => {
            const programOwner = _.first(tei.programOwners);
            if (!programOwner) return acc;

            const programId = this.getMetadataIdByCode(programs, programOwner.program);
            const mapping = this.getModelMapping(action, "teis", programId);

            return this.AddOrEditNewDataByTable(mapping, acc, [tei]);
        }, []);
    }

    private getTEIAttributesByXMARTTable(
        teis: TrackedEntityInstance[],
        action: SyncAction,
        programs: IdentifiableObject[]
    ): DataByTable[] {
        return teis.reduce<DataByTable[]>((acc, tei) => {
            const programOwner = _.first(tei.programOwners);
            if (!programOwner) return acc;

            const programId = this.getMetadataIdByCode(programs, programOwner.program);
            const mapping = this.getModelMapping(action, "teiAttributes", programId);

            const teiAttributes = tei.attributes.map(
                att => ({ ...att, trackedEntityInstance: tei.trackedEntityInstance } as TEIAttribute)
            );

            const convertDataAsColumns = () =>
                teiAttributes.reduce((acc: any, attribute: TEIAttribute) => {
                    const existedAttByTEI = acc.find(
                        (existed: any) => existed.event === attribute.trackedEntityInstance
                    );

                    const createColumn = (att: TEIAttribute) => ({
                        [applyXMartCodeRules(att.attribute)]: att.value,
                    });

                    return existedAttByTEI
                        ? acc.map((att: any) =>
                              att.trackedEntityInstance === attribute.trackedEntityInstance
                                  ? { ...att, ...createColumn(attribute) }
                                  : att
                          )
                        : [
                              ...acc,
                              {
                                  trackedEntityInstance: attribute.trackedEntityInstance,
                                  ...createColumn(attribute),
                              },
                          ];
                }, []);

            const data = !mapping.valuesAsColumns ? teiAttributes : convertDataAsColumns();

            return this.AddOrEditNewDataByTable(mapping, acc, data);
        }, []);
    }

    private getEnrollmentsByXMARTTable(
        teis: TrackedEntityInstance[],
        action: SyncAction,
        programs: IdentifiableObject[]
    ): DataByTable[] {
        const enrollments = teis.map(t => t.enrollments).flat();

        return enrollments.reduce<DataByTable[]>((acc, enrollment) => {
            const programId = this.getMetadataIdByCode(programs, enrollment.program);
            const mapping = this.getModelMapping(action, "enrollments", programId);

            return this.AddOrEditNewDataByTable(mapping, acc, [enrollment]);
        }, []);
    }

    private AddOrEditNewDataByTable(
        modelMapping: ModelMapping,
        dataByTables: DataByTable[],
        newData: unknown[]
    ): DataByTable[] {
        const existedDataByTable = dataByTables.find(mapping => mapping.table === modelMapping.xMARTTable);

        return existedDataByTable
            ? dataByTables.map(dataByTable =>
                  dataByTable.table === modelMapping.xMARTTable
                      ? { ...dataByTable, data: [...dataByTable.data, ...newData] }
                      : dataByTable
              )
            : [...dataByTables, { table: modelMapping.xMARTTable, data: newData }];
    }

    private getModelMapping(action: SyncAction, dhis2Model: string, metadataId: string): ModelMapping {
        const newMapping =
            action.modelMappings.find(
                modelMapping => modelMapping.dhis2Model === dhis2Model && modelMapping.metadataId === metadataId
            ) ??
            action.modelMappings.find(
                modelMapping => modelMapping.dhis2Model === dhis2Model && !modelMapping.metadataId
            );

        if (!newMapping) {
            throw new Error(
                `An error has ocurred converting ${dhis2Model} for metadata Id ${metadataId} to xMART data because a mapping has not been found.`
            );
        } else {
            return newMapping;
        }
    }

    private sendDataByTable(data: unknown[], dataMart: DataMart, key: string, tableCode: string): FutureData<string> {
        if (data.length === 0) return Future.success(i18n.t(`${tableCode} 0 rows`));

        const fileInfo = this.generateFileInfo(data, key);

        return this.fileRepository
            .uploadFileAsExternal(fileInfo)
            .flatMap(({ url }) => {
                return this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", { url, table: tableCode });
            })
            .flatMap(() => Future.success(i18n.t(`${tableCode} {{count}} rows`, { count: data.length })));
    }

    private getMetadataIdByCode(items: IdentifiableObject[], code: string) {
        return items.find(p => p.code === code || p.name === code)?.id ?? "";
    }

    private generateFileInfo(teis: unknown, key: string) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid(`xMART2DHIS_${key}`), name: `xMART2DHIS_${key} file`, data: blob };

        return fileInfo;
    }
}
