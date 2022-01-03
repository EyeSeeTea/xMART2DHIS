export type ActionType = "standard" | "custom";

export interface Action {
    id: string;
    name: string;
    type: ActionType;
    description?: string;
    connectionId: string;
}