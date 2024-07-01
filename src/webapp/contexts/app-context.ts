import { PublicClientApplication } from "@azure/msal-browser";
import React, { useContext } from "react";
import { CompositionRoot } from "../../compositionRoot";
import { Instance } from "../../domain/entities/instance/Instance";
import { User } from "../../domain/entities/metadata/User";
import { D2Api } from "../../types/d2-api";
import i18n from "../../locales";

export interface AppContextState {
    api: D2Api;
    currentUser: User;
    compositionRoot: CompositionRoot;
    instance: Instance;
    azureInstance: PublicClientApplication;
}

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    i18n.setDefaultNamespace("xMART2DHIS");
    if (context) {
        return context;
    } else {
        throw new Error("App context uninitialized");
    }
}
