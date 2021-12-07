import { generateUid } from "../../../utils/uid";
import { Dhis2ModelKey } from "../mapping/Mapping";
import { DataSyncPeriod } from "../metadata/DataSyncPeriod";
import { ModelValidation, validateModel, ValidationError } from "../Validations";

export interface SyncActionData {
    id: string;
    name: string;
    description?: string;
    connectionId: string;
    period: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
    orgUnitPaths: string[];
    metadataIds: string[];
    mappings: Partial<Record<Dhis2ModelKey, string>>;
}

export class SyncAction implements SyncActionData {
    public readonly id: string;
    public readonly name: string;
    public readonly description?: string;
    public readonly connectionId: string;
    public readonly period: DataSyncPeriod;
    public readonly startDate?: Date;
    public readonly endDate?: Date;
    public readonly orgUnitPaths: string[];
    public readonly metadataIds: string[];
    public readonly mappings: Partial<Record<Dhis2ModelKey, string>>;

    constructor(data: SyncActionData) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.connectionId = data.connectionId;
        this.period = data.period;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.orgUnitPaths = data.orgUnitPaths;
        this.metadataIds = data.metadataIds;
        this.mappings = data.mappings;
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
                      { property: "startDate", validation: "hasValue" },
                      { property: "endDate", validation: "hasValue" },
                  ]
                : [];

        return [
            { property: "name", validation: "hasText" },
            { property: "connectionId", validation: "hasValue" },
            { property: "period", validation: "hasValue" },
            { property: "orgUnitPaths", validation: "hasItems" },
            { property: "metadataIds", validation: "hasItems" },
            ...dateValidations,
        ];
    }

    protected static buildDefaultValues = (): Pick<SyncAction, keyof SyncActionData> => {
        return {
            id: generateUid(),
            name: "",
            description: "",
            connectionId: "",
            period: "ALL",
            orgUnitPaths: [],
            metadataIds: [],
            mappings: {},
        };
    };

    public toData(): SyncActionData {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            connectionId: this.connectionId,
            period: this.period,
            startDate: this.startDate,
            endDate: this.endDate,
            orgUnitPaths: this.orgUnitPaths,
            metadataIds: this.metadataIds,
            mappings: this.mappings,
        };
    }
}
