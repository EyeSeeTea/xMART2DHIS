import { Provider } from "@dhis2/app-runtime";
import i18n from "./utils/i18n";
import axios from "axios";
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import { Instance } from "./domain/entities/instance/Instance";
import { D2Api } from "./types/d2-api";
import { getD2APiFromInstance } from "./utils/d2-api";
import App from "./webapp/pages/app/App";
import "./webapp/utils/wdyr";

declare global {
    interface Window {
        api: D2Api;
    }
}

const isDev = import.meta.env.DEV;

async function getBaseUrl() {
    if (isDev) {
        return "/dhis2"; // Proxied by the dev server, see getProxy in vite.config.ts
    } else {
        const { data: manifest } = await axios.get<any>("manifest.webapp");
        return manifest.activities.dhis.href;
    }
}

const isLangRTL = (code: string) => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

const configI18n = ({ keyUiLocale }: { keyUiLocale: string }) => {
    i18n.changeLanguage(keyUiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(keyUiLocale) ? "rtl" : "ltr");
};

type ResponseError = { response?: { status?: number } };

function mayCarryAResponse(error: unknown): error is ResponseError {
    return typeof error === "object" && error !== null;
}

function isUnauthenticated(error: unknown): boolean {
    const status = mayCarryAResponse(error) ? error.response?.status : undefined;
    return status === 401 || status === 403;
}

async function main() {
    const baseUrl = await getBaseUrl();

    try {
        const instance = new Instance({ url: baseUrl });
        const api = getD2APiFromInstance(instance);
        if (isDev) window.api = api;

        const userSettings = await api.get<{ keyUiLocale: string }>("/userSettings").getData();
        configI18n(userSettings);
        const config = { baseUrl, apiVersion: 30 };

        ReactDOM.render(
            <React.StrictMode>
                <Provider config={config} plugin={false} parentAlertsAdd={() => {}} showAlertsInPlugin={false}>
                    <App api={api} />
                </Provider>
            </React.StrictMode>,
            document.getElementById("root")
        );
    } catch (error: unknown) {
        console.error(error);
        const feedback = isUnauthenticated(error) ? (
            <h3 style={{ margin: 20 }}>
                <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                    Login
                </a>
                {` ${baseUrl}`}
            </h3>
        ) : (
            <h3>{String(error)}</h3>
        );
        ReactDOM.render(<div>{feedback}</div>, document.getElementById("root"));
    }
}

main();
