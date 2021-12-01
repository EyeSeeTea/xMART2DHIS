import { ObjectsTable, TableAction, TableColumn, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { SyncAction } from "../../../domain/entities/SyncAction";
import { SyncResult } from "../../../domain/entities/SyncResult";
import i18n from "../../../locales";
import { ImportSummary } from "../../components/import-summary/ImportSummary";
import { useAppContext } from "../../contexts/app-context";

export const ListActionsPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const history = useHistory();

    const [rows, setRows] = useState<SyncAction[]>([]);
    const [results, setResults] = useState<SyncResult[]>();

    const columns: TableColumn<SyncAction>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name") },
            { name: "description", text: i18n.t("Description") },
        ],
        []
    );

    const actions: TableAction<SyncAction>[] = useMemo(() => [], []);

    const goToCreateAction = useCallback(() => {
        history.push("/actions/new");
    }, [history]);

    useEffect(() => {
        compositionRoot.actions.get().run(
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
                actions={actions}
                onActionButtonClick={goToCreateAction}
            />
        </React.Fragment>
    );
};
