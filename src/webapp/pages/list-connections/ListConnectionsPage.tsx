import _ from "lodash";
import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableColumn,
    useSnackbar,
    useLoading,
    TableSelection,
    TableAction,
    TableState
} from "@eyeseetea/d2-ui-components";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import i18n from "../../../locales";
import { useReload } from "../../hooks/useReload";
import { ImportSummary } from "../../components/import-summary/ImportSummary";
import { useAppContext } from "../../contexts/app-context";
import { DataMart, ConnectionData } from "../../../domain/entities/XMart";
import { User, isSuperAdmin } from "../../../domain/entities/User";
import { Delete, Share, Edit, FileCopy } from "@material-ui/icons";
import { SharingSettingsDialog, SharingSettingsDialogProps } from "./SharingSettingsDialog";
import { generateUid } from "../../../utils/uid";


export const ListConnectionsPage: React.FC = () => {
    const { compositionRoot, currentUser } = useAppContext();
    const snackbar = useSnackbar();
    const loadingScreen = useLoading();

    const history = useHistory();

    const [rows, setRows] = useState<ConnectionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, changeSearch] = useState<string>("");
    const [selection, setSelection] = useState<TableSelection[]>([]);
    const [createDialogProps, setCreateDialogProps] = useState<SharingSettingsDialogProps>();

    const [reloadKey, reload] = useReload();

    const columns: TableColumn<ConnectionData>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name") },
            { name: "code", text: i18n.t("Code") },
            { name: "type", text: i18n.t("Type") },
            { name: "apiUrl", text: i18n.t("Connection URL") },
        ],
        []
    );

    const verifyUserCanEdit = (connections: ConnectionData[]) => {
        if (!currentUser) return false;
        return connections.every((value) => hasPermissions(value, "write", currentUser));
        };

    const verifyUserCanRead = (connections: ConnectionData[]) => {
        if (!currentUser) return false;

        return connections.every((value) => hasPermissions(value, "read", currentUser));
    };

    const editConnection = async (ids: string[]) => {
        const connection = rows.find(row => row.id === ids[0]);
        if(connection) {
            history.push(`/connections/edit/${connection.id}`);
        }
    };

    const replicateConnection = async (ids: string[]) => {
        const connection = rows.find(row => row.id === ids[0]);
        if(connection) {
            compositionRoot.connection.getById(connection.id).then(result => {
                if(result === undefined) {
                    snackbar.error(i18n.t("Connection not found"));

                }
                else history.push({
                    pathname: "/connections/new",
                    state: { 
                        connection: {
                        ...connection, 
                        name: `Copy of ${connection.name}`, 
                        id: generateUid() }
                     },
                });
            });

        }
    };

    const hasPermissions = (connection: ConnectionData,  permission: "read" | "write", currentUser: User) => {
        if (isSuperAdmin(currentUser)) return true;

        const { publicAccess = "--------", userAccesses = [], userGroupAccesses = [], owner } = connection;
        const token = permission === "read" ? "r" : "w";

        const isUserOwner = owner?.id === currentUser.id;
        const isPublic = publicAccess.substring(0, 2).includes(token);

        const hasUserAccess = !!_(userAccesses)
            .filter(({ access }) => access.substring(0, 2).includes(token))
            .find(({ id }) => id === currentUser.id);

        const hasGroupAccess =
            _(userGroupAccesses)
                .filter(({ access }) => access.substring(0, 2).includes(token))
                .intersectionBy(currentUser.userGroups, "id")
                .value().length > 0;

        return isUserOwner || isPublic || hasUserAccess || hasGroupAccess;
    }

    const details: ObjectsTableDetailField<ConnectionData>[] = [
        { name: "name" as const, text: i18n.t("Connection name") },
        { name: "code" as const, text: i18n.t("Code") },
        { name: "apiUrl" as const, text: i18n.t("API URL") },
        { name: "type" as const, text: i18n.t("Type") },
    ];

    const actions: TableAction<ConnectionData>[] = useMemo(
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
                isActive: rows => verifyUserCanEdit(rows),
                primary: true,
                onClick: editConnection,
                icon: <Edit />,
            },
            {
                name: "replicate",
                text: i18n.t("Replicate"),
                multiple: false,
                isActive: rows => verifyUserCanEdit(rows),
                onClick: replicateConnection,
                icon: <FileCopy/>,
            },
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
            {
                name: "sharingSettings",
                text: i18n.t("Sharing settings"),
                isActive: verifyUserCanEdit,
                multiple: false,
                icon: <Share />,
                onClick: ids => {
                    const connection = rows.find(({ id }) => id === ids[0]);
                    if (!connection) return;
                    if(connection) {
                        setCreateDialogProps({
                            initialConnection: connection,
                            onClose: () => setCreateDialogProps(undefined),
                            onSave: async (connection: ConnectionData) => {
                                const connectionWithLastUpdatedInfo = {...connection, lastUpdated: new Date(), lastUpdatedBy: { id: currentUser.id, name: currentUser.name} };
                                await compositionRoot.connection.save(connectionWithLastUpdatedInfo);
                                reload();
                            },
                        });
                    }

                },
            },
        ],
        [loadingScreen, compositionRoot.connection, reload, rows]
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

    const onChange = useCallback((state: TableState<ConnectionData>) => {
        setSelection(state.selection);
    }, []);

    return (
        <React.Fragment>
            {createDialogProps ? <SharingSettingsDialog {...createDialogProps} /> : null}

            <ObjectsTable<ConnectionData>
                rows={rows}
                columns={columns}
                details={details}
                onChangeSearch={changeSearch}
                actions={actions}
                loading={loading}
                selection={selection}
                onChange={onChange}
                onActionButtonClick={createConnection}
            />
        </React.Fragment>
    );
};
