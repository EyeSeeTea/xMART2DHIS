import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import i18n from "../../locales";
import { AzureBadge } from "../components/azure-badge/AzureBadge";
import { PageHeader } from "../components/page-header/PageHeader";
import { LandingPage } from "./landing/LandingPage";
import { ListConnectionsPage } from "./list-connections/ListConnectionsPage";
import { NewConnectionPage } from "./new-connection/NewConnectionPage";
import { ListMartPage } from "./list-mart/ListMartPage";
import { ActionsListPage } from "./actions-list/ActionsListPage";
import { ActionDetailPage } from "./action-detail/ActionDetailPage";

export interface DetailPageParams {
    id: string;
    action: "edit" | "new";
}

export const Router = () => {
    return (
        <HashRouter>
            <Switch>
                <Route
                    path="/actions/:action(new|edit)/:id?"
                    render={() => (
                        <RouterPage title={i18n.t("Action")}>
                            <ActionDetailPage />
                        </RouterPage>
                    )}
                />

                <Route
                    path="/actions"
                    render={() => (
                        <RouterPage title={i18n.t("Actions")}>
                            <ActionsListPage />
                        </RouterPage>
                    )}
                />

                <Route
                    path={"/connections/:action(new|edit)/:id?"}
                    render={props => (
                        <RouterPage
                            title={
                                props.match.params.action === "new"
                                    ? i18n.t("New Connection")
                                    : i18n.t("Edit Connection")
                            }
                        >
                            <NewConnectionPage />
                        </RouterPage>
                    )}
                />

                <Route
                    path="/connections"
                    render={() => (
                        <RouterPage title={i18n.t("Connections")}>
                            <ListConnectionsPage />
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
