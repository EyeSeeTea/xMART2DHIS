import {
    ObjectsTable,
    TableColumn,
    useSnackbar,
    useLoading,
    TableSelection,
    TableAction,
} from "@eyeseetea/d2-ui-components";
import React, { useEffect, useMemo, useState } from "react";
import { SyncResult } from "../../../domain/entities/SyncResult";
import { useHistory } from "react-router-dom";
import i18n from "../../../locales";
import { useReload } from "../../hooks/useReload";
import { ImportSummary } from "../../components/import-summary/ImportSummary";
import { useAppContext } from "../../contexts/app-context";
import { DataMart } from "../../../domain/entities/XMart";
import { Delete } from "@material-ui/icons";

export const ListConnectionsPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loadingScreen = useLoading();

    const history = useHistory();

    const [rows, setRows] = useState<DataMart[]>([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SyncResult[]>();
    const [search, changeSearch] = useState<string>("");
    const [selection, setSelection] = useState<TableSelection[]>([]);
    const [reloadKey, reload] = useReload();

    const columns: TableColumn<DataMart>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name") },
            { name: "code", text: i18n.t("Code") },
            { name: "type", text: i18n.t("Type") },
            { name: "apiUrl", text: i18n.t("Connection URL") },
        ],
        []
    );
    const actions: TableAction<DataMart>[] = useMemo(
        () => [
            {
                name: "delete",
                text: i18n.t("Delete"),
                icon: <Delete />,
                multiple: true,
                onClick: async (ids: string[]) => {
                    loadingScreen.show(true, i18n.t("Deleting connections"));
                    await compositionRoot.connection.delete(ids);
                    setSelection([]);
                    loadingScreen.reset();
                    reload();
                },
            },
        ],
        [loadingScreen, compositionRoot.connection, reload]
    );
    useEffect(() => {
        setLoading(true);
        compositionRoot.connection.listAll({ search }).then(connections => {
            setRows(connections);
            setLoading(false);
        });
    }, [compositionRoot, snackbar, search, reloadKey]);
    const createConnection = () => {
        history.push("/connections/new");
    };
    return (
        <React.Fragment>
            {results !== undefined ? <ImportSummary results={results} onClose={() => setResults(undefined)} /> : null}

            <ObjectsTable<DataMart>
                rows={rows}
                columns={columns}
                onChangeSearch={changeSearch}
                actions={actions}
                loading={loading}
                onActionButtonClick={createConnection}
                selection={selection}
            />
        </React.Fragment>
    );
};
