import { Dropdown, ObjectsTable, TablePagination, TableState, useSnackbar } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { XMartContent, XMartTable } from "../../../domain/entities/XMart";
import { ListOptions } from "../../../domain/repositories/XMartRepository";
import { PageHeader } from "../../components/page-header/PageHeader";
import { useAppContext } from "../../contexts/app-context";

export const ListPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [tables, setTables] = useState<XMartTable[]>();
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

        return _.keys(rows[0]).map((column, idx) => ({ name: column, text: column, hidden: idx > 6 }));
    }, [rows]);

    const fetchRows = useCallback(
        (options: ListOptions) => {
            if (!selectedTable) return;

            setLoading(true);
            return compositionRoot.xmart.list(selectedTable, options).run(
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
        [compositionRoot, snackbar, selectedTable]
    );

    const onChange = useCallback(
        (state: TableState<TableObject>) => {
            fetchRows(state.pagination);
        },
        [fetchRows]
    );

    useEffect(() => {
        fetchRows({ page: 1, pageSize: 25 });
    }, [fetchRows]);

    useEffect(() => {
        compositionRoot.xmart.listTables().run(
            tables => {
                setTables(tables);
                setSelectedTable(tables[0]?.name);
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar]);

    return (
        <Container>
            <PageHeader title={i18n.t("Browse xMART")} onBackClick={() => window.history.back()} />
            <ObjectsTable<TableObject>
                loading={loading}
                rows={rows}
                columns={columns}
                pagination={pager}
                onChange={onChange}
                forceSelectionColumn={true}
                filterComponents={
                    <Dropdown
                        label={i18n.t("xMART Table")}
                        value={selectedTable}
                        items={tables?.map(item => ({ text: item.name, value: item.name })) ?? []}
                        onChange={table => setSelectedTable(table)}
                    />
                }
            />
        </Container>
    );
};

type TableObject = XMartContent & { id: string };

const Container = styled.div`
    margin: 20px;
`;
