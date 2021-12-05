import i18n from "../../../locales";
import { cache } from "../../../utils/cache";
import { getUid } from "../../../utils/uid";
import { DataValue } from "../../entities/data/DataValue";
import { Future, FutureData } from "../../entities/Future";
import { MetadataPackage } from "../../entities/metadata/Metadata";
import { ProgramEvent } from "../../entities/data/ProgramEvent";
import { TrackedEntityInstance } from "../../entities/data/TrackedEntityInstance";
import { DataMart } from "../../entities/xmart/XMart";
import { ActionRepository } from "../../repositories/ActionRepository";
import { AggregatedRepository } from "../../repositories/AggregatedRepository";
import { EventsRepository } from "../../repositories/EventsRepository";
import { FileRepository } from "../../repositories/FileRepository";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { TEIRepository } from "../../repositories/TEIRepository";
import { XMartRepository } from "../../repositories/XMartRepository";
import { dataMarts } from "../xmart/ListDataMartsUseCase";
import { xMartSyncTables } from "../../entities/xmart/xMartSyncTables";

type SyncResult = {
    dataValues: string;
    events: string;
    teis: string;
};

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

    public execute(actionId: string): FutureData<SyncResult> {
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
            .flatMap(({ dataMart, events, teis, dataValues }) => {
                return Future.joinObj({
                    dataValues: this.sendAggregated(dataValues, dataMart),
                    events: this.sendEvents(events, dataMart),
                    teis: this.sendTeis(teis, dataMart),
                });
            });
    }

    @cache()
    private extractMetadata(ids: string[]): FutureData<MetadataPackage> {
        return this.metadataRepository.getMetadataByIds(ids, "id,name,type");
    }

    private sendAggregated(dataValues: DataValue[], dataMart: DataMart): FutureData<string> {
        console.log({ dataValues });

        if (dataValues.length === 0) return Future.success(i18n.t(`Data values does not found`));

        const fileInfo = this.generateFileInfo(dataValues, `Aggregated`);

        return this.fileRepository
            .uploadFileAsExternal(fileInfo)
            .flatMap(url => {
                return this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                    url,
                    table: xMartSyncTables.dataValues.table.CODE,
                });
            })
            .flatMap(() =>
                Future.success(i18n.t(`Send {{count}} data values succesfully`, { count: dataValues.length }))
            );
    }

    private sendEvents(events: ProgramEvent[], dataMart: DataMart): FutureData<string> {
        console.log({ events });

        if (events.length === 0) return Future.success(i18n.t(`Events does not found`));

        const eventsFileInfo = this.generateFileInfo(events, "Events");

        return this.fileRepository
            .uploadFileAsExternal(eventsFileInfo)
            .flatMap(url => {
                return this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                    url,
                    table: xMartSyncTables.events.table.CODE,
                });
            })
            .flatMap(() => {
                const eventValues = events.map(e => e.dataValues.map(v => ({ ...v, event: e.event }))).flat();

                const eventValuesFileInfo = this.generateFileInfo(eventValues, "Event_Values");

                return this.fileRepository.uploadFileAsExternal(eventValuesFileInfo).flatMap(url =>
                    this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                        url,
                        table: xMartSyncTables.eventValues.table.CODE,
                    })
                );
            })
            .flatMap(() => Future.success(i18n.t(`Send {{count}} events succesfully`, { count: events.length })));
    }

    private sendTeis(teis: TrackedEntityInstance[], dataMart: DataMart): FutureData<string> {
        console.log({ teis });

        if (teis.length === 0) return Future.success(i18n.t(`tracked entity instances does not found`));

        const eventsFileInfo = this.generateFileInfo(teis, "TEIs");

        return this.fileRepository
            .uploadFileAsExternal(eventsFileInfo)
            .flatMap(url => {
                return this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                    url,
                    table: xMartSyncTables.teis.table.CODE,
                });
            })
            .flatMap(() => {
                const teiAttributes = teis
                    .map(t => t.attributes.map(att => ({ ...att, trackedEntityInstance: t.trackedEntityInstance })))
                    .flat();

                const attributesFileInfo = this.generateFileInfo(teiAttributes, "TEI_ATTRIBUTES");

                return this.fileRepository.uploadFileAsExternal(attributesFileInfo).flatMap(url =>
                    this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                        url,
                        table: xMartSyncTables.teiAttributes.table.CODE,
                    })
                );
            })
            .flatMap(() => {
                const enrollments = teis.map(t => t.enrollments).flat();

                const enrollmentsFileInfo = this.generateFileInfo(enrollments, "Enrollments");

                return this.fileRepository.uploadFileAsExternal(enrollmentsFileInfo).flatMap(url =>
                    this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                        url,
                        table: xMartSyncTables.enrollments.table.CODE,
                    })
                );
            })
            .flatMap(() =>
                Future.success(i18n.t(`Send {{count}} tracked entity instances succesfully`, { count: teis.length }))
            );
    }

    private generateFileInfo(teis: unknown, key: string) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid(`xMART2DHIS_${key}`), name: `xMART2DHIS_${key} file`, data: blob };

        return fileInfo;
    }
}
