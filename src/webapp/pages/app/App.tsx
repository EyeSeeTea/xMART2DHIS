import { MsalProvider } from "@azure/msal-react";
import { useConfig } from "@dhis2/app-runtime";
import { HeaderBar } from "@dhis2/ui";
import { LoadingProvider, SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { MuiThemeProvider } from "@material-ui/core/styles";
import _ from "lodash";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { appConfig } from "../../../app-config";
import { getCompositionRoot } from "../../../compositionRoot";
import { Instance } from "../../../domain/entities/instance/Instance";
import { D2Api } from "../../../types/d2-api";
import Share from "../../components/share/Share";
import { AppContext, AppContextState } from "../../contexts/app-context";
import { Router } from "../Router";
import "./App.css";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";
import { Feedback } from "@eyeseetea/feedback-component";

const App = ({ api }: { api: D2Api }) => {
    const { baseUrl } = useConfig();
    const [showShareButton, setShowShareButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            const instance = new Instance({ url: baseUrl });
            const compositionRoot = getCompositionRoot(instance);
            const { data: currentUser } = await compositionRoot.instance.getCurrentUser().runAsync();
            if (!currentUser) throw new Error("User not logged in");

            const azureInstance = compositionRoot.azure.getInstance();
            setAppContext({ api, instance, currentUser, compositionRoot, azureInstance });

            const isShareButtonVisible = _(appConfig).get("appearance.showShareButton") || false;

            setShowShareButton(isShareButtonVisible);
            setLoading(false);
        }
        setup();
    }, [api, baseUrl]);

    if (loading || !appContext) return null;

    return (
        <MsalProvider instance={appContext.azureInstance}>
            <MuiThemeProvider theme={muiTheme}>
                <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                    <SnackbarProvider>
                        <LoadingProvider>
                            <HeaderBar appName="xMART2DHIS" />

                            <div id="app" className="content">
                                <AppContext.Provider value={appContext}>
                                    <Router />
                                </AppContext.Provider>
                            </div>

                            <Share visible={showShareButton} />
                            {appContext && (
                                <Feedback options={appConfig.feedback} username={appContext.currentUser.username} />
                            )}
                        </LoadingProvider>
                    </SnackbarProvider>
                </OldMuiThemeProvider>
            </MuiThemeProvider>
        </MsalProvider>
    );
};

export default React.memo(App);
