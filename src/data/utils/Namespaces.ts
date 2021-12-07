export const dataStoreNamespace = "xMART2DHIS";

export type Namespace = typeof Namespaces[keyof typeof Namespaces];

export const Namespaces = {
    ACTIONS: "actions",
    MAPPINGS: "mappings",
};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespaces.ACTIONS]: [],
    [Namespaces.MAPPINGS]: [],
};
