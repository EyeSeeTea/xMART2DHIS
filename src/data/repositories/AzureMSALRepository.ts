import { AccountInfo, AuthenticationScheme, Configuration, IPublicClientApplication } from "@azure/msal-browser";
import { AzureRepository } from "../../domain/repositories/AzureRepository";

const TENANT_ID = "f610c0b7-bd24-4b39-810b-3dc280afb590";
const CLIENT_ID = "192e3789-682d-4aeb-8d05-1a70acb86ab8";

const XMART_PROD_SCOPE = "api://712b0d0d-f9c5-4b7a-80d6-8a83ee014bca/odata";
const XMART_UAT_SCOPE = "api://b85362d6-c259-490b-bd51-c0a730011bef/odata";

export class AzureMSALRepository implements AzureRepository {
    public getConfig(): Configuration {
        return {
            auth: {
                clientId: CLIENT_ID,
                authority: `https://login.microsoftonline.com/${TENANT_ID}`,
                redirectUri: window.location.href,
            },
        };
    }

    // TODO
    private async getToken(instance: IPublicClientApplication, account: AccountInfo): Promise<string> {
        const response = await instance.acquireTokenSilent({
            authenticationScheme: AuthenticationScheme.BEARER,
            scopes: [XMART_PROD_SCOPE, XMART_UAT_SCOPE],
            account,
        });

        /**console.log(response);
        fetch("https://portal-uat.who.int/xmart-api/odata/TRAINING_ARC/AGGREGATED", {
            headers: { Authorization: `Bearer ${response.accessToken}` },
        })
            .then(response => response.json())
            .then(data => console.log(data));**/

        return response.accessToken;
    }
}
