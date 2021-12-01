export const dataStoreNamespace = "XMART2DHIS";
export const constantPrefix = "XMART2DHIS App Storage";

export type Namespace = typeof Namespaces[keyof typeof Namespaces];

export const Namespaces = {
    INSTANCES: "instances",
};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespaces.INSTANCES]: [],
};
