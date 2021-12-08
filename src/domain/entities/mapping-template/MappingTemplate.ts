import { generateUid } from "../../../utils/uid";
import { ModelValidation, validateModel, ValidationError } from "../Validations";

export interface MappingTemplateData {
    id: string;
    name: string;
    connectionId: string;
    modelMappings: ModelMapping[];
    default?: boolean;
}

export interface ModelMapping {
    dhis2Model: Dhis2ModelKey;
    xMARTTable: string;
}

export type Dhis2ModelKey = "dataValues" | "events" | "eventValues" | "teis" | "teiAttributes" | "enrollments";

export class MappingTemplate implements MappingTemplateData {
    public readonly id: string;
    public readonly name: string;
    public readonly connectionId: string;
    public readonly modelMappings: ModelMapping[];
    public readonly default?: boolean;

    constructor(data: MappingTemplateData) {
        this.id = data.id;
        this.name = data.name;
        this.connectionId = data.connectionId;
        this.modelMappings = data.modelMappings;
        this.default = data.default;
    }

    public validate(filter?: string[]): ValidationError[] {
        return validateModel<MappingTemplate>(this, this.moduleValidations()).filter(
            ({ property }) => filter?.includes(property) ?? true
        );
    }

    static build(data?: Partial<Pick<MappingTemplate, keyof MappingTemplateData>>): MappingTemplate {
        return new MappingTemplate({ ...this.buildDefaultValues(), ...data });
    }

    public update(data?: Partial<Pick<MappingTemplate, keyof MappingTemplateData>>): MappingTemplate {
        return MappingTemplate.build({ ...this, ...data });
    }

    private moduleValidations(): ModelValidation[] {
        return [
            { property: "name", validation: { type: "Standard", validation: "hasText" } },
            { property: "modelMappings", validation: { type: "Standard", validation: "hasItems" } },
        ];
    }

    protected static buildDefaultValues = (): Pick<MappingTemplate, keyof MappingTemplateData> => {
        return {
            id: generateUid(),
            connectionId: "",
            name: "",
            modelMappings: [],
        };
    };

    public toData(): MappingTemplateData {
        return {
            id: this.id,
            name: this.name,
            connectionId: this.connectionId,
            modelMappings: this.modelMappings,
            default: this.default,
        };
    }
}
