import _ from "lodash";
import i18n from "../../../locales";
import { cache } from "../../../utils/cache";
import { getUid } from "../../../utils/uid";
import { SyncAction } from "../../entities/actions/SyncAction";
import { DataValue } from "../../entities/data/DataValue";
import { ProgramEvent } from "../../entities/data/ProgramEvent";
import { TrackedEntityInstance } from "../../entities/data/TrackedEntityInstance";
import { Future, FutureData } from "../../entities/Future";
import { MetadataEntities, MetadataPackage } from "../../entities/metadata/Metadata";
import { DataMart } from "../../entities/xmart/DataMart";
import { ActionRepository } from "../../repositories/ActionRepository";
import { AggregatedRepository } from "../../repositories/AggregatedRepository";
import { ConnectionsRepository } from "../../repositories/ConnectionsRepository";
import { EventsRepository } from "../../repositories/EventsRepository";
import { FileRepository } from "../../repositories/FileRepository";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { TEIRepository } from "../../repositories/TEIRepository";
import { XMartRepository } from "../../repositories/XMartRepository";
import { cleanOrgUnitPaths } from "../../utils";
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
                    metadataInAction: this.extractMetadata([
                        ...action.metadataIds,
                        ...cleanOrgUnitPaths(action.orgUnitPaths),
                    ]),
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
                    dataValues: this.aggregatedRespository.get({
                        orgUnitPaths,
                        dataSetIds,
                        period,
                        startDate,
                        endDate,
                    }),
                });
            })
            .flatMap(({ dataMart, events, teis, dataValues, action, metadataInAction }) => {
                return Future.joinObj({
                    dataMart: Future.success(dataMart),
                    action: Future.success(action),
                    data: this.replaceIdsByCode(events, teis, dataValues, metadataInAction),
                });
            })
            .flatMap(({ dataMart, data, action }) => {
                const { events, teis, dataValues } = data;
                return this.sendData(dataMart, events, teis, dataValues, action);
            });
    }
    private replaceIdsByCode(
        events: ProgramEvent[],
        teis: TrackedEntityInstance[],
        dataValues: DataValue[],
        metadataInAction: MetadataPackage
    ): FutureData<{ events: ProgramEvent[]; teis: TrackedEntityInstance[]; dataValues: DataValue[] }> {
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

        const idsInDataValues = dataValues.reduce<string[]>((acc, dataValue) => {
            const ids: string[] = _.compact([
                dataValue.dataElement,
                dataValue.categoryOptionCombo ?? null,
                dataValue.attributeOptionCombo ?? null,
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

            const dataValuesWithCodes = dataValues.map(dv => {
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
                };
            });

            return Future.success({ events: eventWithCodes, teis: teisWithCodes, dataValues: dataValuesWithCodes });
        });
    }

    private getCode(metadata: MetadataPackage, key: keyof MetadataEntities, id?: string): string {
        if (!id) return "";

        const object = metadata[key]?.find(m => m.id === id);
        return object?.code ?? object?.name ?? object?.id ?? id;
    }

    @cache()
    private extractMetadata(ids: string[]): FutureData<MetadataPackage> {
        return this.metadataRepository.getMetadataByIds(ids, "id,name,type,code", true);
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

    private sendDataByTable<T>(data: T[], dataMart: DataMart, key: string, table: string): FutureData<string> {
        if (data.length === 0) return Future.success(i18n.t(`${key} does not found`));

        const fileInfo = this.generateFileInfo(data, key);

        return this.fileRepository
            .uploadFileAsExternal(fileInfo)
            .flatMap(({ url }) => {
                return this.xMartRepository.runPipeline(dataMart, "LOAD_DATA", { url, table });
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
