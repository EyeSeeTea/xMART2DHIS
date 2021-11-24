import { AuthenticationScheme, PublicClientApplication } from "@azure/msal-browser";
import { Future, FutureData } from "../../domain/entities/Future";
import { AzureRepository } from "../../domain/repositories/AzureRepository";

const TENANT_ID = "f610c0b7-bd24-4b39-810b-3dc280afb590";
const CLIENT_ID = "192e3789-682d-4aeb-8d05-1a70acb86ab8";

const Scopes = {
    XMART_PROD_SCOPE: "api://712b0d0d-f9c5-4b7a-80d6-8a83ee014bca/.default",
    XMART_UAT_SCOPE: "api://b85362d6-c259-490b-bd51-c0a730011bef/.default",
    XMART_PRIVATE_UAT_SCOPE: "api://a40621b1-fd6e-421b-bc44-c406b629e967/.default",
    XMART_PRIVATE_DEV_SCOPE: "api://509fab01-ac48-4bdc-b1d6-6cdb4836d9c2/.default",
    XMART_PRIVATE_PROD_SCOPE: "api://af17443e-8983-46ad-942d-e56b89ab44f2/.default",
};

export class AzureMSALRepository implements AzureRepository {
    public getInstance(): PublicClientApplication {
        return new PublicClientApplication({
            auth: {
                clientId: CLIENT_ID,
                authority: `https://login.microsoftonline.com/${TENANT_ID}`,
                redirectUri: window.location.href.split("/#")[0],
            },
        });
    }

    public getTokenPROD(): FutureData<string> {
        return this.getXmartToken(Scopes.XMART_PROD_SCOPE);
    }

    public getTokenUAT(): FutureData<string> {
        return this.getXmartToken(Scopes.XMART_UAT_SCOPE);
    }

    private getXmartToken(scope: string): FutureData<string> {
        const client = this.getInstance();
        const [account] = client.getAllAccounts();
        if (!account) return Future.error("No active account");

        const request = {
            authenticationScheme: AuthenticationScheme.BEARER,
            scopes: [scope],
            account,
        };

        return Future.fromPromise(client.acquireTokenSilent(request))
            .flatMapError(error => {
                const redirect = Future.fromPromise(client.acquireTokenRedirect(request));
                return redirect.flatMap(() => Future.error(error));
            })
            .bimap(
                ({ accessToken }) => accessToken,
                error => String(error)
            );
    }
}
