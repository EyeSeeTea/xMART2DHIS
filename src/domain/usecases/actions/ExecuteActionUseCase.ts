import i18n from "../../../locales";
import { cache } from "../../../utils/cache";
import { getUid } from "../../../utils/uid";
import { Future, FutureData } from "../../entities/Future";
import { MetadataPackage } from "../../entities/metadata/Metadata";
import { DataMart } from "../../entities/xmart/XMart";
import { ActionRepository } from "../../repositories/ActionRepository";
import { AggregatedRepository } from "../../repositories/AggregatedRepository";
import { EventsRepository } from "../../repositories/EventsRepository";
import { FileRepository } from "../../repositories/FileRepository";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { TEIRepository } from "../../repositories/TEIRepository";
import { XMartRepository } from "../../repositories/XMartRepository";
import { dataMarts } from "../xmart/ListDataMartsUseCase";
import { ProgramEvent } from "../../entities/data/ProgramEvent";
import { TrackedEntityInstance } from "../../entities/data/TrackedEntityInstance";
import { DataValue } from "../../entities/data/DataValue";
import { SyncAction } from "../../entities/actions/SyncAction";

//TODO: Remove this when the repository return data marts
const getDataMartById = (id: string) =>
    Future.success<DataMart[]>(dataMarts).flatMap(dataMarts => {
        const dataMart = dataMarts.find(dataMart => dataMart.id === id);

        const dataMartResult: FutureData<DataMart> = dataMart
            ? Future.success(dataMart)
            : Future.error("Data mart not found");

        return dataMartResult;
    });

export class ExecuteActionUseCase {
    constructor(
        private actionRepository: ActionRepository,
        private metadataRepository: MetadataRepository,
        private eventsRepository: EventsRepository,
        private teiRepository: TEIRepository,
        private aggregatedRespository: AggregatedRepository,
        private fileRepository: FileRepository,
        private xMartRepository: XMartRepository
    ) {}

    public execute(actionId: string): FutureData<string> {
        return this.actionRepository
            .getById(actionId)
            .flatMap(action => {
                return Future.joinObj({
                    action: Future.success(action),
                    metadata: this.extractMetadata(action.metadataIds),
                    dataMart: getDataMartById(action.connectionId),
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
                    events: this.eventsRepository.get({ orgUnitPaths, programIds, period, startDate, endDate }),
                    teis: this.teiRepository.get({ orgUnitPaths, programIds, period, startDate, endDate }),
                    dataValues: this.aggregatedRespository.get({
                        orgUnitPaths,
                        dataSetIds,
                        period,
                        startDate,
                        endDate,
                    }),
                });
            })
            .flatMap(({ dataMart, events, teis, dataValues, action }) => {
                return this.sendData(dataMart, events, teis, dataValues, action);
            });
    }

    @cache()
    private extractMetadata(ids: string[]): FutureData<MetadataPackage> {
        return this.metadataRepository.getMetadataByIds(ids, "id,name,type");
    }

    private sendData(
        dataMart: DataMart,
        events: ProgramEvent[],
        teis: TrackedEntityInstance[],
        dataValues: DataValue[],
        action: SyncAction
    ): FutureData<string> {
        const eventValues = events.map(e => e.dataValues.map(v => ({ ...v, event: e.event }))).flat();
        const teiAttributes = teis
            .map(t => t.attributes.map(att => ({ ...att, trackedEntityInstance: t.trackedEntityInstance })))
            .flat();
        const enrollments = teis.map(t => t.enrollments).flat();

        const dataValuesModelMapping = action.modelMappings.find(
            modelMapping => modelMapping.dhis2Model === "dataValues"
        );
        const eventsModelMapping = action.modelMappings.find(modelMapping => modelMapping.dhis2Model === "events");
        const eventValuesModelMapping = action.modelMappings.find(
            modelMapping => modelMapping.dhis2Model === "eventValues"
        );
        const teisModelMapping = action.modelMappings.find(modelMapping => modelMapping.dhis2Model === "teis");
        const teiAttributesModelMapping = action.modelMappings.find(
            modelMapping => modelMapping.dhis2Model === "teiAttributes"
        );
        const enrollmentsModelMapping = action.modelMappings.find(
            modelMapping => modelMapping.dhis2Model === "enrollments"
        );

        return Future.sequential([
            ...(dataValuesModelMapping
                ? [this.sendDataByTable(dataValues, dataMart, "Data values", dataValuesModelMapping.xMARTTable)]
                : []),
            ...(eventsModelMapping
                ? [this.sendDataByTable(events, dataMart, "Events", eventsModelMapping.xMARTTable)]
                : []),
            ...(eventValuesModelMapping
                ? [this.sendDataByTable(eventValues, dataMart, "Event values", eventValuesModelMapping.xMARTTable)]
                : []),
            ...(teisModelMapping
                ? [this.sendDataByTable(teis, dataMart, "Tracked entitiy instances", teisModelMapping.xMARTTable)]
                : []),

            ...(teiAttributesModelMapping
                ? [
                      this.sendDataByTable(
                          teiAttributes,
                          dataMart,
                          "TEI attributes",
                          teiAttributesModelMapping.xMARTTable
                      ),
                  ]
                : []),
            ...(enrollmentsModelMapping
                ? [this.sendDataByTable(enrollments, dataMart, "Enrollents", enrollmentsModelMapping.xMARTTable)]
                : []),
        ]).map((results: string[]) => results.join("\n"));
    }

    private sendDataByTable<T>(data: T[], dataMart: DataMart, key: string, tableCode: string): FutureData<string> {
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

    private generateFileInfo(teis: unknown, key: string) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid(`xMART2DHIS_${key}`), name: `xMART2DHIS_${key} file`, data: blob };

        return fileInfo;
    }
}
