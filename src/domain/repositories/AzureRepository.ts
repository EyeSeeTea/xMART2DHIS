import { Configuration } from "@azure/msal-browser";

export interface AzureRepository {
    getConfig(): Configuration;
}
