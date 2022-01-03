import i18n from "../../../locales";
import { generateUid } from "../../../utils/uid";
import { ModelMapping } from "../mapping-template/MappingTemplate";
import { DataSyncPeriod } from "../metadata/DataSyncPeriod";
import { ModelValidation, validateModel, ValidationError } from "../Validations";
import { Action, ActionType } from "./Action";

export interface SyncActionData extends Action {
    period: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
    orgUnitPaths: string[];
    metadataIds: string[];
    modelMappings: ModelMapping[];
}

export class SyncAction implements SyncActionData {
    public readonly id: string;
    public readonly name: string;
    public readonly type: ActionType;
    public readonly description?: string;
    public readonly connectionId: string;
    public readonly period: DataSyncPeriod;
    public readonly startDate?: Date;
    public readonly endDate?: Date;
    public readonly orgUnitPaths: string[];
    public readonly metadataIds: string[];
    public readonly modelMappings: ModelMapping[];

    constructor(data: SyncActionData) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.description = data.description;
        this.connectionId = data.connectionId;
        this.period = data.period;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.orgUnitPaths = data.orgUnitPaths;
        this.metadataIds = data.metadataIds;
        this.modelMappings = data.modelMappings;
    }

    public validate(filter?: string[]): ValidationError[] {
        return validateModel<SyncAction>(this, this.moduleValidations()).filter(
            ({ property }) => filter?.includes(property) ?? true
        );
    }

    static build(data?: Partial<Pick<SyncAction, keyof SyncActionData>>): SyncAction {
        return new SyncAction({ ...this.buildDefaultValues(), ...data });
    }

    public update(data?: Partial<Pick<SyncAction, keyof SyncActionData>>): SyncAction {
        return SyncAction.build({ ...this, ...data });
    }

    private moduleValidations(): ModelValidation[] {
        const dateValidations: ModelValidation[] =
            this.period === "FIXED"
                ? [
                      { property: "startDate", validation: { type: "Standard", validation: "hasValue" } },
                      { property: "endDate", validation: { type: "Standard", validation: "hasValue" } },
                  ]
                : [];

        return [
            { property: "name", validation: { type: "Standard", validation: "hasText" } },
            { property: "connectionId", validation: { type: "Standard", validation: "hasValue" } },
            { property: "type", validation: { type: "Standard", validation: "hasText" } },
            { property: "period", validation: { type: "Standard", validation: "hasValue" } },
            { property: "orgUnitPaths", validation: { type: "Standard", validation: "hasItems" } },
            { property: "metadataIds", validation: { type: "Standard", validation: "hasItems" } },
            { property: "modelMappings", validation: { type: "Standard", validation: "hasItems" } },
            {
                property: "modelMappings",
                validation: {
                    type: "Custom",
                    validation: {
                        error: "custom_error",
                        getDescription: (field: string) =>
                            i18n.t("Only can exists a mapping model by dhis2 model", { field }),
                        check: (value?: unknown[]) => {
                            const modelMappings = value as ModelMapping[];
                            return (
                                modelMappings.filter(modelMapping => modelMapping.dhis2Model === "dataValues").length >
                                    1 ||
                                modelMappings.filter(modelMapping => modelMapping.dhis2Model === "events").length > 1 ||
                                modelMappings.filter(modelMapping => modelMapping.dhis2Model === "eventValues").length >
                                    1 ||
                                modelMappings.filter(modelMapping => modelMapping.dhis2Model === "teis").length > 1 ||
                                modelMappings.filter(modelMapping => modelMapping.dhis2Model === "teiAttributes")
                                    .length > 1 ||
                                modelMappings.filter(modelMapping => modelMapping.dhis2Model === "enrollments").length >
                                    1
                            );
                        },
                    },
                },
            },
            ...dateValidations,
        ];
    }

    protected static buildDefaultValues = (): Pick<SyncAction, keyof SyncActionData> => {
        return {
            id: generateUid(),
            name: "",
            description: "",
            connectionId: "",
            type: "standard",
            period: "ALL",
            orgUnitPaths: [],
            metadataIds: [],
            modelMappings: [],
        };
    };

    public toData(): SyncActionData {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            connectionId: this.connectionId,
            type: this.type,
            period: this.period,
            startDate: this.startDate,
            endDate: this.endDate,
            orgUnitPaths: this.orgUnitPaths,
            metadataIds: this.metadataIds,
            modelMappings: this.modelMappings,
        };
    }
}
