import {
    ConfirmationDialog,
    ObjectsTable,
    ObjectsTableDetailField,
    ReferenceObject,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { Icon } from "@material-ui/core";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SyncAction } from "../../../domain/entities/actions/SyncAction";
import { SyncResult } from "../../../domain/entities/data/SyncResult";
import i18n from "../../../locales";
import { ImportSummary } from "../../components/import-summary/ImportSummary";
import { useAppContext } from "../../contexts/app-context";

export const ActionsListPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const navigate = useNavigate();

    const [rows, setRows] = useState<SyncAction[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const [toDelete, setToDelete] = useState<string[]>([]);
    const [results, setResults] = useState<SyncResult[]>();

    useEffect(() => {
        compositionRoot.actions.list().run(
            rows => setRows(rows),
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar, refreshKey]);

    const columns: TableColumn<SyncAction>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name") },
            { name: "description", text: i18n.t("Description") },
        ],
        []
    );

    const details: ObjectsTableDetailField<SyncAction>[] = [
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
    ];

    const goToCreateAction = useCallback(() => {
        navigate("/actions/new");
    }, [navigate]);

    const goToEditAction = useCallback(
        (ids: string[]) => {
            const id = _.first(ids);
            if (!id) return;

            navigate(`/actions/edit/${id}`);
        },
        [navigate]
    );

    const confirmDelete = useCallback(async () => {
        loading.show(true, i18n.t("Deleting Actions"));

        compositionRoot.actions.delete(toDelete).run(
            () => {
                snackbar.success(i18n.t("Successfully deleted {{total}} actions", { total: toDelete.length }));

                loading.reset();
                setToDelete([]);
                updateSelection([]);
                setRefreshKey(Math.random());
            },
            _error => {
                loading.reset();
                snackbar.error(i18n.t("An error has ocurred deleting actionn"));
            }
        );
    }, [compositionRoot, loading, snackbar, toDelete]);

    const handleTableChange = useCallback((tableState: TableState<ReferenceObject>) => {
        const { selection } = tableState;
        updateSelection(selection);
    }, []);

    const execute = useCallback(
        async (ids: string[]) => {
            loading.show(true, i18n.t("Executing the action"));

            const id = _.first(ids);
            if (!id) return;

            compositionRoot.actions.execute(id).run(
                result => {
                    snackbar.success(i18n.t("Successfully executed the action.\n{{result}}", { result }), {
                        autoHideDuration: null,
                    });

                    loading.reset();
                    setToDelete([]);
                    updateSelection([]);
                    setRefreshKey(Math.random());
                },
                error => {
                    loading.reset();
                    snackbar.error(i18n.t("An error has ocurred executing the action.\n{{error}}", { error }));
                }
            );
        },
        [compositionRoot, loading, snackbar]
    );

    const actions: TableAction<SyncAction>[] = useMemo(
        () => [
            {
                name: "details",
                text: i18n.t("Details"),
                multiple: false,
            },
            {
                name: "edit",
                text: i18n.t("Edit"),
                multiple: false,
                onClick: goToEditAction,
                primary: true,
                icon: <Icon>edit</Icon>,
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                multiple: true,
                onClick: setToDelete,
                icon: <Icon>delete</Icon>,
            },
            {
                name: "execute",
                text: i18n.t("Execute"),
                multiple: false,
                onClick: execute,
                icon: <Icon>settings_input_antenna</Icon>,
            },
        ],
        [goToEditAction, execute]
    );

    return (
        <React.Fragment>
            {results !== undefined ? <ImportSummary results={results} onClose={() => setResults(undefined)} /> : null}

            {toDelete.length > 0 && (
                <ConfirmationDialog
                    isOpen={true}
                    onSave={confirmDelete}
                    onCancel={() => setToDelete([])}
                    title={i18n.t("Delete Actions?")}
                    description={
                        toDelete
                            ? i18n.t("Are you sure you want to delete {{total}} actions?", {
                                  total: toDelete.length,
                              })
                            : ""
                    }
                    saveText={i18n.t("Ok")}
                />
            )}

            <ObjectsTable<SyncAction>
                rows={rows}
                columns={columns}
                details={details}
                selection={selection}
                actions={actions}
                onChange={handleTableChange}
                onActionButtonClick={goToCreateAction}
            />
        </React.Fragment>
    );
};
