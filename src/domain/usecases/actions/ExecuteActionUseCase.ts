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

//TODO: Remove this when the repositoryreturn data marts
const listDataMarts = () => Future.success<DataMart[]>(dataMarts);

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
                    dataMart: listDataMarts().flatMap(dataMarts => {
                        const dataMart = dataMarts.find(dataMart => dataMart.id === action.connectionId);

                        const dataMartResult: FutureData<DataMart> = dataMart
                            ? Future.success(dataMart)
                            : Future.error("Data mart not found");

                        return dataMartResult;
                    }),
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

        const fileInfo = this.generateFileInfo(dataValues);

        return (
            this.fileRepository
                .uploadFileAsExternal(fileInfo)
                //TODO: When xmart has a post endpoint this will be not necessary
                .flatMap(url => {
                    return this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                        url,
                        table: xMartSyncTables.dataValues.table.CODE,
                    });
                })
                .flatMap(() =>
                    Future.success(i18n.t(`Send {{count}} data values succesfully`, { count: dataValues.length }))
                )
        );
        //return Future.success(i18n.t(`send {{count}} succesfully`, { count: dataValues.length }));
    }

    private sendEvents(events: ProgramEvent[], dataMart: DataMart): FutureData<string> {
        console.log({ events });

        if (events.length === 0) return Future.success(i18n.t(`Events does not found`));

        const fileInfo = this.generateFileInfo(events);

        return (
            this.fileRepository
                //TODO: When xmart has a post endpoint this will be not necessary
                .uploadFileAsExternal(fileInfo)
                // .flatMap(url => {
                //     return this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                //         url,
                //         table: "AGGREGATED",
                //     });
                // })
                .flatMap(() => Future.success(i18n.t(`Send {{count}} events succesfully`, { count: events.length })))
        );

        //return Future.success(i18n.t(`send {{count}} succesfully`, { count: events.length }));
    }

    private sendTeis(teis: TrackedEntityInstance[], dataMart: DataMart): FutureData<string> {
        console.log({ teis });

        if (teis.length === 0) return Future.success(i18n.t(`tracked entity instances does not found`));

        const fileInfo = this.generateFileInfo(teis);

        return (
            this.fileRepository
                //TODO: When xmart has a post endpoint this will be not necessary
                .uploadFileAsExternal(fileInfo)
                // .flatMap(url => {
                //     return this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                //         url,
                //         table: "AGGREGATED",
                //     });
                // })
                .flatMap(() =>
                    Future.success(
                        i18n.t(`Send {{count}} tracked entity instances succesfully`, { count: teis.length })
                    )
                )
        );

        //return Future.success(i18n.t(`send {{count}} succesfully`, { count: teis.length }));
    }

    //TODO: When xmart has a post endpoint this will be not necessary
    private generateFileInfo(teis: unknown[]) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid("xMART2DHIS"), name: "xMART2DHIS file", data: blob };

        return fileInfo;
    }
}
