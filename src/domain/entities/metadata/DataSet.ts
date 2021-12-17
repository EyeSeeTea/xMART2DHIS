import { IdentifiableObject } from "./Metadata";

export interface CategoryOptionCombo extends IdentifiableObject {}

export type CategoryCombo = {
    categoryOptionCombos: CategoryOptionCombo[];
};

export interface DataElementRef extends IdentifiableObject {
    categoryCombo:CategoryCombo;
}

export type DataSetElement = {
    dataElement: DataElementRef;
};

export interface DataSet extends IdentifiableObject {
    dataSetElements: DataSetElement[];
}
