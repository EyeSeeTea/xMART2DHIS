import { Ref } from "./Ref";

export type MetadataModel = "categoryOptionCombos" | "categoryOptions" | "optionSets" | "organisationUnits";

export const displayName: Record<string, string> = {
    categoryOptionCombos: "Category option combo",
    categoryOptions: "Category Options",
    optionSets: "Option Sets",
    organisationUnits: "Organisation Units",
};
export type MetadataPayload = Record<string, MetadataItem[]>;

export interface Visualization extends MetadataItem {
    dataDimensionItems?: DataDimensionItem[];
}

export interface DataDimensionItem {
    dataDimensionItemType: string;
    indicator?: Ref;
    programIndicator?: Ref;
}

export type MetadataItem = Ref & { [key: string]: any | undefined };

export function isValidModel(model: string): model is MetadataModel {
    return ["categoryOptions", "categoryOptionCombos", "organisationUnits", "optionSets"].includes(model);
}

export function isValidMetadataItem(item: any): item is MetadataItem {
    return item.id;
}
