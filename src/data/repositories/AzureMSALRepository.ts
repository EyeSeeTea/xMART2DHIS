import { AccountInfo, AuthenticationScheme, IPublicClientApplication } from "@azure/msal-browser";

export class AzureMSALRepository {
    // TODO
    private async getToken(instance: IPublicClientApplication, account: AccountInfo): Promise<string> {
        const response = await instance.acquireTokenSilent({
            authenticationScheme: AuthenticationScheme.BEARER,
            scopes: ["api://b85362d6-c259-490b-bd51-c0a730011bef/odata"],
            account,
        });

        console.log(response);
        fetch("https://portal-uat.who.int/xmart-api/odata/TRAINING_ARC/AGGREGATED", {
            headers: { Authorization: `Bearer ${response.accessToken}` },
        })
            .then(response => response.json())
            .then(data => console.log(data));

        return response.accessToken;
    }
}
