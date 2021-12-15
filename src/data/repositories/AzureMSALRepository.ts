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
                redirectUri: window.location.href.split("/#")[0],
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
