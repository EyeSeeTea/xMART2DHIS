import { PublicClientApplication } from "@azure/msal-browser";
import { FutureData } from "../entities/Future";

export interface AzureRepository {
    getInstance(): PublicClientApplication;
    getTokenPROD(): FutureData<string>;
    getTokenUAT(): FutureData<string>;
}
