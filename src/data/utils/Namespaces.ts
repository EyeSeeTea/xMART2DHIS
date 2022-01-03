export const dataStoreNamespace = "xMART2DHIS";
export const constantPrefix = "XMART2DHIS App Storage";

export type Namespace = typeof Namespaces[keyof typeof Namespaces];

export const Namespaces = {
    CONNECTIONS: "connections",
    ACTIONS: "actions",
    MAPPINGTEMPLATES: "mapping-templates",
    SETTINGS: "settings",
    SCHEDULER_EXECUTIONS: "scheduler-executions",

};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespaces.CONNECTIONS]: [],
    [Namespaces.ACTIONS]: [],
    [Namespaces.MAPPINGTEMPLATES]: [],
    [Namespaces.SETTINGS]: [],
    [Namespaces.SCHEDULER_EXECUTIONS]: [],
};
