import { Id } from "../../types/d2-api";
import { FutureData } from "../entities/Future";
import { ImportResult } from "../entities/ImportResult";
import { MetadataItem, MetadataModel, MetadataPackage, MetadataPayload } from "../entities/Metadata";
import { OrganisationUnit } from "../entities/OrganisationUnit";

export interface MetadataRepository {
    list(options: ListMetadataOptions): FutureData<ListMetadataResponse>;
    getOptionsFromOptionSet(codes: string[]): FutureData<MetadataPayload>;
    save(payload: MetadataPayload): FutureData<ImportResult>;
    getModelName(model: string): string;
    isShareable(model: string): boolean;
    isDataShareable(model: string): boolean;
    getOrgUnitRoots(): FutureData<OrganisationUnit[]>;
    getMetadataByIds<T>(ids: Id[], fields?: object | string, includeDefaults?: boolean): FutureData<MetadataPackage<T>>;
}

export interface ListMetadataOptions {
    model: MetadataModel;
    page?: number;
    pageSize?: number;
    search?: string;
    sorting?: { field: string; order: "asc" | "desc" };
    fields?: object;
    selectedIds?: string[];
}

export interface ListMetadataResponse {
    objects: MetadataItem[];
    pager: Pager;
}

export interface Pager {
    page: number;
    pageSize: number;
    total: number;
}
