export const actionGlobals = `type Fn<T> = (value: T) => void;
type Cancel = () => void;

declare interface Future<E, D> {
    run(onSuccess: Fn<D>, onError: Fn<E>): Cancel;
    map<D2>(mapper: (data: D) => D2): Future<E, D2>;
    mapError<E2>(mapper: (data: E) => E2): Future<E2, D>;
    bimap<E2, D2>(dataMapper: (data: D) => D2, errorMapper: (error: E) => E2): Future<E2, D2>;
    flatMap<D2>(mapper: (data: D) => Future<E, D2>): Future<E, D2>;
    flatMapError<E2>(mapper: (error: E) => Future<E2, D>): Future<E2, D>;
    toPromise(onError?: (error: E) => void): Promise<D>;
    runAsync(): Promise<{ data?: D; error?: E }>;
}

declare type FutureData<Data> = Future<string, Data>;

declare interface DataValueSet {
    dataSet?: string;
    completeDate?: string;
    period?: string;
    orgUnit?: string;
    attributeOptionCombo?: string;
    dataValues: DataValue[];
}

declare interface DataValue {
    dataElement: string;
    value: string;
    orgUnit?: string;
    period?: string;
    attributeOptionCombo?: string;
    categoryOptionCombo?: string;
    comment?: string;
}


declare interface User {
    id: string;
    name: string;
    username: string;
    userRoles: UserRole[];
    userGroups: NamedRef[];
}

declare interface UserRole extends NamedRef {
    authorities: string[];
}

declare type ImportStatus = "PENDING" | "SUCCESS" | "WARNING" | "ERROR" | "NETWORK ERROR";

declare interface ImportStats {
    type?: string;
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
    total?: number;
}

declare interface ErrorMessage {
    id: string;
    message: string;
}

declare interface ImportResult {
    title: string;
    date: Date;
    status: ImportStatus;
    message?: string;
    stats?: ImportStats[];
    errors?: ErrorMessage[];
    rawResponse: object;
}


declare type MetadataModel = "categoryOptionCombos" | "categoryOptions" | "optionSets" | "organisationUnits";

declare const displayName: Record<string, string> = {
    categoryOptionCombos: "Category option combo",
    categoryOptions: "Category Options",
    optionSets: "Option Sets",
    organisationUnits: "Organisation Units",
};
declare type MetadataPayload = Record<string, MetadataItem[]>;

declare interface Visualization extends MetadataItem {
    dataDimensionItems?: DataDimensionItem[];
}

declare interface DataDimensionItem {
    dataDimensionItemType: string;
    indicator?: Ref;
    programIndicator?: Ref;
}

declare type MetadataItem = Ref & { [key: string]: any | undefined };

declare function isValidModel(model: string): model is MetadataModel {
    return ["categoryOptions", "categoryOptionCombos", "organisationUnits", "optionSets"].includes(model);
}

declare function isValidMetadataItem(item: any): item is MetadataItem {
    return item.id;
}

declare type Id = string;

declare interface Ref {
    id: Id;
}

declare interface NamedRef extends Ref {
    name: string;
}

declare interface ProgramEvent {
    event?: string;
    orgUnit: string;
    program: string;
    status: string;
    eventDate: string;
    coordinate?: {
        latitude: string;
        longitude: string;
    };
    attributeOptionCombo?: string;
    trackedEntityInstance?: string;
    programStage?: string;
    dataValues: ProgramEventDataValue[];
}

declare interface ProgramEventDataValue {
    dataElement: string;
    value: string | number | boolean;
}

declare interface XMartTable {
    name: string;
    kind: string;
}

declare interface XMartContent {
    [key: string]: string | number | boolean | null;
}

declare interface XMartResponse {
    objects: XMartContent[];
    pager: XMartPager;
}

declare interface XMartPager {
    page: number;
    pageSize: number;
    total: number;
}

declare type SyncStatus = "PENDING" | "SUCCESS" | "WARNING" | "ERROR" | "NETWORK ERROR";

declare interface SyncStats {
    type?: string;
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
    total?: number;
}

declare interface ErrorMessage {
    id: string;
    message: string;
}

declare interface SyncResult {
    title: string;
    status: SyncStatus;
    message?: string;
    stats?: SyncStats[];
    errors?: ErrorMessage[];
    rawResponse: object;
}


declare interface InstanceRepository {
    metadata: MetadataRepository;
    events: EventsRepository;
    aggregated: AggregatedRepository;
    dataStore: StorageRepository;

    getBaseUrl(): string;
    getCurrentUser(): FutureData<User>;
    getInstanceVersion(): FutureData<string>;
    isAdmin(user: User): boolean;
}


declare interface MetadataRepository {
    list(options: ListMetadataOptions): FutureData<ListMetadataResponse>;
    getOptionsFromOptionSet(codes: string[]): FutureData<MetadataPayload>;
    save(payload: MetadataPayload): FutureData<ImportResult>;
    getModelName(model: string): string;
    isShareable(model: string): boolean;
    isDataShareable(model: string): boolean;
}

declare interface ListMetadataOptions {
    model: MetadataModel;
    page?: number;
    pageSize?: number;
    search?: string;
    sorting?: { field: string; order: "asc" | "desc" };
}

declare interface ListMetadataResponse {
    objects: MetadataItem[];
    pager: Pager;
}

declare interface Pager {
    page: number;
    pageSize: number;
    total: number;
}


declare interface AggregatedRepository {
    save(dataValues: DataValue[], params: SaveAggregatedParams): FutureData<SyncResult>;
    get(filters: GetAggregatedFilters): FutureData<DataValue[]>;
}

declare type SaveAggregatedParams = {
    idScheme?: "UID" | "CODE";
    dataElementIdScheme?: "UID" | "CODE";
    orgUnitIdScheme?: "UID" | "CODE";
    eventIdScheme?: "UID" | "CODE";
    dryRun?: boolean;
};

declare type GetAggregatedFilters = {};


declare interface EventsRepository {
    save(events: ProgramEvent[], params?: SaveEventsParams): FutureData<SyncResult>;
    get(filters: GetEventsFilters): FutureData<ProgramEvent[]>;
}

declare type SaveEventsParams = {
    idScheme?: "UID" | "CODE";
    dataElementIdScheme?: "UID" | "CODE";
    orgUnitIdScheme?: "UID" | "CODE";
    eventIdScheme?: "UID" | "CODE";
    dryRun?: boolean;
};

declare type GetEventsFilters = {};


declare interface XMartRepository {
    listTables(endpoint: XMartEndpoint): FutureData<XMartTable[]>;
    list(endpoint: XMartEndpoint, table: string, options?: ListXMartOptions): FutureData<XMartResponse>;
    listAll(endpoint: XMartEndpoint, table: string, options?: ListAllOptions): FutureData<XMartContent[]>;
    count(endpoint: XMartEndpoint, table: string): FutureData<number>;
}

declare type ListXMartOptions = ListAllOptions & {
    pageSize?: number;
    page?: number;
};

declare type ListAllOptions = {
    select?: string; // Selects a subset of properties to include in the response
    expand?: string; // Related entities to be included inline in the response
    apply?: string; // Group-by properties in the response
    filter?: string; // Filter results to be included in the response (ie: "contains(TEST_TYPE_FK, 'value')")
    orderBy?: string; // Order the results by properties
};

declare const XMartEndpoints = {
    REFMART: "https://frontdoor-r5quteqglawbs.azurefd.net/REFMART",
};

declare type XMartEndpoint = keyof typeof XMartEndpoints;


declare interface StorageRepository {
    // Object operations
    getObject<T extends object>(key: string): Promise<T | undefined>;
    getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T>;
    saveObject<T extends object>(key: string, value: T): Promise<void>;
    removeObject(key: string): Promise<void>;

    listObjectsInCollection<T extends Ref>(key: string): Promise<T[]>;
    getObjectInCollection<T extends Ref>(key: string, id: string): Promise<T | undefined>;
    saveObjectsInCollection<T extends Ref>(key: string, elements: T[]): Promise<void>;
    saveObjectInCollection<T extends Ref>(key: string, element: T): Promise<void>;
    removeObjectInCollection(key: string, id: string): Promise<void>;
    removeObjectsInCollection(key: string, ids: string[]): Promise<void>;
}
`;