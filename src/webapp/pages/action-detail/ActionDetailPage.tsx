import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { SyncAction } from "../../../domain/entities/actions/SyncAction";
import i18n from "../../../locales";
import SyncWizard from "../../components/sync-wizard/SyncWizard";
import { useAppContext } from "../../contexts/app-context";

export interface SyncActionDetailParams {
    id: string;
    action: "edit" | "new";
}

export const ActionDetailPage: React.FC = () => {
    //TODO: implement confirmation dialog to back or cancel in the RouterPage
    //because it's where the back button exists or to create a hook to access to back from here
    const loading = useLoading();
    const history = useHistory();
    const snackbar = useSnackbar();
    const { id, action } = useParams() as SyncActionDetailParams;
    const { compositionRoot } = useAppContext();

    const [syncAction, updateSyncAction] = useState(SyncAction.build());

    useEffect(() => {
        if (action === "edit" && !!id) {
            loading.show(true, "Loading action");

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
            <SyncWizard action={syncAction} onChange={updateSyncAction} onCancel={() => history.goBack()} />
        </React.Fragment>
    );
};
