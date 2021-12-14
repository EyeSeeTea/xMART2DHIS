import { Button, NoticeBox } from "@dhis2/ui";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Paper } from "@material-ui/core";
import { FORM_ERROR } from "final-form";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Form } from "react-final-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Future } from "../../../domain/entities/Future";
import { DataMart } from "../../../domain/entities/xmart/DataMart";
import i18n from "../../../locales";
import { generateUid } from "../../../utils/uid";
import {
    PipelineSetupDialog,
    PipelineSetupDialogProps,
} from "../../components/pipeline-setup-dialog/PipelineSetupDialog";
import { useAppContext } from "../../contexts/app-context";
import { fields, getConnectionFieldName, RenderConnectionField } from "./ConnectionForm";

export const NewConnectionPage: React.FC<NewConnectionPageProps> = ({ action }) => {
    const { compositionRoot, currentUser } = useAppContext();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const navigate = useNavigate();

    const { id } = useParams();
    const location = useLocation();
    const isEdit = action === "edit" && id ? true : false;

    const goHome = useCallback(() => navigate("/connections"), [navigate]);

    const [openHelpDialogProps, setOpenHelpDialogProps] = useState<PipelineSetupDialogProps>();
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
        const [connection] = connections;
        if (!connection) return;

        loading.show(true, i18n.t("Testing connection"));
        compositionRoot.connection.testConnection(connection).run(
            batch => {
                snackbar.success(`Connection tested successfully. Batch: ${batch}`);
                loading.reset();
            },
            error => {
                if (
                    error === "Origin code 'LOAD_PIPELINE' does not exists" ||
                    error === "Sequence contains no elements"
                ) {
                    setOpenHelpDialogProps({
                        onCancel: () => setOpenHelpDialogProps(undefined),
                        mart: connection,
                    });
                } else {
                    snackbar.error(error);
                }

                loading.reset();
            }
        );
    };

    const onSubmit = useCallback(
        async ({ connections }: NewConnectionViewModel) => {
            const [connection] = connections;
            if (!connection) return { FORM_ERROR };

            loading.show(true, i18n.t("Saving connection"));
            compositionRoot.connection
                .testConnection(connection)
                .map(() => true)
                .flatMapError(() => Future.success(false))
                .flatMap(connectionWorks => compositionRoot.connection.save({ ...connection, connectionWorks }))
                .run(
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
        },
        [compositionRoot, loading, snackbar, goHome, isEdit]
    );

    if (error) return null;

    return (
        <Container>
            {openHelpDialogProps ? <PipelineSetupDialog {...openHelpDialogProps} /> : null}

            <Form<NewConnectionViewModel>
                autocomplete="off"
                keepDirtyOnReinitialize={true}
                initialValuesEqual={(a, b) => _.isEqual(a, b)}
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

interface NewConnectionViewModel {
    connections: DataMart[];
}
