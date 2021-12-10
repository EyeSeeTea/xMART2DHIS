import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { Delete, Edit, FileCopy, SettingsInputAntenna, Share } from "@material-ui/icons";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSuperAdmin, User } from "../../../domain/entities/metadata/User";
import { DataMart } from "../../../domain/entities/xmart/DataMart";
import i18n from "../../../locales";
import { generateUid } from "../../../utils/uid";
import { useAppContext } from "../../contexts/app-context";
import { useReload } from "../../hooks/useReload";
import { SharingSettingsDialog, SharingSettingsDialogProps } from "./SharingSettingsDialog";

export const ListConnectionsPage: React.FC = () => {
    const { compositionRoot, currentUser } = useAppContext();
    const snackbar = useSnackbar();
    const loadingScreen = useLoading();

    const navigate = useNavigate();

    const [rows, setRows] = useState<DataMart[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, changeSearch] = useState<string>("");
    const [selection, setSelection] = useState<TableSelection[]>([]);
    const [createDialogProps, setCreateDialogProps] = useState<SharingSettingsDialogProps>();

    const [reloadKey, reload] = useReload();

    const columns: TableColumn<DataMart>[] = useMemo(
        () => [
            { name: "name", text: i18n.t("Name") },
            { name: "martCode", text: i18n.t("Code") },
            { name: "environment", text: i18n.t("Type") },
            { name: "dataEndpoint", text: i18n.t("Connection URL") },
        ],
        []
    );

    const verifyUserCanEdit = useCallback(
        (connections: DataMart[]) => {
            if (!currentUser) return false;
            return connections.every(value => hasPermissions(value, "write", currentUser));
        },
        [currentUser]
    );

    const editConnection = useCallback(
        async (ids: string[]) => {
            const connection = rows.find(row => row.id === ids[0]);
            if (connection) {
                navigate(`/connections/edit/${connection.id}`);
            }
        },
        [navigate, rows]
    );

    const deleteConnections = useCallback(
        async (ids: string[]) => {
            loadingScreen.show(true, i18n.t("Deleting connections"));
            compositionRoot.connection.delete(ids).run(
                () => {
                    snackbar.success(i18n.t("Successfully deleted {{total}} connections", { total: ids.length }));
                    setSelection([]);
                    loadingScreen.reset();
                    reload();
                },
                _error => {
                    loadingScreen.reset();
                    snackbar.error(i18n.t("An error has ocurred deleting connection(s)"));
                }
            );
        },
        [compositionRoot.connection, loadingScreen, reload, snackbar]
    );

    const replicateConnection = useCallback(
        async (ids: string[]) => {
            const connection = rows.find(row => row.id === ids[0]);
            if (connection) {
                compositionRoot.connection.getById(connection.id).run(
                    connection =>
                        navigate("/connections/new", {
                            state: {
                                connection: {
                                    ...connection,
                                    name: `Copy of ${connection.name}`,
                                    id: generateUid(),
                                },
                            },
                        }),
                    () => snackbar.error(i18n.t("Connection not found"))
                );
            }
        },
        [compositionRoot.connection, navigate, rows, snackbar]
    );

    const setSharingSettings = useCallback(
        async (ids: string[]) => {
            const connection = rows.find(({ id }) => id === ids[0]);
            if (!connection) return;
            if (connection) {
                setCreateDialogProps({
                    initialConnection: connection,
                    onClose: () => setCreateDialogProps(undefined),
                    onSave: async (connection: DataMart) => {
                        loadingScreen.show(true, i18n.t("Updating sharing settings"));
                        const connectionWithLastUpdatedInfo = {
                            ...connection,
                            lastUpdated: new Date(),
                            lastUpdatedBy: { id: currentUser.id, name: currentUser.name },
                        };
                        compositionRoot.connection.save(connectionWithLastUpdatedInfo).run(
                            () => {
                                snackbar.success(i18n.t("Successfully updated sharing settings"));
                                loadingScreen.reset();
                                reload();
                            },
                            () => {
                                snackbar.error("An error has occurred saving the sharing settings");
                                loadingScreen.reset();
                                reload();
                            }
                        );
                    },
                });
            }
        },
        [compositionRoot.connection, currentUser.id, currentUser.name, loadingScreen, reload, rows, snackbar]
    );

    const testConnection = useCallback(
        async (ids: string[]) => {
            loadingScreen.show(true, i18n.t("Testing connection"));
            const connection = rows.find(row => row.id === ids[0]);
            if (connection) {
                compositionRoot.connection
                    .testConnection({
                        id: connection.id,
                        name: connection.name,
                        martCode: connection.martCode,
                        environment: connection.environment,
                        dataEndpoint: connection.dataEndpoint,
                    } as DataMart)
                    .run(
                        batch => {
                            snackbar.success(`Connection tested successfully. Batch: ${batch}`);
                            loadingScreen.reset();
                        },
                        error => {
                            snackbar.error(error);
                            loadingScreen.reset();
                        }
                    );
            }
        },
        [compositionRoot.connection, loadingScreen, rows, snackbar]
    );

    const details: ObjectsTableDetailField<DataMart>[] = [
        { name: "name" as const, text: i18n.t("Connection name") },
        { name: "martCode" as const, text: i18n.t("Code") },
        { name: "dataEndpoint" as const, text: i18n.t("API URL") },
        { name: "environment" as const, text: i18n.t("Type") },
    ];

    const actions: TableAction<DataMart>[] = useMemo(
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
                icon: <FileCopy />,
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                icon: <Delete />,
                multiple: true,
                onClick: deleteConnections,
            },
            {
                name: "testConnection",
                text: i18n.t("Test connection"),
                multiple: false,
                icon: <SettingsInputAntenna />,
                onClick: testConnection,
            },
            {
                name: "sharingSettings",
                text: i18n.t("Sharing settings"),
                isActive: verifyUserCanEdit,
                multiple: false,
                icon: <Share />,
                onClick: setSharingSettings,
            },
        ],
        [deleteConnections, editConnection, replicateConnection, setSharingSettings, testConnection, verifyUserCanEdit]
    );
    useEffect(() => {
        setLoading(true);
        compositionRoot.connection.listAll({ search }).run(
            rows => setRows(rows),
            error => snackbar.error(error)
        );
        setLoading(false);
    }, [compositionRoot, snackbar, search, reloadKey]);

    const createConnection = () => {
        navigate("/connections/new");
    };

    const onChange = useCallback((state: TableState<DataMart>) => {
        setSelection(state.selection);
    }, []);

    return (
        <React.Fragment>
            {createDialogProps ? <SharingSettingsDialog {...createDialogProps} /> : null}

            <ObjectsTable<DataMart>
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

const hasPermissions = (connection: DataMart, permission: "read" | "write", currentUser: User) => {
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
};
