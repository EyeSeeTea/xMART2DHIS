import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import { AzureLogin } from "../components/azure-login/AzureLogin";
import { LandingPage } from "./landing/LandingPage";
import { ListActionsPage } from "./list-actions/ListActionsPage";
import { ListMartPage } from "./list-mart/ListMartPage";
import { NewActionPage } from "./new-action/NewActionPage";

export const Router = () => {
    return (
        <React.Fragment>
            <AzureLogin />

            <Container>
                <HashRouter>
                    <Switch>
                        <Route path="/actions/new" render={() => <NewActionPage />} />
                        <Route path="/actions" render={() => <ListActionsPage />} />
                        <Route path="/list" render={() => <ListMartPage />} />
                        <Route render={() => <LandingPage />} />
                    </Switch>
                </HashRouter>
            </Container>
        </React.Fragment>
    );
};

const Container = styled.div`
    margin: 30px 10px;
`;
