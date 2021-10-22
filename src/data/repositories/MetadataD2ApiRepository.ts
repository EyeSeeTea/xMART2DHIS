import _ from "lodash";
import { FutureData } from "../../domain/entities/Future";
import { ImportResult, ImportStats } from "../../domain/entities/ImportResult";
import { Instance } from "../../domain/entities/Instance";
import { MetadataPayload } from "../../domain/entities/Metadata";
import { ListMetadataResponse, ListMetadataOptions, MetadataRepository } from "../../domain/repositories/MetadataRepository";
import i18n from "../../locales";
import { D2Api, D2ApiDefinition, MetadataResponse, Stats } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";

export class MetadataD2ApiRepository implements MetadataRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public list(options: ListMetadataOptions): FutureData<ListMetadataResponse> {
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

    public getOptionsFromOptionSet(ids: string[]): FutureData<MetadataPayload> {
        return this.fetchOptionSets(ids);
    }

    public getModelName(model: string): string {
        if (!this.isValidModel(model)) throw new Error(`Invalid model: ${model}`);

        return this.api.models[model].schema.displayName ?? i18n.t("Unknown model");
    }

    public isShareable(model: string): boolean {
        if (!this.isValidModel(model)) throw new Error(`Invalid model: ${model}`);

        return this.api.models[model].schema.shareable ?? false;
    }

    public isDataShareable(model: string): boolean {
        if (!this.isValidModel(model)) throw new Error(`Invalid model: ${model}`);

        return this.api.models[model].schema.dataShareable ?? false;
    }

    private fetchOptionSets(ids: string[]): FutureData<MetadataPayload> {
        return apiToFuture(this.api.get("/metadata", { filter: `id:in:[${ids.join(",")}]`, fields: `options[code]` }));
    }

    private isValidModel(model: string): model is keyof D2ApiDefinition["schemas"] {
        return _.keys(this.api.models).includes(model);
    }
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
