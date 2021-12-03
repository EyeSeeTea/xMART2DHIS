import { NoticeBox, ButtonStrip, Button } from "@dhis2/ui";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { Form } from "react-final-form";
import { FORM_ERROR } from "final-form";
import { DataMart, defaultConnection } from "../../../domain/entities/XMart";
import styled from "styled-components";
import { useGoBack } from "../../hooks/useGoBack";
import { getConnectionFieldName } from "./utils";
import { RenderConnectionField } from "./ConnectionForm";
import { Paper } from "@material-ui/core";

export const NewConnectionPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const { id, action } = useParams<{ id: string; action: "new" | "edit" }>();
    const location = useLocation<{ connection?: DataMart }>();
    const isEdit = action === "edit" && id;
    const loading = useLoading();
    const snackbar = useSnackbar();
    const goBack = useGoBack();
    const goHome = useCallback(() => goBack(true), [goBack]);
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

    const onSubmit = useCallback(
        async ({ connections }: { connections: DataMart[] }) => {
            if (connections === undefined) return { FORM_ERROR };

            loading.show(true, i18n.t("Saving connection"));
            await compositionRoot.connection.save(connections);
            snackbar.success(i18n.t("Connection successfully created"));
            loading.reset();
            goHome();
        },
        [compositionRoot, loading, snackbar, goHome]
    );

    const fields = ["name", "code", "type", "apiUrl"];
    const cancel = !isEdit ? i18n.t("Cancel connection creation") : i18n.t("Cancel connection editing");

    return (
        <React.Fragment>
            <Container>
                <Form<{ connections: DataMart[] }>
                    autocomplete="off"
                    onSubmit={onSubmit}
                    render={({ handleSubmit, submitError }) => (
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
                                    <Button>{i18n.t("Test connection")}</Button>
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
