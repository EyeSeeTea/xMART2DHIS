import { PublicClientApplication } from "@azure/msal-browser";
import React, { useContext } from "react";
import { CompositionRoot } from "../../compositionRoot";
import { Instance } from "../../domain/entities/Instance";
import { User } from "../../domain/entities/User";
import { D2Api } from "../../types/d2-api";

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
    if (context) {
        return context;
    } else {
        throw new Error("App context uninitialized");
    }
}
