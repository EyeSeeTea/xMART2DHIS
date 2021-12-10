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
import { MappingTemplateDetailPage } from "./mapping-template-detail/MappingTemplateDetailPage";
import { MappingTemplateListPage } from "./mapping-termplate-list/MappingTemplateListPage";
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
                    path="/actions/new"
                    element={
                        <RouterPage title={i18n.t("Action")}>
                            <ActionDetailPage action="new" />
                        </RouterPage>
                    }
                />

                <Route
                    path="/actions/edit/:id"
                    element={
                        <RouterPage title={i18n.t("Action")}>
                            <ActionDetailPage action="edit" />
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
                    path={"/connections/new"}
                    element={
                        <RouterPage title={i18n.t("New connection")}>
                            <NewConnectionPage action="new" />
                        </RouterPage>
                    }
                />

                <Route
                    path={"/connections/edit/:id"}
                    element={
                        <RouterPage title={i18n.t("Edit connection")}>
                            <NewConnectionPage action="edit" />
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
                    path="/mapping-templates/:action(new|edit)/:id?"
                    element={
                        <RouterPage title={i18n.t("Mapping Template")}>
                            <MappingTemplateDetailPage />
                        </RouterPage>
                    }
                />

                <Route
                    path="/mapping-templates"
                    element={
                        <RouterPage title={i18n.t("Mapping Templates")}>
                            <MappingTemplateListPage />
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
