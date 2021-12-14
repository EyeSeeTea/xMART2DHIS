import { ConfirmationDialog, ShareUpdate, Sharing, SharingRule } from "@eyeseetea/d2-ui-components";
import { useCallback, useState } from "react";
import { NamedRef } from "../../../domain/entities/metadata/Ref";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { DataMart } from "../../../domain/entities/xmart/DataMart";

export const SharingSettingsDialog: React.FC<SharingSettingsDialogProps> = ({ initialConnection, onClose, onSave }) => {
    const { compositionRoot, currentUser } = useAppContext();
    const defaultDataMart: DataMart = {
        id: "",
        name: "",
        martCode: "",
        environment: "UAT",
        dataEndpoint: "",
        connectionWorks: false,
        owner: { id: currentUser.id, name: currentUser.name },
        created: new Date(),
        lastUpdated: new Date(),
        lastUpdatedBy: { id: currentUser.id, name: currentUser.name },
        publicAccess: "--------",
        userAccesses: [],
        userGroupAccesses: [],
    };

    const [connection, updateConnection] = useState<DataMart>(initialConnection ?? defaultDataMart);
    const save = useCallback(async () => {
        await onSave(connection);
        onClose();
    }, [connection, onSave, onClose]);

    const search = useCallback(
        async (query: string) => {
            const results = await compositionRoot.instance.searchUsers(query);
            return { users: mapToSharingRule(results.users), userGroups: mapToSharingRule(results.userGroups) };
        },
        [compositionRoot]
    );

    const onSharingChanged = useCallback(async (updatedAttributes: ShareUpdate) => {
        updateConnection(connection => {
            const { userAccesses, userGroupAccesses } = updatedAttributes;
            return {
                ...connection,
                userAccesses: userAccesses ? userAccesses : connection.userAccesses,
                userGroupAccesses: userGroupAccesses ? userGroupAccesses : connection.userGroupAccesses,
            };
        });
    }, []);

    return (
        <ConfirmationDialog
            title={i18n.t("Sharing settings")}
            open={true}
            onSave={save}
            onCancel={onClose}
            maxWidth={"md"}
            fullWidth={true}
        >
            <Sharing
                meta={{
                    meta: { allowPublicAccess: true, allowExternalAccess: true },
                    object: {
                        id: "",
                        displayName: "",
                        userAccesses: connection.userAccesses,
                        userGroupAccesses: connection.userGroupAccesses,
                    },
                }}
                showOptions={sharingOptions}
                onSearch={search}
                onChange={onSharingChanged}
            />
        </ConfirmationDialog>
    );
};

export interface SharingSettingsDialogProps {
    initialConnection?: DataMart;
    onClose: () => void;
    onSave: (connection: DataMart) => Promise<void>;
}

function mapToSharingRule(array: NamedRef[]): SharingRule[] {
    return array.map(({ id, name }) => ({ id, displayName: name, access: "--------" }));
}

const sharingOptions = {
    title: false,
    dataSharing: true,
    publicSharing: true,
    externalSharing: true,
    permissionPicker: true,
};
