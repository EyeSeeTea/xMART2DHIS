import { Button, ButtonStrip, NoticeBox } from "@dhis2/ui";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Paper } from "@material-ui/core";
import { FORM_ERROR } from "final-form";
import React, { useCallback, useEffect, useState } from "react";
import { Form } from "react-final-form";
import { useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import { ConnectionData, DataMart } from "../../../domain/entities/xmart/XMart";
import i18n from "../../../locales";
import { generateUid } from "../../../utils/uid";
import { useAppContext } from "../../contexts/app-context";
import { useGoBack } from "../../hooks/useGoBack";
import { RenderConnectionField } from "./ConnectionForm";
import { getConnectionFieldName } from "./utils";

export const NewConnectionPage: React.FC = () => {
    const { compositionRoot, currentUser } = useAppContext();
    const { id, action = "new" } = useParams();
    const location = useLocation();
    const isEdit = action === "edit" && id ? true : false;
    const loading = useLoading();
    const snackbar = useSnackbar();
    const goBack = useGoBack();
    const goHome = useCallback(() => goBack(true), [goBack]);
    const defaultConnectionData: ConnectionData = {
        id: generateUid(),
        name: "",
        code: "",
        type: "PUBLIC",
        apiUrl: "",
        owner: { id: currentUser.id, name: currentUser.name },
        created: new Date(),
        lastUpdated: new Date(),
        lastUpdatedBy: { id: currentUser.id, name: currentUser.name },
        publicAccess: "--------",
        userAccesses: [],
        userGroupAccesses: [],
    };
    const [initialConnection, setInitialConnection] = useState<ConnectionData>(defaultConnectionData);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (location.state?.connection) {
            setInitialConnection(location.state?.connection);
        } else if (isEdit && id) {
            compositionRoot.connection.getById(id).run(
                result => setInitialConnection(result),
                () => setError(true)
            );
        }
    }, [compositionRoot, id, isEdit, location]);

    const testConnection = async ({ connections }: { connections: DataMart[] }) => {
        loading.show(true, i18n.t("Testing connection"));
        if (connections && connections[0]) {
            compositionRoot.connection.testConnection(connections[0]).run(
                batch => {
                    snackbar.success(`Connection tested successfully. Batch: ${batch}`);
                    loading.reset();
                },
                error => {
                    snackbar.error(error);
                    loading.reset();
                }
            );
        }
    };

    const onSubmit = useCallback(
        async ({ connections }: { connections: DataMart[] }) => {
            if (connections === undefined) return { FORM_ERROR };

            loading.show(true, i18n.t("Saving connection"));
            let connectionToSave: ConnectionData;

            if (connections[0]) {
                connectionToSave = {
                    ...initialConnection,
                    ...connections[0],
                };
                compositionRoot.connection.save(connectionToSave).run(
                    () => {
                        snackbar.success(
                            isEdit
                                ? i18n.t("Connection successfully edited")
                                : i18n.t("Connection successfully created")
                        );
                        loading.reset();
                        goHome();
                    },
                    () => {
                        snackbar.error("An error has occurred saving the connection");
                        loading.reset();
                        goHome();
                    }
                );
            }
        },
        [compositionRoot, loading, snackbar, goHome, initialConnection, isEdit]
    );

    const fields = ["name", "code", "type", "apiUrl"];
    const cancel = !isEdit ? i18n.t("Cancel connection creation") : i18n.t("Cancel connection editing");
    if (error) return null;

    return (
        <React.Fragment>
            <Container>
                <Form<{ connections: DataMart[] }>
                    autocomplete="off"
                    onSubmit={onSubmit}
                    initialValues={{ connections: [initialConnection] }}
                    render={({ handleSubmit, values, submitError }) => (
                        <form onSubmit={handleSubmit}>
                            {submitError && (
                                <NoticeBox title={i18n.t("Error saving connection")} error={true}>
                                    {submitError}
                                </NoticeBox>
                            )}
                            {fields.map(field => (
                                <Row key={`connection-row-${field}`}>
                                    <Label>{getConnectionFieldName(field)}</Label>
                                    <RenderConnectionField row={0} field={field} />
                                </Row>
                            ))}

                            <ButtonsRow>
                                <div>
                                    <Button type="submit" primary>
                                        {i18n.t("Save")}
                                    </Button>

                                    <Button type="reset" onClick={goHome}>
                                        {cancel}
                                    </Button>
                                </div>
                                <div style={{ marginRight: 7 }}>
                                    <Button type="button" onClick={() => testConnection(values)}>
                                        {i18n.t("Test connection")}
                                    </Button>
                                </div>
                            </ButtonsRow>
                        </form>
                    )}
                />
            </Container>
        </React.Fragment>
    );
};

const Row = styled.div`
    margin: 20px 0;
`;

const Label = styled.b`
    display: block;
    margin-bottom: 15px;
`;
const Container = styled(Paper)`
    margin: 20px;
    padding: 40px;
`;
const ButtonsRow = styled(ButtonStrip)`
    button:focus::after {
        border-color: transparent !important;
    }
    justify-content: space-between;
`;
