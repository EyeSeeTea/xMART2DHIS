import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SyncAction } from "../../../domain/entities/actions/SyncAction";
import i18n from "../../../locales";
import ActionWizard from "../../components/action-wizard/ActionWizard";
import { useAppContext } from "../../contexts/app-context";

//TODO: implement confirmation dialog to back or cancel in the RouterPage
//because it's where the back button exists or to create a hook to access to back from here
export const ActionDetailPage: React.FC<ActionDetailPageProps> = ({ action }) => {
    const { compositionRoot } = useAppContext();
    const loading = useLoading();
    const navigate = useNavigate();
    const snackbar = useSnackbar();

    const { id } = useParams();

    const [syncAction, updateSyncAction] = useState(() => SyncAction.build());

    useEffect(() => {
        if (action === "edit" && !!id) {
            loading.show(true, i18n.t("Loading action"));

            compositionRoot.actions.get(id).run(
                action => {
                    updateSyncAction(action ?? SyncAction.build());
                    loading.reset();
                },
                () => {
                    loading.reset();
                    snackbar.error(i18n.t("An error has ocurred loading the action"));
                }
            );
        }
    }, [compositionRoot, loading, action, id, snackbar]);

    return (
        <React.Fragment>
            <ActionWizard action={syncAction} onChange={updateSyncAction} onCancel={() => navigate(-1)} />
        </React.Fragment>
    );
};

export interface ActionDetailPageProps {
    action: "edit" | "new";
}
