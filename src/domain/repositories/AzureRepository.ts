import { PublicClientApplication } from "@azure/msal-browser";

export interface AzureRepository {
    getInstance(): PublicClientApplication;
}
