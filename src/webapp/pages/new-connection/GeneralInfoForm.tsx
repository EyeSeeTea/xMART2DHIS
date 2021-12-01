import {
    composeValidators,
    createMaxCharacterLength,
    createMinCharacterLength,
    createPattern,
    hasValue,
    InputFieldFF,
    string,
    alphaNumeric,
    CheckboxFieldFF,
    SingleSelectFieldFF,
    NoticeBox,
    ButtonStrip,
    Button
} from "@dhis2/ui";
import { Card, CardContent, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import _, { Dictionary } from "lodash";
import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { DataMart, defaultConnection } from "../../../domain/entities/XMart";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { Form, useForm, Field } from "react-final-form";
import { Paper } from "@material-ui/core";
import styled from "styled-components";
import { useGoBack } from "../../hooks/useGoBack";
import { FormField } from "../../components/form/FormField";
import { generateUid } from "../../../utils/uid";

export interface GeneralInfoFormProps {
    connection: DataMart;
    onChange: (connection: DataMart) => void;
    cancelAction: () => void;
}

export const GeneralInfoForm: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const goBack = useGoBack();
    const goHome = useCallback(() => goBack(true), [goBack]);

    const onSubmit = useCallback(
        async ({ connection }: { connection: DataMart }) => {
            loading.show(true, i18n.t("Saving connection"));
            console.log("TODO: save new connection");
            console.log(connection)
            /*try {
                await compositionRoot.connection.save({...connection, id: generateUid()});
            } catch (error: any) {
                console.error(error);
                return error ?? i18n.t("Network error");
            }
            goHome();*/
            /*const { data, error } = await compositionRoot.connection.save(connection).runAsync();
            if (error) return error ?? i18n.t("Network error");*/
            loading.reset();
            /*if (data && data.status === "ERROR") {
                setSummary([data]);
            } else {
                goHome();
            }*/
        },
        [compositionRoot, loading, goHome]
    );
   const typeOptions = [{label: "Public", value: "PUBLIC"}, {label: "Prod", value: "PROD"}, {label: "UAT", value: "UAT"}];
   //I need to consolidate this form in what is in user-extended-app and predictor app. It's too repetitive right now.
   return (
       <Container>
    <Form<{ connection: DataMart }>
    autocomplete="off"
    onSubmit={onSubmit}
    render={({ handleSubmit, values, submitError }) => (
        <form onSubmit={handleSubmit}>
        <FormFieldDiv>
        <Title>{i18n.t("Server name (*)")}</Title>
          <FormField name="name" component={InputFieldFF} />
        </FormFieldDiv>
        <FormFieldDiv>
        <Title>{i18n.t("Code (*)")}</Title>
          <FormField name="code" component={InputFieldFF} />
        </FormFieldDiv>
        <FormFieldDiv>
        <Title>{i18n.t("Type (*)")}</Title>
          <FormField name="type" options={typeOptions} component={SingleSelectFieldFF} />
        </FormFieldDiv>
        <FormFieldDiv>
        <Title>{i18n.t("API URL (*)")}</Title>
          <FormField name="apiUrl" component={InputFieldFF} />
        </FormFieldDiv>

        {submitError && (
                                <NoticeBox title={i18n.t("Error saving predictors")} error={true}>
                                    {submitError}
                                </NoticeBox>
                            )}

                            <ButtonsRow>
                                <div>
                                <Button type="submit" primary>
                                    {i18n.t("Save")}
                                </Button>

                                <Button type="reset" onClick={() => console.log("hello")}>
                                    {i18n.t("Close")}
                                </Button>
                                </div>
                                <div style={{marginRight: 7}}>
                                <Button>
                                    {i18n.t("Test connection")}
                                </Button>
                                </div>
                            </ButtonsRow>
        </form>
    )}
/>
</Container> ); };

            const Container = styled(Paper)`
            margin: 20px;
            padding: 40px;
        `;
        const Title = styled.b``;

        const ButtonsRow = styled(ButtonStrip)`

    button:focus::after {
        border-color: transparent !important;
    }
    justify-content: space-between;
`;

const FormFieldDiv = styled.div`
    margin-bottom: 10px;
`;