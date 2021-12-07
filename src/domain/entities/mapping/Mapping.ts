import { generateUid } from "../../../utils/uid";
import { ModelValidation, validateModel, ValidationError } from "../Validations";

export interface MappingData {
    id: string;
    modelKey: Dhis2ModelKey;
    xMARTTable: string;
}

export type Dhis2ModelKey = "dataValues" | "events" | "eventValues" | "teis" | "teiAttributes" | "enrollments";

export class Mapping implements MappingData {
    public readonly id: string;
    public readonly modelKey: Dhis2ModelKey;
    public readonly xMARTTable: string;

    constructor(data: MappingData) {
        this.id = data.id;
        this.modelKey = data.modelKey;
        this.xMARTTable = data.xMARTTable;
    }

    public validate(filter?: string[]): ValidationError[] {
        return validateModel<Mapping>(this, this.moduleValidations()).filter(
            ({ property }) => filter?.includes(property) ?? true
        );
    }

    static build(data?: Partial<Pick<Mapping, keyof MappingData>>): Mapping {
        return new Mapping({ ...this.buildDefaultValues(), ...data });
    }

    public update(data?: Partial<Pick<Mapping, keyof MappingData>>): Mapping {
        return Mapping.build({ ...this, ...data });
    }

    private moduleValidations(): ModelValidation[] {
        return [
            { property: "modelKey", validation: "hasText" },
            { property: "xMARTTableName", validation: "hasText" },
        ];
    }

    protected static buildDefaultValues = (): Pick<Mapping, keyof MappingData> => {
        return {
            id: generateUid(),
            modelKey: "dataValues",
            xMARTTable: "",
        };
    };

    public toData(): MappingData {
        return {
            id: this.id,
            modelKey: this.modelKey,
            xMARTTable: this.xMARTTable,
        };
    }
}
