import { HashRouter, Route, Switch } from "react-router-dom";
import { ActionsPage } from "./actions/ActionsPage";
import { LandingPage } from "./landing/LandingPage";
import { ListPage } from "./list/ListPage";

export const Router = () => {
    return (
        <HashRouter>
            <Switch>
                <Route path="/actions" render={() => <ActionsPage />} />
                <Route path="/list" render={() => <ListPage />} />
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
};
