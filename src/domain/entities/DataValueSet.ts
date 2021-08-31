export interface DataValueSet {
    dataSet?: string;
    completeDate?: string;
    period?: string;
    orgUnit?: string;
    attributeOptionCombo?: string;
    dataValues?: DataValue[]
}

export interface DataValue {
    dataElement: string;
    value: string;
    orgUnit?: string;
    period?: string;
    attributeOptionCombo?: string;
    categoryOptionCombo?: string;
    comment?: string;
}