import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import i18n from "../../locales";
import { AzureBadge } from "../components/azure-badge/AzureBadge";
import { PageHeader } from "../components/page-header/PageHeader";
import { LandingPage } from "./landing/LandingPage";
import { ListMartPage } from "./list-mart/ListMartPage";
import { ListActionsPage } from "./list-actions/ListActionsPage";
import { NewActionPage } from "./new-action/NewActionPage";

export const Router = () => {
    return (
        <HashRouter>
            <Switch>
                <Route
                    path="/actions/new"
                    render={() => (
                        <RouterPage title={i18n.t("New action")}>
                            <NewActionPage />
                        </RouterPage>
                    )}
                />

                <Route
                    path="/actions"
                    render={() => (
                        <RouterPage title={i18n.t("Actions")}>
                            <ListActionsPage />
                        </RouterPage>
                    )}
                />

                <Route
                    path="/list"
                    render={() => (
                        <RouterPage title={i18n.t("Browse xMART")}>
                            <ListMartPage />
                        </RouterPage>
                    )}
                />

                <Route
                    render={() => (
                        <RouterPage title={i18n.t("xMART2DHIS")} isRoot={true}>
                            <LandingPage />
                        </RouterPage>
                    )}
                />
            </Switch>
        </HashRouter>
    );
};

const RouterPage: React.FC<{ title: string; isRoot?: boolean }> = ({ children, title, isRoot = false }) => {
    return (
        <Container>
            <AppHeader>
                <PageHeader title={title} onBackClick={!isRoot ? () => window.history.back() : undefined} />
                <Spacer />
                <AzureBadge />
            </AppHeader>

            {children}
        </Container>
    );
};

const Container = styled.div`
    margin: 10px 20px;
`;

const AppHeader = styled.div`
    display: flex;

    div {
        align-self: center;
    }

    h5 {
        margin: 20px;
    }
`;

const Spacer = styled.div`
    flex: 1;
`;
