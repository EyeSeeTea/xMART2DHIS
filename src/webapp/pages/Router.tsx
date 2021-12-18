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
                    path="/actions/new/custom"
                    element={
                        <RouterPage title={i18n.t("Custom Action")} parentRoute="/actions">
                            <ActionDetailPage action="custom" />
                        </RouterPage>
                    }
                />
                <Route
                    path="/actions/new"
                    element={
                        <RouterPage title={i18n.t("Action")} parentRoute="/actions">
                            <ActionDetailPage action="new" />
                        </RouterPage>
                    }
                />

                <Route
                    path="/actions/edit/:id"
                    element={
                        <RouterPage title={i18n.t("Action")} parentRoute="/actions">
                            <ActionDetailPage action="edit" />
                        </RouterPage>
                    }
                />

                <Route
                    path="/actions"
                    element={
                        <RouterPage title={i18n.t("Actions")} parentRoute="/">
                            <ActionsListPage />
                        </RouterPage>
                    }
                />

                <Route
                    path={"/connections/new"}
                    element={
                        <RouterPage title={i18n.t("New connection")} parentRoute="/connections">
                            <NewConnectionPage action="new" />
                        </RouterPage>
                    }
                />

                <Route
                    path={"/connections/edit/:id"}
                    element={
                        <RouterPage title={i18n.t("Edit connection")} parentRoute="/connections">
                            <NewConnectionPage action="edit" />
                        </RouterPage>
                    }
                />

                <Route
                    path="/connections"
                    element={
                        <RouterPage title={i18n.t("Connections")} parentRoute="/">
                            <ListConnectionsPage />
                        </RouterPage>
                    }
                />

                <Route
                    path="/mapping-templates/new"
                    element={
                        <RouterPage title={i18n.t("Mapping Template")} parentRoute="/mapping-templates">
                            <MappingTemplateDetailPage action="new" />
                        </RouterPage>
                    }
                />

                <Route
                    path="/mapping-templates/edit/:id"
                    element={
                        <RouterPage title={i18n.t("Mapping Template")} parentRoute="/mapping-templates">
                            <MappingTemplateDetailPage action="edit" />
                        </RouterPage>
                    }
                />

                <Route
                    path="/mapping-templates"
                    element={
                        <RouterPage title={i18n.t("Mapping Templates")} parentRoute="/">
                            <MappingTemplateListPage />
                        </RouterPage>
                    }
                />

                <Route
                    path="/list"
                    element={
                        <RouterPage title={i18n.t("Browse xMART")} parentRoute="/">
                            <ListMartPage />
                        </RouterPage>
                    }
                />

                <Route
                    path="/"
                    element={
                        <RouterPage title={i18n.t("xMART2DHIS")}>
                            <LandingPage />
                        </RouterPage>
                    }
                />
            </Routes>
        </HashRouter>
    );
};

const RouterPage: React.FC<{ title: string; parentRoute?: string }> = ({ children, title, parentRoute }) => {
    const navigate = useNavigate();

    return (
        <Container>
            <AppHeader>
                <PageHeader title={title} onBackClick={parentRoute ? () => navigate(parentRoute) : undefined} />
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
