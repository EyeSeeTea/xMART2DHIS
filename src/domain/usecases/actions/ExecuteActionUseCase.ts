import _ from "lodash";
import i18n from "../../../locales";
import { cache } from "../../../utils/cache";
import { getUid } from "../../../utils/uid";
import { SyncAction } from "../../entities/actions/SyncAction";
import { DataValueSet } from "../../entities/data/DataValue";
import { ProgramEvent, ProgramEventDataValue } from "../../entities/data/ProgramEvent";
import { TrackedEntityInstance } from "../../entities/data/TrackedEntityInstance";
import { Future, FutureData } from "../../entities/Future";
import { ModelMapping } from "../../entities/mapping-template/MappingTemplate";
import { MetadataPackage } from "../../entities/metadata/Metadata";
import { TrakedEntityAttribute } from "../../entities/metadata/TrackedEntityAttribute";
import { DataMart } from "../../entities/xmart/DataMart";
import { ActionRepository } from "../../repositories/ActionRepository";
import { AggregatedRepository } from "../../repositories/AggregatedRepository";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";
import { EventsRepository } from "../../repositories/EventsRepository";
import { FileRepository } from "../../repositories/FileRepository";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { TEIRepository } from "../../repositories/TEIRepository";
import { XMartRepository } from "../../repositories/XMartRepository";
import { applyXMartCodeRules, cleanOrgUnitPaths } from "../../utils";

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

interface DataValueTableItem {
    dataSet: string;
    dataSetName?: string;
    dataElement: string;
    dataElementName?: string;
    orgUnit?: string;
    orgUnitName?: string;
    period?: string;
    attributeOptionCombo?: string;
    attributeOptionComboName?: string;
    categoryOptionCombo?: string;
    categoryOptionComboName?: string;
    comment?: string;
    value: string;
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

