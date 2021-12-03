import { cache } from "../../../utils/cache";
import { Future, FutureData } from "../../entities/Future";
import { MetadataPackage } from "../../entities/Metadata";
import { ActionRepository } from "../../repositories/ActionRepository";
import { AggregatedRepository } from "../../repositories/AggregatedRepository";
import { EventsRepository } from "../../repositories/EventsRepository";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { TEIRepository } from "../../repositories/TEIRepository";

type SyncResult = {
    success: boolean;
};

export class ExecuteActionUseCase {
    constructor(
        private actionRepository: ActionRepository,
        private metadataRepository: MetadataRepository,
        private eventsRepository: EventsRepository,
        private teiRepository: TEIRepository,
        private aggregatedRespository: AggregatedRepository
    ) {}

    public execute(actionId: string): FutureData<SyncResult> {
        return this.actionRepository
            .getById(actionId)
            .flatMap(action => {
                return Future.joinObj({
                    action: Future.success(action),
                    metadata: this.extractMetadata(action.metadataIds),
                });
            })
            .flatMap(({ action, metadata }) => {
                const { programs = [], dataSets = [] } = metadata;

                const programIds = programs.map(p => p.id);
                const dataSetIds = dataSets.map(p => p.id);

                const { orgUnitPaths, period, startDate, endDate } = action;

                return Future.joinObj({
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
            .flatMap(({ events, teis, dataValues }) => {
                console.log({ events });
                console.log({ teis });
                console.log({ dataValues });

                return Future.success({ success: true });
            });
    }

    @cache()
    private extractMetadata(ids: string[]): FutureData<MetadataPackage> {
        return this.metadataRepository.getMetadataByIds(ids, "id,name,type");
    }
}
