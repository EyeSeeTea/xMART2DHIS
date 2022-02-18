import { DataSet } from "./DataSet";
import { OrganisationUnit } from "./OrganisationUnit";
import { Program } from "./Program";
import { Id, Ref } from "./Ref";

export type MetadataModel = keyof MetadataEntities;

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

export type MetadataEntity = OrganisationUnit | Program | DataSet | IdentifiableObject;

export type MetadataEntities = {
    organisationUnits: OrganisationUnit[];
    programs: Program[];
    dataSets: DataSet[];
    categoryOptions: IdentifiableObject[];
    categoryOptionCombos: IdentifiableObject[];
    dataElements: IdentifiableObject[];
    trackedEntityAttributes: IdentifiableObject[];
    programStages: IdentifiableObject[];
};

export type MetadataPackage = Partial<Record<keyof MetadataEntities, MetadataEntity[]>>;

export interface IdentifiableObject {
    id: Id;
    name: string;
    code?: string;
    displayName?: string;
    description?: string;
    created?: string;
    formName?: string;
    shortName?: string;
}
