import { HashRouter, Route, Switch } from "react-router-dom";
import { LandingPage } from "./landing/LandingPage";
import { ListActionsPage } from "./list-actions/ListActionsPage";
import { ListMartPage } from "./list-mart/ListMartPage";
import { NewActionPage } from "./new-action/NewActionPage";

export const Router = () => {
    return (
        <HashRouter>
            <Switch>
                <Route path="/actions/new" render={() => <NewActionPage />} />
                <Route path="/actions" render={() => <ListActionsPage />} />
                <Route path="/list" render={() => <ListMartPage />} />
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
};
