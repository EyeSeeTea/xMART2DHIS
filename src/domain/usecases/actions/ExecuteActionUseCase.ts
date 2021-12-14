import { Enrollment } from "@eyeseetea/d2-api/api/trackedEntityInstances";
import _ from "lodash";
import i18n from "../../../locales";
import { cache } from "../../../utils/cache";
import { getUid } from "../../../utils/uid";
import { SyncAction } from "../../entities/actions/SyncAction";
import { DataValue, DataValueSet } from "../../entities/data/DataValue";
import { ProgramEvent, ProgramEventDataValue } from "../../entities/data/ProgramEvent";
import { TrackedEntityInstance } from "../../entities/data/TrackedEntityInstance";
import { Future, FutureData } from "../../entities/Future";
import { MetadataPackage } from "../../entities/metadata/Metadata";
import { Program } from "../../entities/metadata/Program";
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

interface EventValue extends ProgramEventDataValue {
    event: string;
}

interface TEIAttribute extends TrakedEntityAttribute {
    trackedEntityInstance: string;
}

type Data = DataValue | ProgramEvent | EventValue | TrackedEntityInstance | TEIAttribute | Enrollment;

interface DataByTable {
    table: string;
    data: Data[];
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
                    metadata: this.extractMetadata(action.metadataIds),
                    dataMart: this.connectionsRepository.getById(action.connectionId),
                });
            })
            .flatMap(({ action, metadata, dataMart }) => {
                const { programs = [], dataSets = [] } = metadata;

                const programIds = programs.map(p => p.id);
                const dataSetIds = dataSets.map(p => p.id);

                const { orgUnitPaths, period, startDate, endDate } = action;

                return Future.joinObj({
                    dataMart: Future.success(dataMart),
                    action: Future.success(action),
                    programs: Future.success(programs as Program[]),
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
            .flatMap(({ dataMart, events, teis, dataValuesSets, action, programs }) => {
                return this.sendData(dataMart, events, teis, dataValuesSets, action, programs);
            });
    }

    @cache()
    private extractMetadata(ids: string[]): FutureData<MetadataPackage> {
        return this.metadataRepository.getMetadataByIds(ids, "id,name,type,code");
    }

    private sendData(
        dataMart: DataMart,
        events: ProgramEvent[],
        teis: TrackedEntityInstance[],
        dataValueSets: DataValueSet[],
        action: SyncAction,
        programs: Program[]
    ): FutureData<string> {
        const dataValuesByTable = this.getDataValuesByXMARTTable(dataValueSets, action);
        const eventsByTable = this.getEventsByXMARTTable(events, action, programs);
        const eventsValuesByTable = this.getEventValuesByXMARTTable(events, action, programs);
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
    }

    private getDataValuesByXMARTTable(dataValueSets: DataValueSet[], action: SyncAction): DataByTable[] {
        return dataValueSets.reduce<DataByTable[]>((acc, dataValueSet) => {
            const newMapping =
                action.modelMappings.find(
                    modelMapping =>
                        modelMapping.metadataId === dataValueSet.dataSet && modelMapping.dhis2Model === "dataValues"
                ) ?? action.modelMappings.find(modelMapping => modelMapping.dhis2Model === "dataValues");

            if (!newMapping) return acc;

            const existedDataByTable = acc.find(mapping => mapping.table === newMapping.xMARTTable);

            return existedDataByTable
                ? acc.map(dataByTable =>
                      dataByTable.table === newMapping.xMARTTable
                          ? { ...dataByTable, data: [...dataByTable.data, ...dataValueSet.dataValues] }
                          : dataByTable
                  )
                : [...acc, { table: newMapping.xMARTTable, data: dataValueSet.dataValues }];
        }, []);
    }

    private getEventsByXMARTTable(events: ProgramEvent[], action: SyncAction, programs: Program[]): DataByTable[] {
        return events.reduce<DataByTable[]>((acc, event) => {
            const programId = this.getProgramIdByCode(programs, event.program);

            const newMapping =
                action.modelMappings.find(
                    modelMapping => modelMapping.metadataId === programId && modelMapping.dhis2Model === "events"
                ) ?? action.modelMappings.find(modelMapping => modelMapping.dhis2Model === "events");

            if (!newMapping) return acc;

            const existedDataByTable = acc.find(mapping => mapping.table === newMapping.xMARTTable);

            return existedDataByTable
                ? acc.map(dataByTable =>
                      dataByTable.table === newMapping.xMARTTable
                          ? { ...dataByTable, data: [...dataByTable.data, event] }
                          : dataByTable
                  )
                : [...acc, { table: newMapping.xMARTTable, data: [event] }];
        }, []);
    }

    private getEventValuesByXMARTTable(events: ProgramEvent[], action: SyncAction, programs: Program[]): DataByTable[] {
        return events.reduce<DataByTable[]>((acc, event) => {
            const programId = this.getProgramIdByCode(programs, event.program);

            const newMapping =
                action.modelMappings.find(
                    modelMapping => modelMapping.metadataId === programId && modelMapping.dhis2Model === "eventValues"
                ) ?? action.modelMappings.find(modelMapping => modelMapping.dhis2Model === "eventValues");

            if (!newMapping) return acc;

            const existedDataByTable = acc.find(mapping => mapping.table === newMapping.xMARTTable);

            const eventValues = event.dataValues.map(v => ({ ...v, event: event.event } as EventValue));

            return existedDataByTable
                ? acc.map(dataByTable =>
                      dataByTable.table === newMapping.xMARTTable
                          ? { ...dataByTable, data: [...dataByTable.data, ...eventValues] }
                          : dataByTable
                  )
                : [...acc, { table: newMapping.xMARTTable, data: eventValues }];
        }, []);
    }

    private getTeisByXMARTTable(teis: TrackedEntityInstance[], action: SyncAction, programs: Program[]): DataByTable[] {
        return teis.reduce<DataByTable[]>((acc, tei) => {
            const programOwner = _.first(tei.programOwners);
            if (!programOwner) return acc;

            const programId = this.getProgramIdByCode(programs, programOwner.program);

            const newMapping =
                action.modelMappings.find(
                    modelMapping => modelMapping.metadataId === programId && modelMapping.dhis2Model === "teis"
                ) ?? action.modelMappings.find(modelMapping => modelMapping.dhis2Model === "teis");

            if (!newMapping) return acc;

            const existedDataByTable = acc.find(mapping => mapping.table === newMapping.xMARTTable);

            return existedDataByTable
                ? acc.map(dataByTable =>
                      dataByTable.table === newMapping.xMARTTable
                          ? { ...dataByTable, data: [...dataByTable.data, tei] }
                          : dataByTable
                  )
                : [...acc, { table: newMapping.xMARTTable, data: [tei] }];
        }, []);
    }

    private getTEIAttributesByXMARTTable(
        teis: TrackedEntityInstance[],
        action: SyncAction,
        programs: Program[]
    ): DataByTable[] {
        return teis.reduce<DataByTable[]>((acc, tei) => {
            const programOwner = _.first(tei.programOwners);
            if (!programOwner) return acc;

            const programId = this.getProgramIdByCode(programs, programOwner.program);

            const newMapping =
                action.modelMappings.find(
                    modelMapping => modelMapping.metadataId === programId && modelMapping.dhis2Model === "teiAttributes"
                ) ?? action.modelMappings.find(modelMapping => modelMapping.dhis2Model === "teiAttributes");

            if (!newMapping) return acc;

            const existedDataByTable = acc.find(mapping => mapping.table === newMapping.xMARTTable);

            const teiAttributes = tei.attributes.map(
                att => ({ ...att, trackedEntityInstance: tei.trackedEntityInstance } as TEIAttribute)
            );

            return existedDataByTable
                ? acc.map(dataByTable =>
                      dataByTable.table === newMapping.xMARTTable
                          ? { ...dataByTable, data: [...dataByTable.data, ...teiAttributes] }
                          : dataByTable
                  )
                : [...acc, { table: newMapping.xMARTTable, data: teiAttributes }];
        }, []);
    }

    private getEnrollmentsByXMARTTable(
        teis: TrackedEntityInstance[],
        action: SyncAction,
        programs: Program[]
    ): DataByTable[] {
        const enrollments = teis.map(t => t.enrollments).flat();

        return enrollments.reduce<DataByTable[]>((acc, enrollment) => {
            const programId = this.getProgramIdByCode(programs, enrollment.program);

            const newMapping =
                action.modelMappings.find(
                    modelMapping => modelMapping.metadataId === programId && modelMapping.dhis2Model === "enrollments"
                ) ?? action.modelMappings.find(modelMapping => modelMapping.dhis2Model === "enrollments");

            if (!newMapping) return acc;

            const existedDataByTable = acc.find(mapping => mapping.table === newMapping.xMARTTable);

            return existedDataByTable
                ? acc.map(dataByTable =>
                      dataByTable.table === newMapping.xMARTTable
                          ? { ...dataByTable, data: [...dataByTable.data, enrollment] }
                          : dataByTable
                  )
                : [...acc, { table: newMapping.xMARTTable, data: [enrollment] }];
        }, []);
    }

    private sendDataByTable(data: Data[], dataMart: DataMart, key: string, tableCode: string): FutureData<string> {
        if (data.length === 0) return Future.success(i18n.t(`${key} does not found`));

        const fileInfo = this.generateFileInfo(data, key);

        return this.fileRepository
            .uploadFileAsExternal(fileInfo)
            .flatMap(url => {
                return this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                    url,
                    table: tableCode,
                });
            })
            .flatMap(() =>
                Future.success(i18n.t(`Send {{count}} ${key.toLowerCase()} succesfully`, { count: data.length }))
            );
    }

    private getProgramIdByCode(programs: Program[], code: string) {
        return programs.find(p => p.code === code)?.id;
    }

    private generateFileInfo(teis: unknown, key: string) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid(`xMART2DHIS_${key}`), name: `xMART2DHIS_${key} file`, data: blob };

        return fileInfo;
    }
}
