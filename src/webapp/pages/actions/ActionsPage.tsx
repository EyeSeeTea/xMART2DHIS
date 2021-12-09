import { ObjectsTable, TableAction, TableColumn, useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Sync } from "@material-ui/icons";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Future } from "../../../domain/entities/Future";
import { SyncAction } from "../../../domain/entities/SyncAction";
import { SyncResult } from "../../../domain/entities/SyncResult";
import i18n from "../../../locales";
import { ImportSummary } from "../../components/import-summary/ImportSummary";
import { PageHeader } from "../../components/page-header/PageHeader";
import { useAppContext } from "../../contexts/app-context";

export const ActionsPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [rows, setRows] = useState<SyncAction[]>([]);
    const [results, setResults] = useState<SyncResult[]>();

    const columns: TableColumn<SyncAction>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name") },
            { name: "description", text: i18n.t("Description") },
        ],
        []
    );

    const actions: TableAction<SyncAction>[] = useMemo(
        () => [
            {
                name: "run",
                text: i18n.t("Run"),
                icon: <Sync />,
                multiple: true,
                onClick: (ids: string[]) => {
                    loading.show(true, i18n.t("Running actions..."));
                    const futures = _.compact(ids.map(id => rows.find(item => item.id === id))).map(({ execute }) =>
                        execute()
                    );

                    Future.parallel(futures, { maxConcurrency: 1 }).run(
                        results => {
                            loading.reset();
                            setResults(results);
                        },
                        error => {
                            loading.reset();
                            snackbar.error(error);
                        }
                    );
                },
            },
        ],
        [snackbar, loading, rows]
    );

    useEffect(() => {
        compositionRoot.actions.get().run(
            rows => setRows(rows),
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar]);

    return (
        <Container>
            <PageHeader title={i18n.t("Actions")} onBackClick={() => window.history.back()} />

            {results !== undefined ? <ImportSummary results={results} onClose={() => setResults(undefined)} /> : null}

            <ObjectsTable<SyncAction> rows={rows} columns={columns} actions={actions} />
        </Container>
    );
};

const Container = styled.div`
    margin: 20px;
`;
