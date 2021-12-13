import { Button, NoticeBox } from "@dhis2/ui";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Paper } from "@material-ui/core";
import { FORM_ERROR } from "final-form";
import React, { useCallback, useEffect, useState } from "react";
import { Form } from "react-final-form";
import { useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import { DataMart } from "../../../domain/entities/xmart/DataMart";
import i18n from "../../../locales";
import { generateUid } from "../../../utils/uid";
import { useAppContext } from "../../contexts/app-context";
import { useGoBack } from "../../hooks/useGoBack";
import { fields, getConnectionFieldName, RenderConnectionField } from "./ConnectionForm";
import HelpDialog, { HelpDialogProps } from "../../components/help-dialog/HelpDialog";

export const NewConnectionPage: React.FC<NewConnectionPageProps> = ({ action }) => {
    const { compositionRoot, currentUser } = useAppContext();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const goBack = useGoBack("/connections");

    const { id } = useParams();
    const location = useLocation();
    const isEdit = action === "edit" && id ? true : false;

    const goHome = useCallback(() => goBack(true), [goBack]);

    const [openHelpDialogProps, setOpenHelpDialogProps] = useState<HelpDialogProps>();
    const [error, setError] = useState<boolean>(false);
    const [initialConnection, setInitialConnection] = useState<DataMart>({
        id: generateUid(),
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
    });

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
                    setInitialConnection(connection => ({ ...connection, connectionWorks: true }));
                    loading.reset();
                },
                error => {
                    snackbar.error(error);
                    setInitialConnection(connection => ({ ...connection, connectionWorks: false }));
                    if (error === "Origin code 'LOAD_PIPELINE' does not exists") {
                        setOpenHelpDialogProps({
                            onCancel: () => setOpenHelpDialogProps(undefined),
                            code: connections && connections[0] ? connections[0].martCode : "",
                            name: connections && connections[0] ? connections[0].name : "",
                        });
                    }

                    loading.reset();
                }
            );
        }
    };

    const onSubmit = useCallback(
        async ({ connections }: { connections: DataMart[] }) => {
            if (connections === undefined) return { FORM_ERROR };

            loading.show(true, i18n.t("Saving connection"));
            let connectionToSave: DataMart;

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

    if (error) return null;

    return (
        <Container>
            {openHelpDialogProps ? <HelpDialog {...openHelpDialogProps} /> : null}
            <Form<{ connections: DataMart[] }>
                autocomplete="off"
                keepDirtyOnReinitialize={true}
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
                                <RenderConnectionField values={values.connections} row={0} field={field} />
                            </Row>
                        ))}

                        <ButtonsRow>
                            <Button type="submit" primary>
                                {i18n.t("Save")}
                            </Button>

                            <Button type="reset" onClick={goHome}>
                                {i18n.t("Cancel")}
                            </Button>

                            <Spacer />

                            <Button type="button" onClick={() => testConnection(values)}>
                                {i18n.t("Test connection")}
                            </Button>
                        </ButtonsRow>
                    </form>
                )}
            />
        </Container>
    );
};

export interface NewConnectionPageProps {
    action: "new" | "edit";
}

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

const ButtonsRow = styled.div`
    display: flex;
    gap: 20px;
    padding-top: 10px;
    margin-right: 9px;
`;

const Spacer = styled.span`
    flex-grow: 1;
`;
