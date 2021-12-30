import { generateUid } from "../../../utils/uid";
import { ModelValidation, validateModel, ValidationError } from "../Validations";
import { ActionType } from "./SyncAction";
export interface SyncCustomActionData {
    id: string;
    name: string;
    type: ActionType;
    description?: string;
    connectionId: string;
    customCode: string;
}

export class SyncCustomAction implements SyncCustomActionData {
    public readonly id: string;
    public readonly name: string;
    public readonly type: ActionType;
    public readonly description?: string;
    public readonly connectionId: string;
    public readonly customCode: string;

    constructor(data: SyncCustomActionData) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.description = data.description;
        this.connectionId = data.connectionId;
        this.customCode = data.customCode;
    }

    public validate(filter?: string[]): ValidationError[] {
        return validateModel<SyncCustomAction>(this, this.moduleValidations()).filter(
            ({ property }) => filter?.includes(property) ?? true
        );
    }

    static build(data?: Partial<Pick<SyncCustomAction, keyof SyncCustomActionData>>): SyncCustomAction {
        return new SyncCustomAction({ ...this.buildDefaultValues(), ...data });
    }

    public update(data?: Partial<Pick<SyncCustomAction, keyof SyncCustomActionData>>): SyncCustomAction {
        return SyncCustomAction.build({ ...this, ...data });
    }

    private moduleValidations(): ModelValidation[] {
        return [
            { property: "name", validation: { type: "Standard", validation: "hasText" } },
            { property: "connectionId", validation: { type: "Standard", validation: "hasValue" } },
            { property: "customCode", validation: { type: "Standard", validation: "hasValue" } },
            { property: "type", validation: { type: "Standard", validation: "hasText" } },
        ];
    }

    protected static buildDefaultValues = (): Pick<SyncCustomAction, keyof SyncCustomActionData> => {
        const template = `async function execute(martRepository: XMartRepository, instanceRepository: InstanceRepository): Promise<any> {
    
        }
        `;
        return {
            id: generateUid(),
            name: "",
            description: "",
            type: "custom",
            connectionId: "",
            customCode: template,
        };
    };

    public toData(): SyncCustomActionData {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.description,
            connectionId: this.connectionId,
            customCode: this.customCode,
        };
    }
}