    public execute(actionId: string): FutureData<string> {
        return this.actionRepository
            .getById(actionId)
            .flatMap(action => {
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
                });
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
                    data: this.replaceIdsByCode(events, teis, dataValuesSets, metadataInAction),
                });
            })
            .flatMap(({ dataMart, data, action }) => {
                const { events, teis, dataValuesSets, metadata } = data;
                return this.sendData(dataMart, events, teis, dataValuesSets, action, metadata);
            });
    }

    private replaceIdsByCode(
        events: ProgramEvent[],
        teis: TrackedEntityInstance[],
        dataValuesSets: DataValueSet[],
        metadataInAction: MetadataPackage
    ): FutureData<{
        events: ProgramEvent[];
        teis: TrackedEntityInstance[];
        dataValuesSets: DataValueSet[];
        metadata: MetadataMap;
    }> {
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

        return this.extractMetadata(ids).map(metadataInData => ({
            events,
            teis,
            dataValuesSets,
            metadata: new Map([...this.getMetadataPairs(metadataInAction), ...this.getMetadataPairs(metadataInData)]),
        }));
    }

    @cache()
    private extractMetadata(ids: string[]): FutureData<MetadataPackage> {
        return this.metadataRepository.getMetadataByIds(
            ids,
            "id,name,type,code,shortName,formName,created,description",
            true
        );
    }

    private sendData(
        dataMart: DataMart,
        events: ProgramEvent[],
        teis: TrackedEntityInstance[],
        dataValueSets: DataValueSet[],
        action: SyncAction,
        metadata: MetadataMap
    ): FutureData<string> {
        try {
            const dataValuesByTable = this.getDataValuesByXMARTTable(dataValueSets, action, metadata);
            const eventsByTable = this.getEventsByXMARTTable(events, action, metadata);
            const eventsValuesByTable = this.getEventValuesByXMARTTable(events, action, metadata);
            const teisByTable = this.getTeisByXMARTTable(teis, action, metadata);
            const teiAttributesByTable = this.getTEIAttributesByXMARTTable(teis, action, metadata);
            const enrollmentsByTable = this.getEnrollmentsByXMARTTable(teis, action, metadata);
            const metadataByTable = this.getMetadataByXMARTTable(metadata, action);

            const dataByTables = [
                ...metadataByTable, // Metadata must be sent first
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
        metadata: MetadataMap
    ): DataByTable[] {
        return dataValueSets.reduce<DataByTable[]>((acc, dataValueSet) => {
            const mapping = this.getModelMapping(action, "dataValues", dataValueSet.dataSet);
            const { dataSet = "" } = dataValueSet;

            const dataValuesWithDataSet: DataValueTableItem[] = dataValueSet.dataValues.map(dataValue => {
                const { categoryOptionCombo = "", attributeOptionCombo = "", orgUnit = "" } = dataValue;

                return {
                    ...dataValue,
                    dataSet,
                    dataSetName: metadata.get(dataSet)?.name ?? "",
                    dataElementName: metadata.get(dataValue.dataElement)?.name ?? "",
                    categoryOptionComboName: metadata.get(categoryOptionCombo)?.name ?? "",
                    attributeOptionComboName: metadata.get(attributeOptionCombo)?.name ?? "",
                    orgUnitName: metadata.get(orgUnit)?.name ?? "",
                };
            });

            const dataAsColumns = dataValuesWithDataSet.reduce((acc: any, dataValue: DataValueTableItem) => {
                const existedDataValue = acc.find(
                    (existed: any) =>
                        existed.dataSet === dataValue.dataSet &&
                        existed.period === dataValue.period &&
                        existed.orgUnit === dataValue.orgUnit
                );

                const createColumn = (dataValue: DataValueTableItem) => ({
                    [applyXMartCodeRules(`${dataValue.dataElement}_${dataValue.categoryOptionCombo}`)]: dataValue.value,
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
                              dataSetName: metadata.get(dataValue.dataSet)?.name ?? "",
                              period: dataValue.period,
                              orgUnit: dataValue.orgUnit,
                              orgUnitName: metadata.get(dataValue.orgUnit ?? "")?.name ?? "",
                              ...createColumn(dataValue),
                          },
                      ];
            }, []);

            const data = !mapping.valuesAsColumns ? dataValuesWithDataSet : dataAsColumns;

            return this.AddOrEditNewDataByTable(mapping, acc, data);
        }, []);
    }

    private getEventsByXMARTTable(events: ProgramEvent[], action: SyncAction, metadata: MetadataMap): DataByTable[] {
        return events.reduce<DataByTable[]>((acc, event) => {
            const mapping = this.getModelMapping(action, "events", event.program);

            const {
                program = "",
                programStage = "",
                orgUnit = "",
                attributeCategoryOptions = "",
                attributeOptionCombo = "",
            } = event;

            return this.AddOrEditNewDataByTable(mapping, acc, [
                {
                    ...event,
                    programName: metadata.get(program)?.name ?? "",
                    programStageName: metadata.get(programStage)?.name ?? "",
                    orgUnitName: metadata.get(orgUnit)?.name ?? "",
                    attributeCategoryOptionsName: metadata.get(attributeCategoryOptions)?.name ?? "",
                    attributeOptionComboName: metadata.get(attributeOptionCombo)?.name ?? "",
                },
            ]);
        }, []);
    }

    private getEventValuesByXMARTTable(
        events: ProgramEvent[],
        action: SyncAction,
        metadata: MetadataMap
    ): DataByTable[] {
        return events.reduce<DataByTable[]>((acc, event) => {
            const eventValues = event.dataValues.map(v => ({ ...v, event: event.event } as EventValue));
            const mapping = this.getModelMapping(action, "eventValues", event.programStage);

            const dataAsColumns = eventValues.reduce((acc: any, eventValue: EventValue) => {
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

            const dataAsRows = eventValues.map(item => ({
                ...item,
                dataElementName: metadata.get(item.dataElement)?.name ?? "",
            }));

            const data = !mapping.valuesAsColumns ? dataAsRows : dataAsColumns;

            return this.AddOrEditNewDataByTable(mapping, acc, data);
        }, []);
    }

    private getTeisByXMARTTable(
        teis: TrackedEntityInstance[],
        action: SyncAction,
        metadata: MetadataMap
    ): DataByTable[] {
        return teis.reduce<DataByTable[]>((acc, tei) => {
            const programOwner = _.first(tei.programOwners);
            if (!programOwner) return acc;

            const mapping = this.getModelMapping(action, "teis", programOwner.program);

            return this.AddOrEditNewDataByTable(mapping, acc, [
                { ...tei, trackedEntityTypeName: metadata.get(tei.trackedEntityType)?.name ?? "" },
            ]);
        }, []);
    }

    private getTEIAttributesByXMARTTable(
        teis: TrackedEntityInstance[],
        action: SyncAction,
        metadata: MetadataMap
    ): DataByTable[] {
        return teis.reduce<DataByTable[]>((acc, tei) => {
            const programOwner = _.first(tei.programOwners);
            if (!programOwner) return acc;

            const mapping = this.getModelMapping(action, "teiAttributes", programOwner.program);

            const teiAttributes = tei.attributes.map(
                att => ({ ...att, trackedEntityInstance: tei.trackedEntityInstance } as TEIAttribute)
            );

            const dataAsColumns = teiAttributes.reduce((acc: any, attribute: TEIAttribute) => {
                const existedAttByTEI = acc.find((existed: any) => existed.event === attribute.trackedEntityInstance);

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

            const dataAsRows = teiAttributes.map(item => ({
                ...item,
                attributeName: metadata.get(item.attribute)?.name ?? "",
            }));

            const data = !mapping.valuesAsColumns ? dataAsRows : dataAsColumns;

            return this.AddOrEditNewDataByTable(mapping, acc, data);
        }, []);
    }

    private getEnrollmentsByXMARTTable(
        teis: TrackedEntityInstance[],
        action: SyncAction,
        metadata: MetadataMap
    ): DataByTable[] {
        const enrollments = teis.map(t => t.enrollments).flat();

        return enrollments.reduce<DataByTable[]>((acc, enrollment) => {
            const mapping = this.getModelMapping(action, "enrollments", enrollment.program);

            return this.AddOrEditNewDataByTable(mapping, acc, [
                {
                    ...enrollment,
                    programName: metadata.get(enrollment.program)?.name ?? "",
                    orgUnitName: metadata.get(enrollment.orgUnit)?.name ?? "",
                },
            ]);
        }, []);
    }

    private getMetadataByXMARTTable(metadata: MetadataMap, action: SyncAction): DataByTable[] {
        const mapping = this.getModelMapping(action, "metadata");
        const data = Array.from(metadata.values());

        return [{ table: mapping.xMARTTable, data }];
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

    private getModelMapping(action: SyncAction, dhis2Model: string, metadataId?: string): ModelMapping {
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

    private getMetadataPairs(metadata: MetadataPackage): MetadataMap {
        const metadataWithTypes = _.mapValues(
            metadata,
            (array, key) =>
                array?.map(item => ({
                    id: item.id,
                    name: item.displayName ?? item.name,
                    code: item.code,
                    metadataType: key,
                    created: item.created,
                    formName: item.formName,
                    shortName: item.shortName,
                    description: item.description,
                })) ?? []
        );

        const arrays = _.values(metadataWithTypes);
        const items = _.flatten(arrays);
        const pairs: Array<[string, MetadataItem]> = _.compact(items).map(item => [item.id, item]);

        return new Map([...pairs]);
    }

    private generateFileInfo(teis: unknown, key: string) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid(`xMART2DHIS_${key}`), name: `xMART2DHIS_${key} file`, data: blob };

        return fileInfo;
    }
}

type MetadataItem = {
    id: string;
    code?: string;
    name: string;
    metadataType: string;
    created?: string;
    formName?: string;
    shortName?: string;
    description?: string;
};
type MetadataMap = Map<string, MetadataItem>;
