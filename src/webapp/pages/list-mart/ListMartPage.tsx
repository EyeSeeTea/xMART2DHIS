import { ObjectsTable, TablePagination, TableState, useSnackbar } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { DataMart, MartTable, XMartContent } from "../../../domain/entities/xmart/DataMart";
import { ListXMartOptions } from "../../../domain/repositories/XMartRepository";
import { Dropdown } from "../../components/dropdown/Dropdown";
import { useAppContext } from "../../contexts/app-context";

const StyledDropdown = styled(Dropdown)`
    margin-top: -8px;
    margin-left: 10px;
`;

export const ListMartPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [tables, setTables] = useState<MartTable[]>();

    const [dataMarts, setDataMarts] = useState<DataMart[]>([]);
    const [selectedApi, setSelectedApi] = useState<DataMart | undefined>(dataMarts[0]);
    const [selectedTable, setSelectedTable] = useState<string>();

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<TableObject[]>([]);
    const [pager, setPager] = useState<TablePagination>({
        page: 1,
        pageSize: 25,
        total: 0,
    });

    const columns = useMemo(() => {
        if (rows.length === 0) return [{ name: "id", text: i18n.t("Identifier") }];

        return _.keys(rows[0]).map((column, idx) => ({
            name: compositionRoot.metadata.getModelName(column),
            text: compositionRoot.metadata.getModelName(column),
            hidden: idx > 6,
        }));
    }, [rows, compositionRoot.metadata]);

    const fetchRows = useCallback(
        (options: ListXMartOptions) => {
            if (!selectedApi || !selectedTable) return;

            setLoading(true);
            return compositionRoot.xmart.listTableContent(selectedApi, selectedTable, options).run(
                ({ objects, pager }) => {
                    setRows(
                        objects.map((item, idx) => ({
                            id: `Item ${1 + idx + pager.pageSize * (pager.page - 1)}`,
                            ...item,
                        }))
                    );
                    setPager(pager);
                    setLoading(false);
                },
                error => snackbar.error(error)
            );
        },
        [compositionRoot, snackbar, selectedTable, selectedApi]
    );

    const onChange = useCallback(
        (state: TableState<TableObject>) => {
            fetchRows({ ...state.pagination, orderBy: `${state.sorting.field} ${state.sorting.order}` });
        },
        [fetchRows]
    );

    useEffect(() => {
        fetchRows({ page: 1, pageSize: 25 });
    }, [fetchRows]);

    useEffect(() => {
        if (!selectedApi) return;

        compositionRoot.xmart.listTables(selectedApi).run(
            tables => {
                setTables(tables);
                setSelectedTable(tables[0]?.name);
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar, selectedApi]);

    useEffect(() => {
        compositionRoot.connection.listAll().run(
            dataMarts => {
                setDataMarts(dataMarts);
                setSelectedApi(dataMarts[0]);
                setSelectedTable(undefined);
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar]);

    return (
        <ObjectsTable<TableObject>
            loading={loading}
            rows={rows}
            columns={columns}
            pagination={pager}
            onChange={onChange}
            forceSelectionColumn={true}
            filterComponents={
                <React.Fragment>
                    <StyledDropdown
                        label={i18n.t("xMART API")}
                        value={selectedApi?.id ?? ""}
                        items={dataMarts.map(({ id, name }) => ({ id, name }))}
                        onValueChange={endpoint => {
                            setSelectedTable(undefined);
                            setTables(undefined);
                            setSelectedApi(_.find(dataMarts, ({ id }) => id === endpoint));
                        }}
                    />
                    <StyledDropdown
                        label={i18n.t("xMART Table")}
                        value={selectedTable ?? ""}
                        items={tables?.map(item => ({ id: item.name, name: item.name })) ?? []}
                        onValueChange={table => setSelectedTable(table)}
                    />
                </React.Fragment>
            }
        />
    );
};

type TableObject = XMartContent & { id: string };
