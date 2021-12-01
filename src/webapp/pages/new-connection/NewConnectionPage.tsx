import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { GeneralInfoForm } from "./GeneralInfoForm";
import { DataMart, defaultConnection } from "../../../domain/entities/XMart";
import { PageHeader } from "../../components/page-header/PageHeader";


export const NewConnectionPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const { id, action } = useParams<{ id: string; action: "new" | "edit" }>();
    const location = useLocation<{ connection?: DataMart }>();
    const isEdit = action === "edit" && id;

    const [error, setError] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [connection, setConnection] = useState<DataMart>(defaultConnection);

    useEffect(() => {
        if (location.state?.connection) {
            setConnection(location.state?.connection);
        } else if (isEdit) {
            //TODO
            console.log("TODO: isEdit form");
            /*compositionRoot.connection.getById(id).then(result =>
                result.match({
                    success: setConnection,
                    error: () => {
                        setError(true);
                    },
                })
            );*/
        }
    }, [compositionRoot, id, isEdit, location]);

    const cancelSave = useCallback(() => {
        setDialogOpen(true);
    }, []);

    const handleConfirm = useCallback(() => {
        setDialogOpen(true);
        history.push("/connections");
    }, [history]);

    const handleDialogCancel = useCallback(() => {
        setDialogOpen(false);
    }, []);

    const onChange = useCallback((connection: DataMart) => {
        setConnection(connection);
    }, []);

    const title = !isEdit ? i18n.t("New Connection") : i18n.t("Edit Connection");

    const cancel = !isEdit ? i18n.t("Cancel Connection Creation") : i18n.t("Cancel Connection Editing");

    if (error) return null;

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={dialogOpen}
                onSave={handleConfirm}
                onCancel={handleDialogCancel}
                title={cancel}
                description={i18n.t("All your changes will be lost. Are you sure?")}
                saveText={i18n.t("Ok")}
            />
            <PageHeader title={i18n.t("Create Connection")} onBackClick={() => window.history.back()} />

            <GeneralInfoForm />
        </React.Fragment>
    );
};