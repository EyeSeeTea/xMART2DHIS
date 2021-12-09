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
import { AppConfig } from "./AppConfig";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";

const App = ({ api, d2 }: { api: D2Api; d2: D2 }) => {
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
            initFeedbackTool(d2, appConfig);
            setLoading(false);
        }
        setup();
    }, [d2, api, baseUrl]);

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
                        </LoadingProvider>
                    </SnackbarProvider>
                </OldMuiThemeProvider>
            </MuiThemeProvider>
        </MsalProvider>
    );
};

type D2 = object;

declare global {
    interface Window {
        $: {
            feedbackDhis2(d2: D2, appKey: string, feedbackOptions: object): void;
        };
    }
}

function initFeedbackTool(d2: D2, appConfig: AppConfig): void {
    const appKey = _(appConfig).get("appKey");

    if (appConfig && appConfig.feedback) {
        const feedbackOptions = {
            ...appConfig.feedback,
            i18nPath: "feedback-tool/i18n",
        };
        window.$.feedbackDhis2(d2, appKey, feedbackOptions);
    }
}

export default React.memo(App);
