import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import { AzureUser } from "../components/azure-user/AzureUser";
import { LandingPage } from "./landing/LandingPage";
import { ListActionsPage } from "./list-actions/ListActionsPage";
import { ListMartPage } from "./list-mart/ListMartPage";
import { NewActionPage } from "./new-action/NewActionPage";

export const Router = () => {
    return (
        <React.Fragment>
            <AzureUser />

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
