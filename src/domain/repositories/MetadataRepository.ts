import { Id } from "../../types/d2-api";
import { FutureData } from "../entities/Future";
import { ImportResult } from "../entities/data/ImportResult";
import { MetadataEntity, MetadataModel, MetadataPackage, MetadataPayload } from "../entities/metadata/Metadata";
import { OrganisationUnit } from "../entities/metadata/OrganisationUnit";

export interface MetadataRepository {
    list(options: ListMetadataOptions): FutureData<ListMetadataResponse>;
    getOptionsFromOptionSet(codes: string[]): FutureData<MetadataPayload>;
    save(payload: MetadataPayload): FutureData<ImportResult>;
    getModelName(model: string): string;
    isShareable(model: string): boolean;
    isDataShareable(model: string): boolean;
    getOrgUnitRoots(): FutureData<OrganisationUnit[]>;
    getMetadataByIds(ids: Id[], fields?: object | string, includeDefaults?: boolean): FutureData<MetadataPackage>;
}

export interface ListMetadataOptions {
    model: MetadataModel;
    paging?: boolean;
    page?: number;
    pageSize?: number;
    search?: string;
    sorting?: { field: string; order: "asc" | "desc" };
    fields?: object;
    selectedIds?: string[];
    aditionalFilters?: Record<string, any>;
}

export interface ListMetadataResponse {
    objects: MetadataEntity[];
    pager: Pager;
}

export interface Pager {
    page: number;
    pageSize: number;
    total: number;
}
