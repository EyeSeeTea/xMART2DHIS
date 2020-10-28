import React from "react";
import { TableColumn, TableSorting, PaginationOptions } from "d2-ui-components";
import { TablePagination } from "d2-ui-components";

import i18n from "../../../locales";
import { ObjectsList } from "../objects-list/ObjectsList";
import { Config, useObjectsTable } from "../objects-list/objects-list-hooks";
import { Id } from "../../../domain/entities/Base";
import { useAppContext } from "../../contexts/app-context";
import { CompositionRoot } from "../../../compositionRoot";
import { DataValue } from "../../../domain/entities/DataValue";

interface DataValueView {
    id: Id;
    period: string;
    orgUnit: string;
    dataSet: string;
    dataElement: string;
    categoryOptionCombo: string;
    value: string;
    comment: string;
    lastUpdated: string;
    storedBy: string;
}

function getListConfig(compositionRoot: CompositionRoot): Config<DataValueView> {
    const paginationOptions: Partial<PaginationOptions> = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialPagination: Partial<TablePagination> = { page: 1, pageSize: 20 };
    const initialSorting: TableSorting<DataValueView> = {
        field: "id" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataValueView>[] = [
        { name: "id", text: i18n.t("Id"), sortable: true },
        { name: "period", text: i18n.t("Period"), sortable: true },
        { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
        { name: "dataSet", text: i18n.t("Data set"), sortable: true },
        { name: "dataElement", text: i18n.t("Data Element"), sortable: true },
        { name: "categoryOptionCombo", text: i18n.t("Category option combo"), sortable: true },
        { name: "value", text: i18n.t("Value"), sortable: true },
        { name: "comment", text: i18n.t("Comment"), sortable: true },
        { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true },
        { name: "storedBy", text: i18n.t("Stored by"), sortable: true },
    ];

    return {
        columns,
        initialSorting,
        details: columns,
        initialPagination,
        paginationOptions,
        getRows: () => getRows(compositionRoot),
    };
}

async function getRows(compositionRoot: CompositionRoot) {
    return {
        objects: toView(await compositionRoot.dataValues.get.execute()),
        pager: {},
    };
}

function toView(dataValues: DataValue[]): DataValueView[] {
    return dataValues.map(dv => ({
        id: dv.id,
        period: dv.period,
        orgUnit: dv.orgUnit.name,
        dataSet: dv.dataSet.name,
        dataElement: dv.dataElement.name,
        categoryOptionCombo: dv.categoryOptionCombo.name,
        value: dv.value,
        comment: dv.comment || "",
        lastUpdated: dv.lastUpdated.toISOString(),
        storedBy: dv.storedBy.name,
    }));
}

export const DataValuesList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const config = React.useMemo(() => getListConfig(compositionRoot), [compositionRoot]);
    const tableProps = useObjectsTable(config);

    return <ObjectsList<DataValueView> {...tableProps} />;
});
