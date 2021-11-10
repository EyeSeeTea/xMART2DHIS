import { AccountInfo } from "@azure/msal-common";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Button } from "@material-ui/core";
import React, { useCallback } from "react";
import styled from "styled-components";
import i18n from "../../../locales";

export const AzureBadge: React.FC = () => {
    const isAuthenticated = useIsAuthenticated();
    const { instance, accounts } = useMsal();

    const login = useCallback(() => {
        if (!isAuthenticated) instance.loginRedirect();
    }, [isAuthenticated, instance]);

    return (
        <Container onClick={login}>
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
                <path fill="#f25022" d="M1 1H10V10H1z"></path>
                <path fill="#00a4ef" d="M1 11H10V20H1z"></path>
                <path fill="#7fba00" d="M11 1H20V10H11z"></path>
                <path fill="#ffb900" d="M11 11H20V20H11z"></path>
            </svg>

            <UserBadge>
                <UserBadgeText account={accounts[0]} isAuthenticated={isAuthenticated} />
            </UserBadge>
        </Container>
    );
};

const UserBadgeText: React.FC<{ account?: AccountInfo; isAuthenticated: boolean }> = ({ account, isAuthenticated }) => {
    if (!isAuthenticated) return <p>{i18n.t("Sign in with Microsoft")}</p>;

    return (
        <React.Fragment>
            <p>{account?.name ?? i18n.t("Unknown user")}</p>
            <p>{account?.username ?? ""}</p>
        </React.Fragment>
    );
};

const Container = styled(Button)`
    margin: 10px;
    background-color: #fff;
    padding: 0 20px;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    border: none;
    text-transform: none;
`;

const UserBadge = styled.div`
    margin: 10px 25px;

    p {
        margin: 0;
        text-align: start;
    }
`;
