import { generateUid } from "../../utils/uid";
import { ModelValidation, validateModel, ValidationError } from "./Validations";

export interface SyncActionData {
    id: string;
    name: string;
    description: string;
}

export class SyncAction implements SyncActionData {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;

    constructor(data: SyncActionData) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
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
        return [
            { property: "name", validation: "hasText" },
            { property: "description", validation: "hasText" },
        ];
    }

    protected static buildDefaultValues = (): Pick<SyncAction, keyof SyncActionData> => {
        return {
            id: generateUid(),
            name: "",
            description: "",
        };
    };

    public toData(): SyncActionData {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
        };
    }
}
