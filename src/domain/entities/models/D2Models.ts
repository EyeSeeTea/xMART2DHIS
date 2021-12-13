import { dataSetFields, programFields } from "../../../utils/d2";
import { D2Model } from "./D2Model";

export class DataSetModel extends D2Model {
    protected static metadataType = "dataSet";
    protected static collectionName = "dataSets" as const;
    protected static fields = dataSetFields;
}

export class AllProgramsModel extends D2Model {
    protected static metadataType = "program";
    protected static collectionName = "programs" as const;
    protected static fields = programFields;
}

export class TrackerProgramsModel extends D2Model {
    protected static metadataType = "program";
    protected static collectionName = "programs" as const;
    protected static fields = programFields;
    protected static modelFilters = { programType: { eq: "WITH_REGISTRATION" } };
}
