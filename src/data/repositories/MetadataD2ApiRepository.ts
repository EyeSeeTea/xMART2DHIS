import { D2Api, D2ApiDefinition, MetadataResponse, Stats } from "../../types/d2-api";
import { ImportResult, ImportStats } from "../../domain/entities/ImportResult";
import { Instance } from "../../domain/entities/Instance";
import { MetadataPayload } from "../../domain/entities/MetadataItem";
import { ListMetadataResponse, ListOptions, MetadataRepository } from "../../domain/repositories/MetadataRepository";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";

import i18n from "@eyeseetea/d2-ui-components/locales";
import _ from "lodash";
import { FutureData } from "../../domain/entities/Future";

export class MetadataD2ApiRepository implements MetadataRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    list(options: ListOptions): FutureData<ListMetadataResponse> {
        const { model, page, pageSize, search, sorting = { field: "id", order: "asc" } } = options;

        return apiToFuture(
            //@ts-ignore: d2-api incorrectly guessing model with string access
            this.api.models[model].get({
                page,
                pageSize,
                paging: true,
                filter: { identifiable: search ? { token: search } : undefined },
                fields: { $owner: true },
                order: `${sorting.field}:${sorting.order}`,
            })
        );
    }

    public save(payload: MetadataPayload): FutureData<ImportResult> {
        return apiToFuture(this.api.metadata.post(payload)).map(response => buildMetadataImportResult(response));
    }

    public getMetadata(codes: string[]): FutureData<MetadataPayload> {
        return this.fetchMetadataByCode(codes);
    }

    public getModelName(model: string): string {
        return this.api.models[model as ModelIndex].schema.displayName ?? i18n.t("Unknown model");
    }

    public isShareable(model: string): boolean {
        return this.api.models[model as ModelIndex].schema.shareable ?? false;
    }

    public isDataShareable(model: string): boolean {
        return this.api.models[model as ModelIndex].schema.dataShareable ?? false;
    }

    /*     private fetchMetadata(ids: string[]): FutureData<MetadataPayload> {
            return apiToFuture(this.api.get("/metadata", { filter: `id:in:[${ids.join(",")}]` }));
        } */

    private fetchMetadataByCode(codes: string[]): FutureData<MetadataPayload> {
        return apiToFuture<MetadataPayload>(
            this.api.get("/metadata", { filter: `code:in:[${codes.join(",")}]`, fields: `*, categoryOptionCombos[*]` })
        );
    }

    /*     private fetchMetadataWithDependencies(model: MetadataModel, id: string): FutureData<MetadataPayload> {
            if (model === "categoryOptions") {
                return apiToFuture<MetadataPayload>(this.api.get(`/${model}/${id}.json?fields=*,categoryOptionCombos[*]`));
            } else {
                return apiToFuture<MetadataPayload>(this.api.get(`/${model}/${id}.json?fields=*`));
            }
        } */
}

export function mergePayloads(payloads: MetadataPayload[]): MetadataPayload {
    return _.reduce(
        payloads,
        (result, payload) => {
            _.forOwn(payload, (value, key) => {
                if (Array.isArray(value)) {
                    const existing = result[key] ?? [];
                    result[key] = _.uniqBy([...existing, ...value], ({ id }) => id);
                }
            });
            return result;
        },
        {} as MetadataPayload
    );
}

/* function removeDefaults(payload: MetadataPayload): MetadataPayload {
    return _.mapValues(payload, items => items.filter(({ code, name }) => code !== "default" && name !== "default"));
} */

function buildMetadataImportResult(response: MetadataResponse): ImportResult {
    const { status, stats, typeReports = [] } = response;
    const typeStats = typeReports.flatMap(({ klass, stats }) => formatStats(stats, getClassName(klass)));

    const messages = typeReports.flatMap(({ objectReports = [] }) =>
        objectReports.flatMap(({ uid: id, errorReports = [] }) =>
            _.take(errorReports, 1).map(({ mainKlass, errorProperty, message }) => ({
                id,
                type: getClassName(mainKlass),
                property: errorProperty,
                message: message,
            }))
        )
    );

    return {
        title: i18n.t("Metadata"),
        date: new Date(),
        status: status === "OK" ? "SUCCESS" : status,
        stats: [formatStats(stats), ...typeStats],
        errors: messages,
        rawResponse: response,
    };
}

function formatStats(stats: Stats, type?: string): ImportStats {
    return {
        ..._.omit(stats, ["created"]),
        imported: stats.created,
        type,
    };
}

function getClassName(className: string): string | undefined {
    return _(className).split(".").last();
}

type ModelIndex = keyof D2ApiDefinition["schemas"];
