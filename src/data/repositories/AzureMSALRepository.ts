import { AuthenticationScheme, PublicClientApplication } from "@azure/msal-browser";
import { Future, FutureData } from "../../domain/entities/Future";
import { AzureRepository } from "../../domain/repositories/AzureRepository";

const TENANT_ID = "f610c0b7-bd24-4b39-810b-3dc280afb590";
const CLIENT_ID = "192e3789-682d-4aeb-8d05-1a70acb86ab8";

const XMART_PROD_SCOPE = "api://712b0d0d-f9c5-4b7a-80d6-8a83ee014bca/odata";
const XMART_UAT_SCOPE = "api://b85362d6-c259-490b-bd51-c0a730011bef/odata";

export class AzureMSALRepository implements AzureRepository {
    public getInstance(): PublicClientApplication {
        return new PublicClientApplication({
            auth: {
                clientId: CLIENT_ID,
                authority: `https://login.microsoftonline.com/${TENANT_ID}`,
                redirectUri: window.location.href,
            },
        });
    }

    public getTokenPROD(): FutureData<string> {
        return this.getXmartToken(XMART_PROD_SCOPE);
    }

    public getTokenUAT(): FutureData<string> {
        return this.getXmartToken(XMART_UAT_SCOPE);
    }

    private getXmartToken(scope: string): FutureData<string> {
        const client = this.getInstance();
        const account = client.getAllAccounts()[0];
        if (!account) return Future.error("No active account");

        const response = this.getInstance().acquireTokenSilent({
            authenticationScheme: AuthenticationScheme.BEARER,
            scopes: [scope],
            account,
        });

        return Future.fromPromise(response).bimap(
            ({ accessToken }) => accessToken,
            error => String(error)
        );
    }
}
