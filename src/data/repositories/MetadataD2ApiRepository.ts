import _ from "lodash";
import { Future, FutureData } from "../../domain/entities/Future";
import { ImportResult, ImportStats } from "../../domain/entities/data/ImportResult";
import { Instance } from "../../domain/entities/instance/Instance";
import { MetadataPackage, MetadataPayload } from "../../domain/entities/metadata/Metadata";
import { OrganisationUnit } from "../../domain/entities/metadata/OrganisationUnit";
import {
    ListMetadataResponse,
    ListMetadataOptions,
    MetadataRepository,
} from "../../domain/repositories/MetadataRepository";
import i18n from "../../locales";
import { D2Api, D2ApiDefinition, D2Model, MetadataResponse, Stats } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { apiToFuture } from "../../utils/futures";

export class MetadataD2ApiRepository implements MetadataRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    @cache()
    public list(options: ListMetadataOptions): FutureData<ListMetadataResponse> {
        const {
            model,
            paging = true,
            page,
            pageSize,
            search,
            sorting = { field: "id", order: "asc" },
            selectedIds,
            aditionalFilters,
            fields = { $owner: true },
        } = options;

        const idsFilter = selectedIds && selectedIds?.length > 0 ? { id: { in: selectedIds } } : {};

        return apiToFuture(
            //@ts-ignore: d2-api incorrectly guessing model with string access
            this.api.models[model].get({
                page: paging ? page : undefined,
                pageSize: paging ? pageSize : undefined,
                paging,
                filter: { identifiable: search ? { token: search } : undefined, ...idsFilter, ...aditionalFilters },
                fields,
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

    @cache()
    public getOrgUnitRoots(): FutureData<OrganisationUnit[]> {
        return apiToFuture(
            this.api.models.organisationUnits.get({
                paging: false,
                filter: { level: { eq: "1" } },
                fields: { id: true, name: true, displayName: true, path: true, code: true },
            })
        ).map(response => response.objects);
    }

    public getMetadataByIds(
        ids: string[],
        fields?: object | string,
        includeDefaults = false
    ): FutureData<MetadataPackage> {
        const requestFields = typeof fields === "object" ? getFieldsAsString(fields) : fields;
        return Future.fromPromise(this.getMetadata<D2Model>(ids, requestFields, includeDefaults));
    }

    private async getMetadata<T>(
        elements: string[],
        fields = ":all",
        includeDefaults: boolean
    ): Promise<Record<string, T[]>> {
        const promises = [];
        const chunkSize = 50;

        for (let i = 0; i < elements.length; i += chunkSize) {
            const requestElements = elements.slice(i, i + chunkSize).toString();
            promises.push(
                this.api
                    .get("/metadata", {
                        fields,
                        filter: "id:in:[" + requestElements + "]",
                        defaults: includeDefaults ? undefined : "EXCLUDE",
                    })
                    .getData()
            );
        }
        const response = await Promise.all(promises);
        const results = deepMerge({}, ...response);
        if (results.system) delete results.system;

        return results;
    }
}

function deepMerge(obj: any, ...src: any): any {
    const mergeCustomizer = (obj: any, src: any): any => (_.isArray(obj) ? obj.concat(src) : src);
    return _.mergeWith(obj, ...src, mergeCustomizer);
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

function applyFieldTransformers(key: string, value: any) {
    // eslint-disable-next-line
    if (value.hasOwnProperty("$fn")) {
        switch (value["$fn"]["name"]) {
            case "rename":
                return {
                    key: `${key}~rename(${value["$fn"]["to"]})`,
                    value: _.omit(value, ["$fn"]),
                };
            default:
                return { key, value };
        }
    } else {
        return { key, value };
    }
}

function getFieldsAsString(modelFields: object): string {
    return _(modelFields)
        .map((value0, key0: string) => {
            const { key, value } = applyFieldTransformers(key0, value0);

            if (typeof value === "boolean" || _.isEqual(value, {})) {
                return value ? key.replace(/^\$/, ":") : null;
            } else {
                return key + "[" + getFieldsAsString(value) + "]";
            }
        })
        .compact()
        .sortBy()
        .join(",");
}
