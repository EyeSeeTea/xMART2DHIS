import { ObjectsTable, TableColumn, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useEffect, useMemo, useState } from "react";
import { SyncResult } from "../../../domain/entities/SyncResult";
import { useHistory } from "react-router-dom";
import i18n from "../../../locales";
import { ImportSummary } from "../../components/import-summary/ImportSummary";
import { useAppContext } from "../../contexts/app-context";
import { DataMart } from "../../../domain/entities/XMart";

export const ListConnectionsPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const history = useHistory();

    const [rows, setRows] = useState<DataMart[]>([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SyncResult[]>();
    const [search, changeSearch] = useState<string>("");

    const columns: TableColumn<DataMart>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name") },
            { name: "code", text: i18n.t("Code") },
            { name: "type", text: i18n.t("Type") },
            { name: "apiUrl", text: i18n.t("Connection URL") },
        ],
        []
    );

    useEffect(() => {
        setLoading(true);
        compositionRoot.connection.listAll({ search }).then(connections => {
            setRows(connections);
            setLoading(false);
        });
    }, [compositionRoot, snackbar, search]);
    const createConnection = () => {
        history.push("/connections/new");
    };
    return (
        <React.Fragment>
            {results !== undefined ? <ImportSummary results={results} onClose={() => setResults(undefined)} /> : null}

            <ObjectsTable<DataMart> 
            rows={rows} 
            columns={columns} 
            onChangeSearch={changeSearch} loading={loading} 
            onActionButtonClick={createConnection}
            />
        </React.Fragment>
    );
};
