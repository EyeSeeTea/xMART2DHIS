import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Button } from "@material-ui/core";
import React, { useCallback } from "react";
import styled from "styled-components";
import i18n from "../../../locales";

export const AzureUser: React.FC = () => {
    const isAuthenticated = useIsAuthenticated();
    const { instance, accounts } = useMsal();

    const login = useCallback(() => {
        if (!isAuthenticated) instance.loginRedirect();
    }, [isAuthenticated, instance]);

    return (
        <React.Fragment>
            <Container onClick={login}>
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
                    <path fill="#f25022" d="M1 1H10V10H1z"></path>
                    <path fill="#00a4ef" d="M1 11H10V20H1z"></path>
                    <path fill="#7fba00" d="M11 1H20V10H11z"></path>
                    <path fill="#ffb900" d="M11 11H20V20H11z"></path>
                </svg>

                <TextWrapper>
                    {isAuthenticated ? (
                        <React.Fragment>
                            <p>{accounts[0]?.name}</p>
                            <p>{accounts[0]?.username}</p>
                        </React.Fragment>
                    ) : (
                        <h3>{i18n.t("Sign in with Microsoft")}</h3>
                    )}
                </TextWrapper>
            </Container>
        </React.Fragment>
    );
};

const Container = styled(Button)`
    position: absolute;
    right: 0;
    top: 0;
    margin-top: 60px;
    margin-right: 20px;
    background-color: #fff;
    padding: 0 20px;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    border: none;
    text-transform: none;
`;

const TextWrapper = styled.div`
    margin: 10px 25px;

    p {
        margin: 0;
        text-align: start;
    }
`;
