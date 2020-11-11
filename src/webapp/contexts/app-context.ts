import React, { useContext } from "react";
import { Config } from "../../models/Config";
import { User } from "../../models/User";
import { D2Api } from "../../types/d2-api";

export interface AppContext {
    api: D2Api;
    d2: object;
    config: Config;
    currentUser: User;
}

export const AppContext = React.createContext<AppContext | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (context) {
        return context;
    } else {
        throw new Error("Context not found");
    }
}
