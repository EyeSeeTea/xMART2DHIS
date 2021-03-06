import { ObjectsTable, TableColumn, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SyncAction } from "../../../domain/entities/actions/SyncAction";
import { SyncResult } from "../../../domain/entities/data/SyncResult";
import i18n from "../../../locales";
import { ImportSummary } from "../../components/import-summary/ImportSummary";
import { useAppContext } from "../../contexts/app-context";

export const ListActionsPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const navigate = useNavigate();

    const [rows, setRows] = useState<SyncAction[]>([]);
    const [results, setResults] = useState<SyncResult[]>();

    const columns: TableColumn<SyncAction>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name") },
            { name: "description", text: i18n.t("Description") },
        ],
        []
    );

    // const actions: TableAction<SyncAction>[] = useMemo(
    //     () => [
    // {
    //     name: "run",
    //     text: i18n.t("Run"),
    //     icon: <Sync />,
    //     multiple: true,
    //     onClick: (ids: string[]) => {
    //         loading.show(true, i18n.t("Running actions..."));
    //         const futures = _.compact(ids.map(id => rows.find(item => item.id === id))).map(({ execute }) =>
    //             execute()
    //         );
    //         Future.parallel(futures, { maxConcurrency: 1 }).run(
    //             results => {
    //                 loading.reset();
    //                 setResults(results);
    //             },
    //             error => {
    //                 loading.reset();
    //                 snackbar.error(error);
    //             }
    //         );
    //     },
    // },
    //     ],
    //     [snackbar, loading, rows]
    // );

    const goToCreateAction = useCallback(() => {
        navigate("/custom-actions/new");
    }, [navigate]);

    useEffect(() => {
        compositionRoot.actions.list().run(
            rows => setRows(rows),
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar]);

    return (
        <React.Fragment>
            {results !== undefined ? <ImportSummary results={results} onClose={() => setResults(undefined)} /> : null}

            <ObjectsTable<SyncAction>
                rows={rows}
                columns={columns}
                actions={[]}
                onActionButtonClick={goToCreateAction}
            />
        </React.Fragment>
    );
};
