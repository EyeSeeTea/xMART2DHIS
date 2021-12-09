import React from "react";
import { HashRouter, Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import i18n from "../../locales";
import { AzureBadge } from "../components/azure-badge/AzureBadge";
import { PageHeader } from "../components/page-header/PageHeader";
import { ActionDetailPage } from "./action-detail/ActionDetailPage";
import { ActionsListPage } from "./actions-list/ActionsListPage";
import { LandingPage } from "./landing/LandingPage";
import { ListConnectionsPage } from "./list-connections/ListConnectionsPage";
import { ListMartPage } from "./list-mart/ListMartPage";
import { NewConnectionPage } from "./new-connection/NewConnectionPage";

export interface DetailPageParams {
    id: string;
    action: "edit" | "new";
}

export const Router = () => {
    return (
        <HashRouter>
            <Routes>
                <Route
                    path="/actions/:action(new|edit)/:id?"
                    element={
                        <RouterPage title={i18n.t("Action")}>
                            <ActionDetailPage />
                        </RouterPage>
                    }
                />

                <Route
                    path="/actions"
                    element={
                        <RouterPage title={i18n.t("Actions")}>
                            <ActionsListPage />
                        </RouterPage>
                    }
                />

                <Route
                    path={"/connections/:action(new|edit)/:id?"}
                    element={
                        <RouterPage title={i18n.t("Connection creation")}>
                            <NewConnectionPage />
                        </RouterPage>
                    }
                />

                <Route
                    path="/connections"
                    element={
                        <RouterPage title={i18n.t("Connections")}>
                            <ListConnectionsPage />
                        </RouterPage>
                    }
                />

                <Route
                    path="/list"
                    element={
                        <RouterPage title={i18n.t("Browse xMART")}>
                            <ListMartPage />
                        </RouterPage>
                    }
                />

                <Route
                    path="/"
                    element={
                        <RouterPage title={i18n.t("xMART2DHIS")} isRoot={true}>
                            <LandingPage />
                        </RouterPage>
                    }
                />
            </Routes>
        </HashRouter>
    );
};

const RouterPage: React.FC<{ title: string; isRoot?: boolean }> = ({ children, title, isRoot = false }) => {
    const navigate = useNavigate();

    return (
        <Container>
            <AppHeader>
                <PageHeader title={title} onBackClick={!isRoot ? () => navigate(-1) : undefined} />
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
