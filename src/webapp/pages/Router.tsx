import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

export const Router = () => {
    return (
        <HashRouter>
            <Switch>
                {/* Default route */}
                <Route render={() => <React.Fragment />} />
            </Switch>
        </HashRouter>
    );
};
