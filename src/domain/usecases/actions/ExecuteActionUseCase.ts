import i18n from "../../../locales";
import { cache } from "../../../utils/cache";
import { getUid } from "../../../utils/uid";
import { DataValue } from "../../entities/DataValue";
import { Future, FutureData } from "../../entities/Future";
import { MetadataPackage } from "../../entities/Metadata";
import { ProgramEvent } from "../../entities/ProgramEvent";
import { TrackedEntityInstance } from "../../entities/TrackedEntityInstance";
import { DataMart } from "../../entities/XMart";
import { ActionRepository } from "../../repositories/ActionRepository";
import { AggregatedRepository } from "../../repositories/AggregatedRepository";
import { EventsRepository } from "../../repositories/EventsRepository";
import { FileRepository } from "../../repositories/Filerepository";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { TEIRepository } from "../../repositories/TEIRepository";
import { XMartRepository } from "../../repositories/XMartRepository";

type SyncResult = {
    dataValues: string;
    events: string;
    teis: string;
};

//TODO: Remove this when the repositoryreturn data marts
const dataMarts = Future.success<DataMart[]>([
    {
        id: "TRAINING",
        name: "[UAT] EST Playground",
        code: "TRAINING_ARC",
        type: "UAT",
        apiUrl: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/TRAINING_ARC",
    },
    {
        id: "TRAINING_RJ",
        name: "[UAT] NTD Playground",
        code: "TRAINING_RJ",
        type: "UAT",
        apiUrl: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/TRAINING_RJ",
    },
    {
        id: "REFMART-UAT",
        name: "[UAT] REFMART",
        code: "REFMART",
        type: "UAT",
        apiUrl: "https://dev.eyeseetea.com/cors/portal-uat.who.int/xmart-api/odata/REFMART",
    },
    {
        id: "REFMART-UAT-PUBLIC",
        name: "[UAT] REFMART (Public)",
        code: "REFMART",
        type: "PUBLIC",
        apiUrl: "https://dev.eyeseetea.com/cors/frontdoor-r5quteqglawbs.azurefd.net/REFMART",
    },
    {
        id: "REFMART-PROD",
        name: "[PROD] REFMART",
        code: "REFMART",
        type: "PROD",
        apiUrl: "https://dev.eyeseetea.com/cors/extranet.who.int/xmart-api/odata/REFMART",
    },
    {
        id: "REFMART-PROD-PUBLIC",
        name: "[PROD] REFMART (Public)",
        code: "REFMART",
        type: "PUBLIC",
        apiUrl: "https://dev.eyeseetea.com/cors/frontdoor-l4uikgap6gz3m.azurefd.net/REFMART",
    },
]);

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
                    dataMart: dataMarts.flatMap(dataMarts => {
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

        return this.fileRepository
            .uploadFileAsExternal(fileInfo)
            .flatMap(url => {
                return this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", {
                    url,
                    table: "AGGREGATED",
                });
            })
            .flatMap(() =>
                Future.success(i18n.t(`Send {{count}} data values succesfully`, { count: dataValues.length }))
            );
        //return Future.success(i18n.t(`send {{count}} succesfully`, { count: dataValues.length }));
    }

    private sendEvents(events: ProgramEvent[], dataMart: DataMart): FutureData<string> {
        console.log({ events });

        if (events.length === 0) return Future.success(i18n.t(`Events does not found`));

        const fileInfo = this.generateFileInfo(events);

        return (
            this.fileRepository
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

    private generateFileInfo(teis: unknown[]) {
        const value = JSON.stringify(teis);

        const blob = new Blob([value], { type: "application/json" });

        const fileInfo = { id: getUid("xMART2DHIS"), name: "xMART2DHIS file", data: blob };

        return fileInfo;
    }
}
