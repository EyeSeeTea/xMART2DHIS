import { AuthenticationScheme, PublicClientApplication } from "@azure/msal-browser";
import { Future, FutureData } from "../../domain/entities/Future";
import { AzureRepository } from "../../domain/repositories/AzureRepository";
export class AzureMSALRepository implements AzureRepository {
    private tenantId: string;
    private clientId: string;

    constructor(tenantId: string, clientId: string) {
        this.tenantId = tenantId;
        this.clientId = clientId;
    }

    public getInstance(): PublicClientApplication {
        return new PublicClientApplication({
            auth: {
                clientId: this.clientId,
                authority: `https://login.microsoftonline.com/${this.tenantId}`,
                // Without the query string: the DHIS2 2.42+ global shell adds ?redirect=false,
                // and Azure only accepts the redirect URIs registered without it.
                redirectUri: window.location.origin + window.location.pathname,
            },
            cache: { cacheLocation: "localStorage" },
        });
    }

    public getToken(scope: string): FutureData<string> {
        const client = this.getInstance();
        const [account] = client.getAllAccounts();
        if (!account) return Future.error("The user is not logged in");

        const request = {
            authenticationScheme: AuthenticationScheme.BEARER,
            scopes: [scope],
            account,
        };

        return Future.fromPromise(client.acquireTokenSilent(request))
            .flatMapError(() => Future.fromPromise(client.acquireTokenPopup(request)))
            .bimap(
                ({ accessToken }) => accessToken,
                error => String(error)
            );
    }
}
