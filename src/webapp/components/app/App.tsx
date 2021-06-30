import { useConfig } from "@dhis2/app-runtime";
import { HeaderBar } from "@dhis2/ui";
import { LinearProgress } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { appConfig } from "../../../app-config";
import { getCompositionRoot } from "../../../compositionRoot";
import { User } from "../../../models/User";
import { D2Api } from "../../../types/d2-api";
import { AppContext, AppContextState } from "../../contexts/app-context";
import Root from "../../pages/root/RootPage";
import Share from "../share/Share";
import "./App.css";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";
import { AppConfig } from "./AppConfig";

const App = ({ api, d2 }: { api: D2Api; d2: D2 }) => {
    const { baseUrl } = useConfig();
    const [showShareButton, setShowShareButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            const compositionRoot = getCompositionRoot(api);
            const [config, currentUser] = await Promise.all([{}, User.getCurrent(api)]);
            const appContext: AppContextState = { d2, api, config, currentUser, compositionRoot };
            const isShareButtonVisible = _(appConfig).get("appearance.showShareButton") || false;

            setAppContext(appContext);
            setShowShareButton(isShareButtonVisible);
            initFeedbackTool(d2, appConfig);
            setLoading(false);
        }
        setup();
    }, [d2, api]);

    if (loading) {
        return (
            <div style={styles.loadWrapper}>
                <h3>Connecting to {baseUrl}...</h3>
                <LinearProgress />
            </div>
        );
    }

    return (
        <MuiThemeProvider theme={muiTheme}>
            <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                <SnackbarProvider>
                    <HeaderBar appName="Data Management" />

                    <div id="app" className="content">
                        <AppContext.Provider value={appContext}>
                            <Root />
                        </AppContext.Provider>
                    </div>

                    <Share visible={showShareButton} />
                </SnackbarProvider>
            </OldMuiThemeProvider>
        </MuiThemeProvider>
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

const styles = {
    loadWrapper: { margin: 20 },
};

export default React.memo(App);
